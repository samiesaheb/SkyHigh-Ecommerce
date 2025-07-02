# orders/serializers.py

from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.CharField(source='product.name')

    class Meta:
        model = OrderItem
        fields = ['product', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'created_at', 'total_price', 'items']

    def get_total_price(self, obj):
        return sum(item.price * item.quantity for item in obj.items.all())
