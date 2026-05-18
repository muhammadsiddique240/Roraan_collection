"""Order serializers with Dual-Payment support."""
from rest_framework import serializers
from .models import Order
from products.serializers import ProductListSerializer


class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for placing a new order (public checkout).
    Handles both website payment (with screenshot) and WhatsApp orders.
    """
    class Meta:
        model = Order
        fields = [
            'product', 'customer_name', 'customer_email',
            'customer_phone', 'address', 'city', 'postal_code', 'notes',
            'checkout_method', 'payment_screenshot', 'transaction_id',
        ]

    def validate_product(self, value):
        if value.status != 'available':
            raise serializers.ValidationError(
                'This item is no longer available. It may have been sold.'
            )
        return value

    def validate(self, attrs):
        method = attrs.get('checkout_method', 'whatsapp')
        if method == 'website':
            if not attrs.get('payment_screenshot'):
                raise serializers.ValidationError({
                    'payment_screenshot': 'Payment screenshot is required for website payment.'
                })
            if not attrs.get('transaction_id'):
                raise serializers.ValidationError({
                    'transaction_id': 'Transaction ID is required for website payment.'
                })
        return attrs


class OrderDetailSerializer(serializers.ModelSerializer):
    """Full order serializer with product details (admin view)."""
    product = ProductListSerializer(read_only=True)
    payment_screenshot_url = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_code', 'product', 'customer_name', 'customer_email',
            'customer_phone', 'address', 'city', 'postal_code',
            'total_amount', 'status', 'checkout_method',
            'payment_screenshot', 'payment_screenshot_url',
            'transaction_id', 'notes', 'created_at', 'updated_at',
        ]

    def get_payment_screenshot_url(self, obj):
        if obj.payment_screenshot:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.payment_screenshot.url)
            return obj.payment_screenshot.url
        return None


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating order status (admin only)."""
    class Meta:
        model = Order
        fields = ['status']
