"""Order models with Dual-Payment support (Website + WhatsApp)."""
import uuid
import re
from django.db import models
from products.models import Product


class Order(models.Model):
    """
    Order model for single-SKU products.
    Supports two checkout methods: direct website payment and WhatsApp inquiry.
    """
    STATUS_CHOICES = [
        ('pending_verification', 'Pending Verification'),
        ('confirmed', 'Confirmed'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('rejected', 'Rejected'),
        ('canceled', 'Canceled'),
        ('whatsapp_pending', 'WhatsApp Pending'),
    ]

    CHECKOUT_METHOD_CHOICES = [
        ('website', 'Website Payment'),
        ('whatsapp', 'WhatsApp Order'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_code = models.CharField(max_length=20, unique=True, blank=True, null=True, db_index=True)

    # Product reference
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='orders')

    # Customer information
    customer_name = models.CharField(max_length=255)
    customer_email = models.EmailField(blank=True, default='')
    customer_phone = models.CharField(max_length=20)

    # Shipping address
    address = models.TextField()
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10, blank=True)

    # Pricing snapshot
    total_amount = models.DecimalField(max_digits=10, decimal_places=0)

    # Order status
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='pending_verification')

    # Checkout method
    checkout_method = models.CharField(
        max_length=10,
        choices=CHECKOUT_METHOD_CHOICES,
        default='whatsapp',
    )

    # Payment proof (website checkout)
    payment_screenshot = models.ImageField(upload_to='payment_screenshots/', blank=True, null=True)
    transaction_id = models.CharField(max_length=100, blank=True, default='')

    # Notes
    notes = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.order_code} - {self.customer_name} - {self.product.title}"

    @property
    def trust_metrics(self):
        """Calculates trust stats for this phone number."""
        orders = Order.objects.filter(customer_phone=self.customer_phone)
        total = orders.count()
        delivered = orders.filter(status='delivered').count()
        canceled = orders.filter(status__in=['canceled', 'rejected']).count()
        return {
            'total_orders': total,
            'delivered_count': delivered,
            'canceled_count': canceled,
            'trust_score': round(delivered / total * 100, 1) if total > 0 else 0
        }

    def save(self, *args, **kwargs):
        if not self.order_code:
            existing_codes = Order.objects.exclude(order_code__isnull=True).values_list('order_code', flat=True)
            max_num = 100
            for code in existing_codes:
                match = re.fullmatch(r'ORD_(\d+)', code or '')
                if match:
                    max_num = max(max_num, int(match.group(1)))
            next_num = max_num + 1
            candidate = f"ORD_{next_num}"
            while Order.objects.filter(order_code=candidate).exists():
                next_num += 1
                candidate = f"ORD_{next_num}"
            self.order_code = candidate

        # Enforce COD charge calculation
        if self.product:
            self.total_amount = self.product.sale_price + 400

        super().save(*args, **kwargs)
