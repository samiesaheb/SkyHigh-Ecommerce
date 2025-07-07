import os
import re
from django.utils.text import slugify
from products.models import Product
from django.conf import settings

media_folder = os.path.join(settings.MEDIA_ROOT, "products/bodyandskincare")
image_files = os.listdir(media_folder)

def normalize(s):
    return re.sub(r"[^a-z0-9]", "", slugify(s).lower())

matched = 0

for product in Product.objects.filter(brand__name__icontains="Body"):
    if product.main_image and "placeholder" not in str(product.main_image):
        continue  # Skip if already has a real image

    product_key = normalize(product.name)

    best_match = None
    for image_file in image_files:
        image_key = normalize(image_file)
        if product_key in image_key or image_key in product_key:
            best_match = image_file
            break

    if best_match:
        product.main_image = f"products/bodyandskincare/{best_match}"
        product.save()
        print(f"✅ {product.name} → {best_match}")
        matched += 1
    else:
        print(f"❌ No match for: {product.name}")

print(f"🎉 Done. Matched {matched} products to images.")
