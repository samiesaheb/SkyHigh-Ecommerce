from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from products.models import Product
from django.core.validators import MinValueValidator

User = get_user_model()

class StockLevel(models.Model):
    """
    Track stock levels for products
    """
    STOCK_STATUS_CHOICES = [
        ('in_stock', 'In Stock'),
        ('low_stock', 'Low Stock'),
        ('out_of_stock', 'Out of Stock'),
        ('discontinued', 'Discontinued'),
    ]
    
    product = models.OneToOneField(
        Product, 
        on_delete=models.CASCADE, 
        related_name='stock_level'
    )
    quantity = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Current stock quantity"
    )
    reserved_quantity = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Quantity reserved for pending orders"
    )
    low_stock_threshold = models.PositiveIntegerField(
        default=10,
        validators=[MinValueValidator(0)],
        help_text="Alert when stock falls below this level"
    )
    reorder_point = models.PositiveIntegerField(
        default=5,
        validators=[MinValueValidator(0)],
        help_text="Automatic reorder trigger point"
    )
    status = models.CharField(
        max_length=20,
        choices=STOCK_STATUS_CHOICES,
        default='in_stock'
    )
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['quantity']),
            models.Index(fields=['last_updated']),
        ]
        
    def __str__(self):
        return f"{self.product.name} - {self.quantity} units"
    
    @property
    def available_quantity(self):
        """Available quantity after reservations"""
        return max(0, self.quantity - self.reserved_quantity)
    
    @property
    def is_low_stock(self):
        """Check if stock is below threshold"""
        return self.available_quantity <= self.low_stock_threshold
    
    @property
    def needs_reorder(self):
        """Check if reorder is needed"""
        return self.available_quantity <= self.reorder_point
    
    def update_status(self):
        """Update stock status based on current quantity"""
        if self.quantity == 0:
            self.status = 'out_of_stock'
        elif self.is_low_stock:
            self.status = 'low_stock'
        else:
            self.status = 'in_stock'
        self.save(update_fields=['status'])
    
    def reserve_stock(self, quantity):
        """Reserve stock for orders"""
        if self.available_quantity >= quantity:
            self.reserved_quantity += quantity
            self.save(update_fields=['reserved_quantity'])
            return True
        return False
    
    def release_stock(self, quantity):
        """Release reserved stock"""
        self.reserved_quantity = max(0, self.reserved_quantity - quantity)
        self.save(update_fields=['reserved_quantity'])
    
    def adjust_stock(self, quantity, reason="Manual adjustment"):
        """Adjust stock quantity and create movement record"""
        old_quantity = self.quantity
        self.quantity = max(0, quantity)
        self.save()
        
        # Create stock movement record
        StockMovement.objects.create(
            stock_level=self,
            movement_type='adjustment',
            quantity_change=self.quantity - old_quantity,
            reason=reason
        )
        
        self.update_status()

class StockMovement(models.Model):
    """
    Track all stock movements (in/out/adjustments)
    """
    MOVEMENT_TYPES = [
        ('purchase', 'Purchase/Restock'),
        ('sale', 'Sale'),
        ('adjustment', 'Manual Adjustment'),
        ('return', 'Return'),
        ('damage', 'Damaged/Lost'),
        ('transfer', 'Transfer'),
    ]
    
    stock_level = models.ForeignKey(
        StockLevel, 
        on_delete=models.CASCADE,
        related_name='movements'
    )
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity_change = models.IntegerField(
        help_text="Positive for stock in, negative for stock out"
    )
    quantity_before = models.PositiveIntegerField()
    quantity_after = models.PositiveIntegerField()
    reason = models.CharField(max_length=255, blank=True)
    reference_id = models.CharField(
        max_length=100, 
        blank=True,
        help_text="Order ID, Purchase Order, etc."
    )
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        indexes = [
            models.Index(fields=['stock_level', 'created_at']),
            models.Index(fields=['movement_type']),
            models.Index(fields=['reference_id']),
        ]
        ordering = ['-created_at']
        
    def __str__(self):
        sign = '+' if self.quantity_change >= 0 else ''
        return f"{self.stock_level.product.name}: {sign}{self.quantity_change} ({self.movement_type})"
    
    def save(self, *args, **kwargs):
        # Auto-populate quantities if not set
        if not self.pk:
            self.quantity_before = self.stock_level.quantity
            self.quantity_after = max(0, self.quantity_before + self.quantity_change)
        super().save(*args, **kwargs)

class Supplier(models.Model):
    """
    Supplier information for purchase orders
    """
    name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['name']
        
    def __str__(self):
        return self.name

class PurchaseOrder(models.Model):
    """
    Purchase orders for restocking
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent to Supplier'),
        ('confirmed', 'Confirmed'),
        ('partial', 'Partially Received'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    po_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    order_date = models.DateField(default=timezone.now)
    expected_date = models.DateField(null=True, blank=True)
    received_date = models.DateField(null=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['order_date']),
            models.Index(fields=['supplier']),
        ]
        
    def __str__(self):
        return f"PO-{self.po_number} ({self.supplier.name})"

class PurchaseOrderItem(models.Model):
    """
    Items in a purchase order
    """
    purchase_order = models.ForeignKey(
        PurchaseOrder, 
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity_ordered = models.PositiveIntegerField()
    quantity_received = models.PositiveIntegerField(default=0)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        unique_together = ['purchase_order', 'product']
        
    def __str__(self):
        return f"{self.product.name} - {self.quantity_ordered} units"
    
    @property
    def is_fully_received(self):
        return self.quantity_received >= self.quantity_ordered
    
    @property
    def remaining_quantity(self):
        return max(0, self.quantity_ordered - self.quantity_received)
    
    def save(self, *args, **kwargs):
        self.total_cost = self.quantity_ordered * self.unit_cost
        super().save(*args, **kwargs)

class StockAlert(models.Model):
    """
    Stock level alerts and notifications
    """
    ALERT_TYPES = [
        ('low_stock', 'Low Stock'),
        ('out_of_stock', 'Out of Stock'),
        ('reorder_needed', 'Reorder Needed'),
        ('overstock', 'Overstock'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    stock_level = models.ForeignKey(StockLevel, on_delete=models.CASCADE)
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='medium')
    message = models.TextField()
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='resolved_alerts'
    )
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_resolved', 'priority']),
            models.Index(fields=['alert_type']),
            models.Index(fields=['created_at']),
        ]
        
    def __str__(self):
        return f"{self.alert_type}: {self.stock_level.product.name}"
    
    def resolve(self, user=None):
        """Mark alert as resolved"""
        self.is_resolved = True
        self.resolved_at = timezone.now()
        self.resolved_by = user
        self.save()
