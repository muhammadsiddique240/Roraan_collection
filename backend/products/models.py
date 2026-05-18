"""Product models for Single-SKU sneaker marketplace."""
import uuid
import re
from django.db import models
from django.utils import timezone
from datetime import timedelta


class Brand(models.Model):
    """Sneaker brand (Nike, Jordan, Adidas, etc.)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    logo = models.ImageField(upload_to='brands/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Category(models.Model):
    """Product category (Running, Basketball, Casual, etc.)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name


class Product(models.Model):
    """
    Single-SKU product model. Each product is unique — once sold, 
    it is permanently marked as sold and removed from active inventory.
    """
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('reserved', 'Reserved'),
        ('sold', 'Sold'),
        ('coming_soon', 'Coming Soon'),
        ('deleted', 'Deleted'),
    ]

    CONDITION_CHOICES = [
        ('10/10', 'Brand New / Deadstock'),
        ('9/10', 'Excellent'),
        ('8/10', 'Very Good'),
        ('7/10', 'Good'),
        ('6/10', 'Gently Used'),
        ('5/10', 'Fair'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product_code = models.CharField(max_length=20, unique=True, blank=True, null=True, db_index=True)
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    
    # Sizing - Multiple formats for PK market
    size_pk = models.CharField(max_length=10, verbose_name='Size (PK)')
    size_eu = models.CharField(max_length=10, blank=True, verbose_name='Size (EU)')
    size_cm = models.CharField(max_length=10, blank=True, verbose_name='Size (CM)')
    
    condition = models.CharField(max_length=10, choices=CONDITION_CHOICES, default='8/10')
    
    # Pricing
    original_price = models.DecimalField(max_digits=10, decimal_places=0, help_text='Original MRP in PKR')
    sale_price = models.DecimalField(max_digits=10, decimal_places=0, help_text='Sale price in PKR')
    buying_price = models.DecimalField(max_digits=10, decimal_places=0, default=0, help_text='Purchase cost from supplier')
    
    # Analytics
    view_count = models.PositiveIntegerField(default=0)
    reserved_until = models.DateTimeField(null=True, blank=True)
    
    # Status - Critical for Single-SKU logic
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available', db_index=True)
    
    # Primary image
    image = models.ImageField(upload_to='products/')
    
    is_featured = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=True)
    is_unisex = models.BooleanField(default=False, help_text='Display in both Men and Women sections')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'brand']),
            models.Index(fields=['status', 'size_pk']),
        ]

    def __str__(self):
        return f"{self.product_code} - {self.brand.name} {self.title} - Size {self.size_pk}"

    def save(self, *args, **kwargs):
        if not self.product_code:
            existing_codes = Product.objects.exclude(product_code__isnull=True).values_list('product_code', flat=True)
            max_num = 100
            for code in existing_codes:
                match = re.fullmatch(r'PRO_(\d+)', code or '')
                if match:
                    max_num = max(max_num, int(match.group(1)))
            next_num = max_num + 1
            candidate = f"PRO_{next_num}"
            while Product.objects.filter(product_code=candidate).exists():
                next_num += 1
                candidate = f"PRO_{next_num}"
            self.product_code = candidate
        super().save(*args, **kwargs)

    @property
    def discount_percentage(self):
        if self.original_price and self.original_price > 0:
            return int(((self.original_price - self.sale_price) / self.original_price) * 100)
        return 0

    @property
    def condition_label(self):
        labels = {
            '10/10': 'Deadstock',
            '9/10': 'Excellent',
            '8/10': 'Very Good',
            '7/10': 'Good',
            '6/10': 'Gently Used',
            '5/10': 'Fair',
        }
        return labels.get(self.condition, self.condition)

    @property
    def is_available(self):
        return self.status == 'available'

    @property
    def is_new(self):
        """Dynamic check for New Arrival badge."""
        if not self.is_new_arrival:
            return False
        return (timezone.now() - self.created_at) <= timedelta(days=7)


class ProductImage(models.Model):
    """Additional images for product gallery (closeups, soles, insoles, etc.)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='gallery')
    image = models.ImageField(upload_to='products/gallery/')
    alt_text = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Image for {self.product.title}"
