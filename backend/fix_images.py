import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "skyhigh_backend.settings")
django.setup()

from products.models import Product

brand_folder_map = {
    "Geometry": "geometry",
    "Hair Care": "haircare",
    "Facial Care": "facialcare",
    "Body & Skin Care": "bodyandskincare",
}

for product in Product.objects.all():
    image_path = product.main_image.name if product.main_image else ""

    if "product_images/" in image_path:
        brand_name = product.brand.name
        folder = brand_folder_map.get(brand_name)

        if folder:
            filename = image_path.split("/")[-1]
            corrected_path = f"products/{folder}/{filename}"
            print(f"✅ Updating {product.name}: {image_path} → {corrected_path}")
            product.main_image.name = corrected_path
            product.save()
        else:
            print(f"⚠️ Brand not mapped: '{brand_name}' for product '{product.name}'")
