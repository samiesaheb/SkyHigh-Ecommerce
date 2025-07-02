from django.contrib import admin
from .models import Brand, Product

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("id", "name")

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "brand", "price")
    list_filter = ("brand",)
