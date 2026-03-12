from django.contrib import admin
from .models import Cart, CartItem

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ('price_at_time', 'subtotal', 'added_at', 'updated_at')
    
    def subtotal(self, obj):
        return f"${obj.subtotal:.2f}"
    subtotal.short_description = 'Subtotal'

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_email', 'session_key_short', 'total_items', 'total_price', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__email', 'session_key']
    readonly_fields = ['created_at', 'updated_at', 'total_items', 'total_price']
    inlines = [CartItemInline]
    
    def user_email(self, obj):
        return obj.user.email if obj.user else 'Anonymous'
    user_email.short_description = 'User'
    
    def session_key_short(self, obj):
        if obj.session_key:
            return f"{obj.session_key[:8]}..."
        return '-'
    session_key_short.short_description = 'Session'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user').prefetch_related('items__product')

@admin.register(CartItem)  
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'cart_user', 'product_name', 'quantity', 'price_at_time', 'subtotal', 'added_at']
    list_filter = ['added_at', 'updated_at']
    search_fields = ['product__name', 'cart__user__email']
    readonly_fields = ['subtotal', 'added_at', 'updated_at']
    
    def cart_user(self, obj):
        return obj.cart.user.email if obj.cart.user else f"Session: {obj.cart.session_key[:8]}..."
    cart_user.short_description = 'Cart User'
    
    def product_name(self, obj):
        return obj.product.name
    product_name.short_description = 'Product'
    
    def subtotal(self, obj):
        return f"${obj.subtotal:.2f}"
    subtotal.short_description = 'Subtotal'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('cart__user', 'product')