"""Product views and API endpoints."""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.text import slugify
from django.db.models import Q
import django_filters

from .models import Brand, Category, Product, ProductImage
from .serializers import (
    BrandSerializer, CategorySerializer,
    ProductListSerializer, ProductDetailSerializer, ProductCreateSerializer,
    ProductImageSerializer,
)


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

    def perform_create(self, serializer):
        name = serializer.validated_data.get('name', '')
        slug = serializer.validated_data.get('slug', slugify(name))
        serializer.save(slug=slug)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

    def perform_create(self, serializer):
        name = serializer.validated_data.get('name', '')
        slug = serializer.validated_data.get('slug', slugify(name))
        serializer.save(slug=slug)


class ProductFilter(django_filters.FilterSet):
    brand = django_filters.CharFilter(field_name='brand__slug')
    category = django_filters.CharFilter(method='filter_category')
    size = django_filters.CharFilter(field_name='size_pk')
    condition = django_filters.CharFilter(field_name='condition')
    min_price = django_filters.NumberFilter(field_name='sale_price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='sale_price', lookup_expr='lte')
    status = django_filters.CharFilter(field_name='status')
    is_featured = django_filters.BooleanFilter(field_name='is_featured')

    class Meta:
        model = Product
        fields = ['brand', 'category', 'size', 'condition', 'status', 'is_featured']

    def filter_category(self, queryset, name, value):
        """Include unisex products when filtering by Men or Women."""
        if value.lower() in ('men', 'women'):
            return queryset.filter(
                Q(category__slug__iexact=value) | Q(is_unisex=True)
            )
        return queryset.filter(category__slug__iexact=value)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('brand', 'category').prefetch_related('gallery')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['title', 'brand__name', 'description']
    ordering_fields = ['sale_price', 'created_at', 'condition']
    lookup_field = 'pk'

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'featured', 'sizes', 'increment_views']:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateSerializer
        return ProductDetailSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        # Public views can see available, coming_soon, and sold (Graveyard) products
        if not (self.request.user and self.request.user.is_staff):
            qs = qs.filter(status__in=['available', 'coming_soon', 'sold'])
        latest = self.request.query_params.get('latest')
        if latest in ('1', 'true', 'True'):
            # Fetch products that are either manually featured OR marked as new and added within 7 days
            from django.utils import timezone
            from datetime import timedelta
            seven_days_ago = timezone.now() - timedelta(days=7)
            
            qs = qs.filter(
                Q(is_featured=True) | 
                Q(is_new_arrival=True, created_at__gte=seven_days_ago) |
                Q(category__name__iexact='Latest')
            ).order_by('-created_at').distinct()[:4]
        limit = self.request.query_params.get('limit')
        if limit and str(limit).isdigit():
            qs = qs[: int(limit)]
        return qs

    def perform_create(self, serializer):
        title = serializer.validated_data.get('title', '')
        slug = serializer.validated_data.get('slug', slugify(title))
        # Ensure unique slug
        base_slug = slug
        counter = 1
        while Product.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        serializer.save(slug=slug)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured/new drops products."""
        products = self.get_queryset().filter(
            is_featured=True, status='available'
        )[:8]
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def increment_views(self, request, pk=None):
        """Increment product view count."""
        product = self.get_object()
        product.view_count += 1
        product.save(update_fields=['view_count'])
        return Response({'view_count': product.view_count}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def sizes(self, request):
        """Get all available unique sizes for filtering."""
        sizes = Product.objects.filter(
            status='available'
        ).values_list('size_pk', flat=True).distinct().order_by('size_pk')
        return Response(list(sizes))

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def add_gallery_image(self, request, slug=None):
        """Add a gallery image to a product."""
        product = self.get_object()
        image = request.FILES.get('image')
        alt_text = request.data.get('alt_text', '')
        if not image:
            return Response({'error': 'No image provided'}, status=400)
        gallery_img = ProductImage.objects.create(
            product=product, image=image, alt_text=alt_text,
            order=product.gallery.count()
        )
        return Response(ProductImageSerializer(gallery_img, context={'request': request}).data, status=201)

    @action(detail=True, methods=['delete'], permission_classes=[IsAdminUser], url_path='delete-gallery/(?P<image_id>[^/.]+)')
    def delete_gallery_image(self, request, slug=None, image_id=None):
        """Remove a gallery image from a product."""
        ProductImage.objects.filter(id=image_id, product__slug=slug).delete()
        return Response(status=204)
