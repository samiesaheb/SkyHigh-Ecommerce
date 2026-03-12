from django.core.management.base import BaseCommand
from products.models import Product

brand_folder_map = {
    "Geometry": "geometry",
    "Hair Care": "haircare",
    "Facial Care": "facialcare",
    "Body & Skin Care": "bodyandskincare",
}

class Command(BaseCommand):
    help = "Fix main_image paths based on brand folders"

    def handle(self, *args, **kwargs):
        for product in Product.objects.all():
            image_path = product.main_image.name if product.main_image else ""

            if "product_images/" in image_path:
                brand_name = product.brand.name
                folder = brand_folder_map.get(brand_name)

                if folder:
                    filename = image_path.split("/")[-1]
                    corrected_path = f"products/{folder}/{filename}"
                    self.stdout.write(f"✅ Updating {product.name}: {image_path} → {corrected_path}")
                    product.main_image.name = corrected_path
                    product.save()
                else:
                    self.stdout.write(f"⚠️ Brand not mapped: '{brand_name}' for product '{product.name}'")
