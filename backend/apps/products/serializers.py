from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Product, Brand

User = get_user_model()

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ["id", "name", "slug"]

class ProductSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    main_image = serializers.SerializerMethodField()
    price_cents = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "price",        # e.g., 299.00
            "price_cents",  # e.g., 29900
            "main_image",   # absolute URL
            "brand",
        ]

    def get_main_image(self, obj):
        request = self.context.get("request")
        if obj.main_image and hasattr(obj.main_image, "url"):
            if request:
                return request.build_absolute_uri(obj.main_image.url)
            return obj.main_image.url  # fallback
        return ""

    def get_price_cents(self, obj):
        # Avoid float; multiply Decimal by 100 and cast to int
        return int(obj.price * 100)

class ProductDetailSerializer(ProductSerializer):
    """Extended product serializer - review functionality moved to reviews app"""
    
    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields
