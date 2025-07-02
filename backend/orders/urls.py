# backend/orders/urls.py

from django.urls import path
from .views import checkout, get_order_history, latest_order

urlpatterns = [
    path("checkout/", checkout, name="checkout"),
    path("latest/", latest_order, name="latest_order"),
    path("", get_order_history, name="get_order_history"),
]
