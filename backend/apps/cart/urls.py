from django.urls import path
from django.conf import settings
from .views import CartView, CartItemView, ClearCartView

urlpatterns = [
    path('', CartView.as_view(), name='cart'),  # GET /cart/, POST /cart/
    path('clear/', ClearCartView.as_view(), name='cart-clear'),  # DELETE /cart/clear/
    path('items/<int:product_id>/', CartItemView.as_view(), name='cart-item'),  # PUT, DELETE /cart/items/{id}/
]

# Only add debug endpoints in development
if settings.DEBUG:
    from .debug_views import debug_cart_state, debug_clear_all_carts
    urlpatterns += [
        path('debug/state/', debug_cart_state, name='cart-debug-state'),
        path('debug/clear/', debug_clear_all_carts, name='cart-debug-clear'),
    ]