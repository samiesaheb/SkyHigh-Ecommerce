from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from products.models import Product

User = get_user_model()

class ProductReview(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviews")
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5 stars"
    )
    title = models.CharField(max_length=200, help_text="Review title")
    comment = models.TextField(help_text="Detailed review comment")
    verified_purchase = models.BooleanField(
        default=False, 
        help_text="True if the user purchased this product"
    )
    is_approved = models.BooleanField(
        default=True, 
        help_text="Admin approval for public display"
    )
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('product', 'user')
        indexes = [
            models.Index(fields=['product', 'rating']),
            models.Index(fields=['user']),
            models.Index(fields=['created_at']),
            models.Index(fields=['is_approved']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.product.name} ({self.rating}⭐)"
    
    @property
    def is_geometry_product(self):
        """Check if this review is for a Geometry brand product"""
        return self.product.brand.slug == 'geometry'

class ReviewHelpful(models.Model):
    """Track which users found reviews helpful"""
    review = models.ForeignKey(ProductReview, on_delete=models.CASCADE, related_name="helpful_markers")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        unique_together = ('review', 'user')
        indexes = [
            models.Index(fields=['review']),
            models.Index(fields=['user']),
        ]
    
    def __str__(self):
        return f"{self.user.email} found review helpful: {self.review.id}"
