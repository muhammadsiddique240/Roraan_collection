"""Product URL configuration."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BrandViewSet, CategoryViewSet, ProductViewSet

router = DefaultRouter()
router.register('brands', BrandViewSet, basename='brand')
router.register('categories', CategoryViewSet, basename='category')

product_list_create = ProductViewSet.as_view({'get': 'list', 'post': 'create'})
product_detail = ProductViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy',
})
product_featured = ProductViewSet.as_view({'get': 'featured'})
product_sizes = ProductViewSet.as_view({'get': 'sizes'})
product_increment_views = ProductViewSet.as_view({'post': 'increment_views'})
product_add_gallery = ProductViewSet.as_view({'post': 'add_gallery_image'})
product_delete_gallery = ProductViewSet.as_view({'delete': 'delete_gallery_image'})

urlpatterns = [
    path('', product_list_create, name='product-list-create'),
    path('featured/', product_featured, name='product-featured'),
    path('sizes/', product_sizes, name='product-sizes'),
    path('meta/', include(router.urls)),
    path('<uuid:pk>/', product_detail, name='product-detail'),
    path('<uuid:pk>/increment_views/', product_increment_views, name='product-increment-views'),
    path('<uuid:pk>/add-gallery-image/', product_add_gallery, name='product-add-gallery'),
    path('<uuid:pk>/delete-gallery/<uuid:image_id>/', product_delete_gallery, name='product-delete-gallery'),
]
