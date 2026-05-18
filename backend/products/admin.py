from django.contrib import admin
from .models import Brand, Category, Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['title', 'brand', 'size_pk', 'condition', 'sale_price', 'status', 'is_featured']
    list_filter = ['status', 'brand', 'condition', 'is_featured']
    search_fields = ['title', 'brand__name']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ProductImageInline]
