"""Order URL configuration with accept/reject actions."""
from django.urls import path
from .views import OrderViewSet

order_list_create = OrderViewSet.as_view({'get': 'list', 'post': 'create'})
order_detail = OrderViewSet.as_view({'get': 'retrieve'})
order_update = OrderViewSet.as_view({'patch': 'partial_update'})
order_update_status = OrderViewSet.as_view({'patch': 'update_status'})
order_accept = OrderViewSet.as_view({'post': 'accept'})
order_reject = OrderViewSet.as_view({'post': 'reject'})
order_bulk = OrderViewSet.as_view({'patch': 'bulk_status_update'})
order_trust_metrics = OrderViewSet.as_view({'get': 'trust_metrics'})

urlpatterns = [
    path('', order_list_create, name='order-list-create'),
    path('bulk_status_update/', order_bulk, name='order-bulk-status'),
    path('<uuid:pk>/', order_detail, name='order-detail'),
    path('<uuid:pk>/update/', order_update, name='order-update'),
    path('<uuid:pk>/status/', order_update_status, name='order-status-update'),
    path('<uuid:pk>/accept/', order_accept, name='order-accept'),
    path('<uuid:pk>/reject/', order_reject, name='order-reject'),
    path('<uuid:pk>/trust-metrics/', order_trust_metrics, name='order-trust-metrics'),
]
