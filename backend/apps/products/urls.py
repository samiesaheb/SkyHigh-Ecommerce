from django.urls import path
from .views import (
    BrandListView,
    ProductListView,
    ProductDetailView,
    product_search_suggestions,
    filtered_products,
)
from .cart_compat import (
    cart_compat_view,
    cart_quantity_compat_view,
    remove_from_cart_compat,
    update_cart_quantity,
)

urlpatterns = [
    # Backward compatibility for old cart endpoints (temporary)
    path("cart/", cart_compat_view, name="cart-compat"),
    path("cart/quantity/", cart_quantity_compat_view, name="cart-quantity-compat"),
    path("cart/update/", update_cart_quantity, name="update-cart-quantity-compat"),
    path("cart/remove/", remove_from_cart_compat, name="remove-cart-compat"),
    
    # Brand & Search APIs
    path("brands/", BrandListView.as_view(), name="brand-list"),
    path("search/", product_search_suggestions, name="product_search_suggestions"),

    # Product list and detail
    path("", filtered_products, name="product-list"),
    path("<slug:slug>/", ProductDetailView.as_view(), name="product-detail"),
]
