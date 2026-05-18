
import os
import django
import random
from decimal import Decimal
from django.core.files import File
from pathlib import Path

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from products.models import Product, Brand, Category

def populate():
    print("Populating products...")
    
    # Get brands and categories
    brands = list(Brand.objects.all())
    categories = list(Category.objects.all())
    
    if not brands or not categories:
        print("Please run seed_data command first to create brands and categories.")
        return

    # Sample product data
    product_samples = [
        {"title": "Air Jordan 1 Retro High OG", "description": "Classic Chicago colorway, iconic silhouette."},
        {"title": "Yeezy Boost 350 V2", "description": "Comfort meets style with Primeknit upper and Boost cushioning."},
        {"title": "Dunk Low Panda", "description": "The most versatile sneaker in your collection."},
        {"title": "New Balance 550", "description": "Retro basketball style for everyday wear."},
        {"title": "Air Force 1 '07", "description": "The legend lives on in this classic sneaker."},
        {"title": "Adidas Forum Low", "description": "80s hoops icon with a modern twist."},
        {"title": "Nike SB Dunk Low", "description": "Built for skating, styled for the streets."},
        {"title": "Jordan 4 Retro Military Black", "description": "Clean and classic, a must-have for every collector."},
    ]

    # Find some images to use
    base_dir = Path(__file__).resolve().parent
    image_paths = list(base_dir.parent.glob("WhatsApp Image*.jpeg"))
    
    if not image_paths:
        print("No WhatsApp images found in the root. Using dummy paths.")

    for i, sample in enumerate(product_samples):
        brand = random.choice(brands)
        category = random.choice(categories)
        
        orig_price = random.randint(15000, 45000)
        sale_price = orig_price - random.randint(2000, 8000)
        
        size_pk = str(random.choice([7, 8, 9, 10, 11, 12]))
        
        product, created = Product.objects.get_or_create(
            title=sample["title"],
            brand=brand,
            defaults={
                "slug": f"{sample['title'].lower().replace(' ', '-')}-{i}",
                "category": category,
                "description": sample["description"],
                "size_pk": size_pk,
                "size_eu": str(int(size_pk) + 33),
                "size_cm": str(float(size_pk) * 2.5),
                "condition": random.choice(['10/10', '9/10', '8/10', '7/10']),
                "original_price": Decimal(orig_price),
                "sale_price": Decimal(sale_price),
                "status": "available",
                "is_featured": random.choice([True, False]),
                "is_new_arrival": True,
            }
        )
        
        if created:
            print(f"Created product: {product.title}")
            # Assign an image if available
            if image_paths:
                img_path = random.choice(image_paths)
                with open(img_path, 'rb') as f:
                    product.image.save(img_path.name, File(f), save=True)
        else:
            print(f"Product already exists: {product.title}")

    print("Done populating products!")

if __name__ == "__main__":
    populate()
