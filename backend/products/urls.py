from django.urls import path
from .views import BrandListView, ProductListView, product_search_suggestions
from .cart import (
    CartView,
    update_cart_quantity,
    remove_from_cart,
    checkout_order,
    get_latest_order,
    cart_quantity_view,
)
# from .auth import register_user, login_user, logout_user, get_user_info, update_profile

urlpatterns = [
    # Product list at root of /api/products/
    path("", ProductListView.as_view(), name="product-list"),

    # Brand & Product APIs
    path("brands/", BrandListView.as_view(), name="brand-list"),
    path("search-suggestions/", product_search_suggestions, name="product_search_suggestions"),

    # Cart APIs
    path("cart/", CartView.as_view(), name="cart"),  # GET + POST
    path("cart/update/", update_cart_quantity, name="update_cart_quantity"),
    path("cart/remove/", remove_from_cart, name="remove_from_cart"),
    path("cart/checkout/", checkout_order, name="checkout_order"),
    path("cart/latest/", get_latest_order, name="get_latest_order"),
    path("cart/quantity/", cart_quantity_view, name="cart_quantity"),

]
