from django.urls import path
from .views import (
    checkout,
    get_order_history,
    confirm_payment,
    latest_order,
    order_status,
)
from .webhooks import stripe_webhook

urlpatterns = [
    path("checkout/", checkout, name="api_checkout"),
    path("history/", get_order_history, name="api_order_history"),
    path("confirm-payment/", confirm_payment, name="api_confirm_payment"),
    path("latest/", latest_order, name="api_latest_order"),
    path("status/<int:order_id>/", order_status, name="api_order_status"),
    path("webhook/stripe/", stripe_webhook, name="stripe_webhook"),
]