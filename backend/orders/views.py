"""
Order views with Dual-Payment logic and race condition prevention.
Supports both Website Payment and WhatsApp checkout paths.
"""
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

from .models import Order
from .serializers import OrderCreateSerializer, OrderDetailSerializer, OrderStatusUpdateSerializer
from products.models import Product
from .email_templates import (
    order_placed_template,
    order_shipped_template,
    order_delivered_template,
    order_canceled_template,
)


class OrderFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name='status')
    checkout_method = django_filters.CharFilter(field_name='checkout_method')
    month = django_filters.NumberFilter(field_name='created_at__month')
    year = django_filters.NumberFilter(field_name='created_at__year')

    class Meta:
        model = Order
        fields = ['status', 'checkout_method', 'month', 'year']


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related('product', 'product__brand').all()
    filter_backends = [DjangoFilterBackend]
    filterset_class = OrderFilter
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        if self.action == 'update_status':
            return OrderStatusUpdateSerializer
        return OrderDetailSerializer

    def get_permissions(self):
        return [AllowAny()]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Place an order with race condition prevention.
        Supports both website payment and WhatsApp checkout.
        """
        from django.utils import timezone
        from datetime import timedelta

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product_id = serializer.validated_data['product'].id
        checkout_method = serializer.validated_data.get('checkout_method', 'whatsapp')

        # Lock the product row to prevent concurrent purchases
        try:
            product = Product.objects.select_for_update().get(
                id=product_id, status='available'
            )
        except Product.DoesNotExist:
            return Response(
                {'error': 'Sorry! This item has just been sold or reserved. Single-SKU items can only be purchased once.'},
                status=status.HTTP_409_CONFLICT
            )

        # Mark product as reserved immediately to prevent double-selling
        product.status = 'reserved'
        product.reserved_until = timezone.now() + timedelta(minutes=30)
        product.save(update_fields=['status', 'reserved_until'])

        # Determine initial order status based on checkout method
        if checkout_method == 'website':
            initial_status = 'pending_verification'
        else:
            initial_status = 'whatsapp_pending'

        # Create the order
        order = serializer.save(
            total_amount=product.sale_price + 400,
            status=initial_status,
        )

        # Return order confirmation
        self._send_status_email(order, 'pending')
        return Response(
            OrderDetailSerializer(order, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    @transaction.atomic
    def accept(self, request, pk=None):
        """Admin: Accept/Confirm an order. Finalizes the sale."""
        order = self.get_object()

        if order.status not in ('pending_verification', 'whatsapp_pending'):
            return Response(
                {'error': 'Only pending orders can be accepted.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = 'confirmed'
        order.save(update_fields=['status', 'updated_at'])

        # Finalize the product as sold
        product = Product.objects.select_for_update().get(id=order.product_id)
        product.status = 'sold'
        product.reserved_until = None
        product.save(update_fields=['status', 'reserved_until'])

        self._send_status_email(order, 'confirmed')
        return Response(OrderDetailSerializer(order, context={'request': request}).data)

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    @transaction.atomic
    def reject(self, request, pk=None):
        """Admin: Reject an order. Releases the product back to available."""
        order = self.get_object()

        if order.status in ('delivered', 'rejected', 'canceled'):
            return Response(
                {'error': 'This order cannot be rejected.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = 'rejected'
        order.save(update_fields=['status', 'updated_at'])

        # Release the product back to available
        product = Product.objects.select_for_update().get(id=order.product_id)
        product.status = 'available'
        product.reserved_until = None
        product.save(update_fields=['status', 'reserved_until'])

        self._send_status_email(order, 'canceled')
        return Response(OrderDetailSerializer(order, context={'request': request}).data)

    @action(detail=False, methods=['patch'], permission_classes=[IsAdminUser])
    @transaction.atomic
    def bulk_status_update(self, request):
        """Update multiple orders status in one request."""
        order_ids = request.data.get('order_ids', [])
        new_status = request.data.get('status')

        if not order_ids or not new_status:
            return Response({'error': 'order_ids and status are required'}, status=status.HTTP_400_BAD_REQUEST)

        orders = Order.objects.filter(id__in=order_ids)
        updated_count = 0

        for order in orders:
            old_status = order.status
            order.status = new_status

            # Logic: If canceling/rejecting, release product
            if new_status in ('canceled', 'rejected') and old_status not in ('canceled', 'rejected'):
                product = order.product
                product.status = 'available'
                product.reserved_until = None
                product.save(update_fields=['status', 'reserved_until'])

            # Logic: If confirming, finalize the sale
            if new_status == 'confirmed' and old_status in ('pending_verification', 'whatsapp_pending'):
                product = order.product
                product.status = 'sold'
                product.reserved_until = None
                product.save(update_fields=['status', 'reserved_until'])

            order.save()
            updated_count += 1

            if new_status in ('shipped', 'delivered', 'canceled'):
                self._send_status_email(order, new_status)

        return Response({'message': f'Successfully updated {updated_count} orders'})

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update order status and send email notification."""
        order = self.get_object()
        serializer = OrderStatusUpdateSerializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        old_status = order.status

        # If canceling/rejecting, make product available again
        if new_status in ('canceled', 'rejected') and old_status not in ('canceled', 'rejected'):
            product = order.product
            product.status = 'available'
            product.reserved_until = None
            product.save(update_fields=['status', 'reserved_until'])

        # If confirming, finalize the sale
        if new_status == 'confirmed' and old_status in ('pending_verification', 'whatsapp_pending'):
            product = order.product
            product.status = 'sold'
            product.reserved_until = None
            product.save(update_fields=['status', 'reserved_until'])

        serializer.save()

        if new_status in ('shipped', 'delivered', 'canceled'):
            self._send_status_email(order, new_status)

        return Response(OrderDetailSerializer(order, context={'request': request}).data)

    @action(detail=True, methods=['get'], permission_classes=[IsAdminUser], url_path='trust-metrics')
    def trust_metrics(self, request, pk=None):
        """Get trust metrics for this order's customer phone (admin only)."""
        order = self.get_object()
        return Response(order.trust_metrics)

    def _send_status_email(self, order, new_status):
        """Send email notification to customer on status change."""
        if not order.customer_email:
            return
        order_id = order.order_code or str(order.id)[:8].upper()
        product_title = order.product.title
        if new_status == 'pending':
            subject = 'Thanks for your order! We are verifying your details.'
            html_message = order_placed_template(order.customer_name, order_id, product_title)
        elif new_status == 'confirmed':
            subject = 'Your order has been confirmed! We are packing your kicks.'
            html_message = order_placed_template(order.customer_name, order_id, product_title)
        elif new_status == 'shipped':
            subject = 'Your Swag Shoes are on the way! Here are your tracking details.'
            html_message = order_shipped_template(
                order.customer_name, order_id, product_title, f"Order #{order_id}"
            )
        elif new_status == 'delivered':
            subject = 'Enjoy your kicks! Leave us a review.'
            html_message = order_delivered_template(order.customer_name, order_id, product_title)
        elif new_status == 'canceled':
            subject = 'Your order has been canceled. Contact support if this was a mistake.'
            html_message = order_canceled_template(order.customer_name, order_id, product_title)
        else:
            return

        message = f"Order update for {order_id}: {new_status}"

        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[order.customer_email],
                html_message=html_message,
                fail_silently=True,
            )
        except Exception:
            pass
