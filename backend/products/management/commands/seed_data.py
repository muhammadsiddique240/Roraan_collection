"""Management command to seed initial data."""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from products.models import Brand, Category


class Command(BaseCommand):
    help = 'Seed initial brands, categories, and admin user'

    def handle(self, *args, **options):
        # Create superuser
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@swagshoes.pk',
                password='admin123',
                first_name='Admin',
                last_name='Swag'
            )
            self.stdout.write(self.style.SUCCESS('✅ Admin user created (admin/admin123)'))

        # Create brands
        brands = [
            'Nike', 'Jordan', 'Adidas', 'New Balance', 'Puma',
            'Reebok', 'Converse', 'Vans', 'ASICS', 'Salomon',
            'Under Armour', 'Skechers', 'Fila', 'Hoka', 'Brooks',
        ]
        for name in brands:
            Brand.objects.get_or_create(
                name=name,
                defaults={'slug': name.lower().replace(' ', '-')}
            )
        self.stdout.write(self.style.SUCCESS(f'✅ {len(brands)} brands seeded'))

        # Create categories
        categories = [
            'Running', 'Basketball', 'Casual', 'Skateboarding',
            'Trail', 'Lifestyle', 'Training', 'Walking',
        ]
        for name in categories:
            Category.objects.get_or_create(
                name=name,
                defaults={'slug': name.lower().replace(' ', '-')}
            )
        self.stdout.write(self.style.SUCCESS(f'✅ {len(categories)} categories seeded'))

        self.stdout.write(self.style.SUCCESS('🎉 Seed completed!'))
