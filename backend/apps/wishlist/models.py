from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from products.models import Product

User = get_user_model()

class Wishlist(models.Model):
    """
    User wishlist container
    """
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='wishlist'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Wishlist for {self.user.email}"
    
    @property
    def item_count(self):
        """Total number of items in wishlist"""
        return self.items.count()
    
    @property
    def total_value(self):
        """Total value of all items in wishlist"""
        return sum(item.product.price for item in self.items.all() if item.product.price)
    
    def add_product(self, product):
        """Add a product to the wishlist"""
        item, created = WishlistItem.objects.get_or_create(
            wishlist=self,
            product=product
        )
        return item, created
    
    def remove_product(self, product):
        """Remove a product from the wishlist"""
        return self.items.filter(product=product).delete()
    
    def clear(self):
        """Clear all items from wishlist"""
        self.items.all().delete()
        self.updated_at = timezone.now()
        self.save()

class WishlistItem(models.Model):
    """
    Individual items in a wishlist
    """
    wishlist = models.ForeignKey(
        Wishlist, 
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE
    )
    added_at = models.DateTimeField(default=timezone.now)
    price_when_added = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        null=True, 
        blank=True,
        help_text="Price when item was added to wishlist"
    )
    notes = models.TextField(
        blank=True,
        help_text="Personal notes about this item"
    )
    
    class Meta:
        unique_together = ['wishlist', 'product']
        ordering = ['-added_at']
        indexes = [
            models.Index(fields=['wishlist', 'added_at']),
            models.Index(fields=['added_at']),
        ]
        
    def __str__(self):
        return f"{self.product.name} in {self.wishlist.user.email}'s wishlist"
    
    @property
    def price_difference(self):
        """Calculate price difference since added"""
        if self.price_when_added and self.product.price:
            return self.product.price - self.price_when_added
        return None
    
    @property
    def price_dropped(self):
        """Check if price has dropped since added"""
        diff = self.price_difference
        return diff is not None and diff < 0
    
    @property
    def price_increased(self):
        """Check if price has increased since added"""
        diff = self.price_difference
        return diff is not None and diff > 0
    
    def save(self, *args, **kwargs):
        # Set price_when_added if not already set
        if not self.pk and not self.price_when_added:
            self.price_when_added = self.product.price
        super().save(*args, **kwargs)
        
        # Update wishlist's updated_at timestamp
        self.wishlist.updated_at = timezone.now()
        self.wishlist.save(update_fields=['updated_at'])

class WishlistShare(models.Model):
    """
    Shared wishlists for gift giving or recommendations
    """
    PRIVACY_CHOICES = [
        ('private', 'Private'),
        ('friends', 'Friends Only'),
        ('public', 'Public'),
    ]
    
    wishlist = models.OneToOneField(
        Wishlist,
        on_delete=models.CASCADE,
        related_name='share_settings'
    )
    is_shared = models.BooleanField(default=False)
    privacy_level = models.CharField(
        max_length=10, 
        choices=PRIVACY_CHOICES,
        default='private'
    )
    share_token = models.CharField(
        max_length=32, 
        unique=True,
        null=True, 
        blank=True
    )
    share_url = models.URLField(blank=True)
    share_message = models.TextField(
        blank=True,
        help_text="Message to show when sharing wishlist"
    )
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        indexes = [
            models.Index(fields=['share_token']),
        ]
        
    def __str__(self):
        return f"Share settings for {self.wishlist}"
    
    def generate_share_token(self):
        """Generate a unique share token"""
        import secrets
        self.share_token = secrets.token_urlsafe(24)[:32]
        self.save()
        return self.share_token

class WishlistNotification(models.Model):
    """
    Notifications for wishlist events (price drops, back in stock, etc.)
    """
    NOTIFICATION_TYPES = [
        ('price_drop', 'Price Drop'),
        ('back_in_stock', 'Back in Stock'),
        ('low_stock', 'Low Stock Alert'),
        ('wishlist_shared', 'Wishlist Shared'),
        ('item_purchased', 'Item Purchased by Someone'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    wishlist_item = models.ForeignKey(
        WishlistItem, 
        on_delete=models.CASCADE,
        null=True, 
        blank=True
    )
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['created_at']),
        ]
        
    def __str__(self):
        return f"{self.notification_type}: {self.title}"
    
    def mark_read(self):
        """Mark notification as read"""
        self.is_read = True
        self.save(update_fields=['is_read'])
    
    def mark_sent(self):
        """Mark notification as sent"""
        self.is_sent = True
        self.sent_at = timezone.now()
        self.save(update_fields=['is_sent', 'sent_at'])
