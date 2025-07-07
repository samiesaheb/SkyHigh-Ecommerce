# orders/serializers.py

from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.CharField(source='product.name')
    image = serializers.SerializerMethodField()  # ✅ Add image field

    class Meta:
        model = OrderItem
        fields = ['product', 'quantity', 'price', 'image']  # ✅ Include image

    def get_image(self, obj):
        request = self.context.get('request')
        if hasattr(obj.product, 'main_image') and obj.product.main_image:
            image_url = obj.product.main_image.url
            return request.build_absolute_uri(image_url) if request else image_url
        return None


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'created_at', 'total_price', 'items']

    def get_total_price(self, obj):
        return sum(item.price * item.quantity for item in obj.items.all())
