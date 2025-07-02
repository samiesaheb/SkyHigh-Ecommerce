from rest_framework import serializers
from .models import Brand, Product

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = "__all__"

class ProductSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)

    class Meta:
        model = Product
        fields = "__all__"
