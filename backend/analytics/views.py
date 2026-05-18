"""Analytics views for sales dashboard."""
from django.db.models import Count, Sum, Q
from django.db.models.functions import TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from datetime import datetime

from products.models import Product, Brand
from orders.models import Order


class DashboardStatsView(APIView):
    """Overview cards for dashboard."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Product stats
        total_in_stock = Product.objects.filter(status='available').count()
        total_sold = Product.objects.filter(status='sold').count()
        total_categories = Brand.objects.filter(is_active=True).count()

        # Order stats
        order_counts = Order.objects.values('status').annotate(count=Count('id'))
        status_map = {item['status']: item['count'] for item in order_counts}

        # Revenue & Profit
        confirmed_orders = Order.objects.filter(status__in=['confirmed', 'shipped', 'delivered'])
        total_revenue = confirmed_orders.aggregate(total=Sum('total_amount'))['total'] or 0
        total_buying_cost = confirmed_orders.aggregate(total=Sum('product__buying_price'))['total'] or 0
        cod_fee_total = confirmed_orders.count() * 400
        total_profit = float(total_revenue) - float(total_buying_cost) - cod_fee_total

        # Most viewed items
        most_viewed = Product.objects.filter(status='available').order_by('-view_count')[:5]
        viewed_data = [{
            'id': str(p.id),
            'title': p.title,
            'views': p.view_count,
            'image': p.image.url if p.image else None
        } for p in most_viewed]

        return Response({
            'total_in_stock': total_in_stock,
            'total_sold': total_sold,
            'total_categories': total_categories,
            'total_revenue': float(total_revenue),
            'total_profit': total_profit,
            'most_viewed': viewed_data,
            'order_counts': {
                'pending': status_map.get('pending', 0),
                'confirmed': status_map.get('confirmed', 0),
                'shipped': status_map.get('shipped', 0),
                'delivered': status_map.get('delivered', 0),
                'canceled': status_map.get('canceled', 0),
                'total': sum(status_map.values()) if status_map else 0,
            }
        })


class SalesAnalyticsView(APIView):
    """Monthly/yearly sales analytics with filters."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        year = request.query_params.get('year', datetime.now().year)
        month = request.query_params.get('month', None)

        orders_qs = Order.objects.filter(
            status__in=['confirmed', 'shipped', 'delivered'],
            created_at__year=year
        )

        if month:
            orders_qs = orders_qs.filter(created_at__month=month)

        # Monthly breakdown
        monthly_data = orders_qs.annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            count=Count('id'),
            revenue=Sum('total_amount')
        ).order_by('month')

        # Top brands by sales
        brand_sales = orders_qs.values(
            'product__brand__name'
        ).annotate(
            count=Count('id'),
            revenue=Sum('total_amount')
        ).order_by('-count')[:10]

        # Summary
        summary = orders_qs.aggregate(
            total_orders=Count('id'),
            total_revenue=Sum('total_amount')
        )

        return Response({
            'year': int(year),
            'month': int(month) if month else None,
            'summary': {
                'total_orders': summary['total_orders'] or 0,
                'total_revenue': float(summary['total_revenue'] or 0),
            },
            'monthly_data': [
                {
                    'month': item['month'].strftime('%B %Y') if item['month'] else '',
                    'count': item['count'],
                    'revenue': float(item['revenue'] or 0),
                }
                for item in monthly_data
            ],
            'brand_sales': [
                {
                    'brand': item['product__brand__name'],
                    'count': item['count'],
                    'revenue': float(item['revenue'] or 0),
                }
                for item in brand_sales
            ],
        })
