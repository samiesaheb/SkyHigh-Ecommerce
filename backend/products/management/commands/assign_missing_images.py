import os
import re
from django.core.management.base import BaseCommand
from products.models import Product

class Command(BaseCommand):
    help = "Assigns missing images to products based on product name and brand folder."

    brand_folder_map = {
        "Geometry": "geometry",
        "Hair Care": "haircare",
        "Facial Care": "facialcare",
        "Body & Skin Care": "bodyandskincare",
    }

    def slugify(self, text):
        return re.sub(r"[^\w\-]", "", text.strip().lower().replace(" ", "-"))

    def handle(self, *args, **kwargs):
        updated = 0
        skipped = 0

        for product in Product.objects.filter(main_image=""):
            brand_name = product.brand.name
            folder = self.brand_folder_map.get(brand_name)

            if not folder:
                self.stdout.write(self.style.WARNING(f"⚠️ Unknown brand: {brand_name}"))
                skipped += 1
                continue

            slug = self.slugify(product.name)
            expected_filename = f"{slug}.jpg"
            expected_path = f"products/{folder}/{expected_filename}"
            absolute_path = os.path.join("media", expected_path)

            if os.path.exists(absolute_path):
                product.main_image.name = expected_path
                product.save()
                updated += 1
                self.stdout.write(self.style.SUCCESS(f"✅ {product.name} → {expected_path}"))
            else:
                self.stdout.write(self.style.WARNING(f"❌ Image not found: {expected_path}"))
                skipped += 1

        self.stdout.write(self.style.SUCCESS(f"\n🎉 Updated {updated} products. Skipped {skipped}."))
