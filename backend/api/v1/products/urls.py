from django.urls import path
from .views import (
    BrandListView,
    ProductListView,
    ProductDetailView,
    product_search_suggestions,
    filtered_products,
    elasticsearch_suggestions,
)

urlpatterns = [
    path("brands/", BrandListView.as_view(), name="api_brand_list"),
    path("", ProductListView.as_view(), name="api_product_list"),
    path("search-suggestions/", product_search_suggestions, name="api_product_search_suggestions"),
    path("elasticsearch-suggestions/", elasticsearch_suggestions, name="api_elasticsearch_suggestions"),
    path("filtered/", filtered_products, name="api_filtered_products"),
    path("<slug:slug>/", ProductDetailView.as_view(), name="api_product_detail"),
]