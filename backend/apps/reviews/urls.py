from django.urls import path
from .views import (
    product_reviews,
    create_review,
    mark_review_helpful,
    user_reviews,
    product_review_summary
)

urlpatterns = [
    path('', create_review, name='create-review'),  # POST /reviews/
    path('products/<int:product_id>/', product_reviews, name='product-reviews'),  # GET /reviews/products/{id}/
    path('products/<int:product_id>/summary/', product_review_summary, name='product-review-summary'),  # GET /reviews/products/{id}/summary/
    path('helpful/<int:review_id>/', mark_review_helpful, name='mark-review-helpful'),  # POST /reviews/helpful/{id}/
    path('user/', user_reviews, name='user-reviews'),  # GET /reviews/user/
]