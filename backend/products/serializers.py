"""Product serializers."""
from rest_framework import serializers
from django.utils.text import slugify
from .models import Brand, Category, Product, ProductImage


class BrandSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'logo', 'is_active', 'product_count']

    def get_product_count(self, obj):
        return obj.products.filter(status='available').count()


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'is_active', 'product_count']

    def get_product_count(self, obj):
        return obj.products.filter(status='available').count()


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'order']


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product grid/list views."""
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True, default='')
    discount_percentage = serializers.ReadOnlyField()
    condition_label = serializers.ReadOnlyField()
    gallery = ProductImageSerializer(many=True, read_only=True)
    is_new = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'product_code', 'title', 'slug', 'brand_name', 'category_name',
            'size_pk', 'size_eu', 'size_cm', 'condition', 'condition_label',
            'original_price', 'sale_price', 'discount_percentage',
            'image', 'gallery', 'status', 'is_featured', 'is_new_arrival', 'is_new', 'is_unisex', 'created_at',
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full serializer for product detail page."""
    brand = BrandSerializer(read_only=True)
    brand_id = serializers.UUIDField(write_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    gallery = ProductImageSerializer(many=True, read_only=True)
    discount_percentage = serializers.ReadOnlyField()
    condition_label = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'product_code', 'title', 'slug', 'description',
            'brand', 'brand_id', 'category', 'category_id',
            'size_pk', 'size_eu', 'size_cm',
            'condition', 'condition_label',
            'original_price', 'sale_price', 'discount_percentage',
            'image', 'gallery', 'status', 'is_featured', 'is_new_arrival', 'is_new', 'is_unisex',
            'created_at', 'updated_at',
        ]


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating products (admin)."""
    brand = serializers.CharField()
    category = serializers.CharField(required=False, allow_blank=True)
    gallery_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Product
        fields = [
            'id', 'product_code', 'title', 'slug', 'description',
            'brand', 'category',
            'size_pk', 'size_eu', 'size_cm',
            'condition', 'original_price', 'sale_price',
            'image', 'gallery_images', 'status', 'is_featured', 'is_new_arrival', 'is_unisex',
        ]
        extra_kwargs = {
            'product_code': {'required': False, 'read_only': True},
            'slug': {'required': False},
            'image': {'required': False},
        }

    def _build_unique_slug(self, model_cls, base_name: str) -> str:
        base_slug = slugify(base_name) or 'item'
        slug = base_slug
        counter = 1
        while model_cls.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        return slug

    def _get_or_create_brand(self, brand_name: str) -> Brand:
        existing = Brand.objects.filter(name__iexact=brand_name).first()
        if existing:
            return existing
        return Brand.objects.create(
            name=brand_name,
            slug=self._build_unique_slug(Brand, brand_name),
        )

    def _get_or_create_category(self, category_name: str) -> Category:
        existing = Category.objects.filter(name__iexact=category_name).first()
        if existing:
            return existing
        return Category.objects.create(
            name=category_name,
            slug=self._build_unique_slug(Category, category_name),
        )

    def create(self, validated_data):
        brand_name = validated_data.pop('brand')
        category_name = validated_data.pop('category', '')
        brand = self._get_or_create_brand(brand_name)
        category = None
        if category_name:
            category = self._get_or_create_category(category_name)
        gallery_images = validated_data.pop('gallery_images', [])
        product = Product.objects.create(brand=brand, category=category, **validated_data)
        for i, img in enumerate(gallery_images):
            ProductImage.objects.create(product=product, image=img, order=i)
        return product

    def update(self, instance, validated_data):
        brand_name = validated_data.pop('brand', None)
        category_name = validated_data.pop('category', None)
        if brand_name:
            brand = self._get_or_create_brand(brand_name)
            instance.brand = brand
        if category_name is not None:
            if category_name:
                category = self._get_or_create_category(category_name)
                instance.category = category
            else:
                instance.category = None
        gallery_images = validated_data.pop('gallery_images', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if gallery_images:
            for i, img in enumerate(gallery_images):
                ProductImage.objects.create(product=instance, image=img, order=i)
        return instance
