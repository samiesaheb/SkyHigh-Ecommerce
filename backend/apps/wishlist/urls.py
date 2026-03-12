from django.urls import path
from .views import (
    get_wishlist,
    add_to_wishlist,
    remove_from_wishlist,
    toggle_wishlist,
    check_wishlist
)

urlpatterns = [
    path('', get_wishlist, name='get-wishlist'),  # GET /wishlist/
    path('add/', add_to_wishlist, name='add-to-wishlist'),  # POST /wishlist/add/
    path('remove/<int:product_id>/', remove_from_wishlist, name='remove-from-wishlist'),  # DELETE /wishlist/remove/{id}/
    path('toggle/', toggle_wishlist, name='toggle-wishlist'),  # POST /wishlist/toggle/
    path('check/<int:product_id>/', check_wishlist, name='check-wishlist'),  # GET /wishlist/check/{id}/
]