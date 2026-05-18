"""Analytics URL configuration."""
from django.urls import path
from .views import DashboardStatsView, SalesAnalyticsView

urlpatterns = [
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('sales/', SalesAnalyticsView.as_view(), name='sales-analytics'),
]
