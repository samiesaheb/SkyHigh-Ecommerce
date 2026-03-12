from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from products.models import Product

User = get_user_model()

class Cart(models.Model):
    """
    Shopping cart model that can be associated with either a user or a session
    """
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='cart'
    )
    session_key = models.CharField(
        max_length=40, 
        null=True, 
        blank=True,
        help_text="Session key for anonymous users"
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['session_key']),
            models.Index(fields=['updated_at']),
        ]
    
    def __str__(self):
        if self.user:
            return f"Cart for {self.user.email}"
        return f"Anonymous Cart ({self.session_key[:8]}...)"
    
    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())
    
    @property
    def total_price(self):
        return sum(item.subtotal for item in self.items.all())
    
    def clear(self):
        """Clear all items from the cart"""
        self.items.all().delete()
        self.updated_at = timezone.now()
        self.save()

class CartItem(models.Model):
    """
    Individual items in a shopping cart
    """
    cart = models.ForeignKey(
        Cart, 
        on_delete=models.CASCADE, 
        related_name='items'
    )
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField(default=1)
    price_at_time = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Price when item was added to cart"
    )
    added_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['cart', 'product']
        indexes = [
            models.Index(fields=['cart', 'product']),
            models.Index(fields=['added_at']),
        ]
    
    def __str__(self):
        return f"{self.quantity}x {self.product.name}"
    
    @property
    def subtotal(self):
        return self.quantity * self.price_at_time
    
    def save(self, *args, **kwargs):
        # Set price_at_time when creating new cart item
        if not self.pk:
            self.price_at_time = self.product.price
        super().save(*args, **kwargs)
        
        # Update cart's updated_at timestamp
        self.cart.updated_at = timezone.now()
        self.cart.save(update_fields=['updated_at'])