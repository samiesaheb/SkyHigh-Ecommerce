from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()

class Brand(models.Model):
    name = models.CharField(max_length=100, db_index=True)
    description = models.TextField(blank=True)
    slug = models.SlugField(unique=True, db_index=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['slug']),
        ]
        ordering = ['name']

    def __str__(self):
        return self.name

class Product(models.Model):
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name="products")
    name = models.CharField(max_length=200, db_index=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=8, decimal_places=2, db_index=True)
    main_image = models.ImageField(upload_to="products/")
    slug = models.SlugField(unique=True, db_index=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['slug']),
            models.Index(fields=['price']),
            models.Index(fields=['brand', 'price']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name

# Review models moved to reviews app for better organization
