# backend/orders/urls.py

from django.urls import path
from .views import checkout, get_order_history, latest_order, confirm_payment
from .analytics_views import (
    sales_overview, 
    daily_sales, 
    top_products, 
    brand_performance, 
    customer_insights,
    financial_summary
)

urlpatterns = [
    path("checkout/", checkout, name="checkout"),
    path("confirm-payment/", confirm_payment, name="confirm_payment"),
    path("latest/", latest_order, name="latest_order"),
    path("", get_order_history, name="get_order_history"),
    
    # Analytics endpoints
    path("analytics/sales-overview/", sales_overview, name="sales_overview"),
    path("analytics/daily-sales/", daily_sales, name="daily_sales"),
    path("analytics/top-products/", top_products, name="top_products"),
    path("analytics/brand-performance/", brand_performance, name="brand_performance"),
    path("analytics/customer-insights/", customer_insights, name="customer_insights"),
    path("analytics/financial-summary/", financial_summary, name="financial_summary"),
]
