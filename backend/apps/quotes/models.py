from django.db import models
from django.conf import settings
from django.core.validators import EmailValidator
from django.utils import timezone


class QuoteRequest(models.Model):
    """
    Model for B2B quote requests from potential manufacturing clients
    """
    STATUS_CHOICES = [
        ('new', 'New'),
        ('reviewing', 'Under Review'),
        ('quoted', 'Quote Sent'),
        ('negotiating', 'In Negotiation'),
        ('converted', 'Converted to Client'),
        ('declined', 'Declined'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    # Company Information
    company_name = models.CharField(max_length=255)
    contact_name = models.CharField(max_length=255)
    email = models.EmailField(validators=[EmailValidator()])
    phone = models.CharField(max_length=50)
    country = models.CharField(max_length=100)

    # Project Details
    product_type = models.CharField(max_length=255)
    custom_product_type = models.CharField(max_length=255, blank=True)
    volume_range = models.CharField(max_length=100)
    timeline = models.CharField(max_length=100)
    has_formulation = models.CharField(max_length=50)
    branding_requirements = models.TextField(blank=True)
    additional_info = models.TextField(blank=True)
    hear_about_us = models.CharField(max_length=255, blank=True)

    # Internal Management
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_quotes'
    )
    internal_notes = models.TextField(blank=True, help_text="Internal notes for sales team")

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    contacted_at = models.DateTimeField(null=True, blank=True)
    quote_sent_at = models.DateTimeField(null=True, blank=True)

    # Tracking
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    referrer = models.URLField(max_length=500, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Quote Request'
        verbose_name_plural = 'Quote Requests'
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['email']),
        ]

    def __str__(self):
        return f"{self.company_name} - {self.product_type} ({self.get_status_display()})"

    def mark_as_contacted(self):
        """Mark quote as contacted"""
        if not self.contacted_at:
            self.contacted_at = timezone.now()
            self.status = 'reviewing'
            self.save()

    def mark_quote_sent(self):
        """Mark quote as sent"""
        self.quote_sent_at = timezone.now()
        self.status = 'quoted'
        self.save()

    @property
    def is_new(self):
        """Check if quote is new (less than 24 hours old)"""
        return (timezone.now() - self.created_at).days < 1

    @property
    def response_time(self):
        """Calculate response time in hours"""
        if self.contacted_at:
            delta = self.contacted_at - self.created_at
            return round(delta.total_seconds() / 3600, 2)
        return None


class SampleRequest(models.Model):
    """
    Model for B2B sample requests - clients requesting product samples
    """
    STATUS_CHOICES = [
        ('new', 'New'),
        ('approved', 'Approved'),
        ('preparing', 'Preparing Samples'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('declined', 'Declined'),
    ]

    # Company Information
    company_name = models.CharField(max_length=255)
    contact_name = models.CharField(max_length=255)
    email = models.EmailField(validators=[EmailValidator()])
    phone = models.CharField(max_length=50)
    country = models.CharField(max_length=100)
    shipping_address = models.TextField()

    # Sample Request Details
    product_categories = models.CharField(
        max_length=500,
        help_text="Comma-separated list of requested categories (e.g., facial care, hair care)"
    )
    specific_products = models.TextField(
        blank=True,
        help_text="Specific products or formulations of interest"
    )
    intended_use = models.CharField(
        max_length=50,
        choices=[
            ('testing', 'Product Testing'),
            ('market_research', 'Market Research'),
            ('evaluation', 'Manufacturing Evaluation'),
            ('other', 'Other'),
        ]
    )
    business_type = models.CharField(
        max_length=100,
        blank=True,
        help_text="e.g., Retailer, Distributor, Brand Owner"
    )
    additional_info = models.TextField(blank=True)

    # Internal Management
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_samples'
    )
    internal_notes = models.TextField(blank=True)
    tracking_number = models.CharField(max_length=100, blank=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    shipped_at = models.DateTimeField(null=True, blank=True)

    # Tracking
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    referrer = models.URLField(max_length=500, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Sample Request'
        verbose_name_plural = 'Sample Requests'
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['email']),
        ]

    def __str__(self):
        return f"{self.company_name} - {self.product_categories[:50]} ({self.get_status_display()})"

    def mark_as_approved(self):
        """Mark sample request as approved"""
        if not self.approved_at:
            self.approved_at = timezone.now()
            self.status = 'approved'
            self.save()

    def mark_as_shipped(self, tracking_number=''):
        """Mark samples as shipped"""
        self.shipped_at = timezone.now()
        self.status = 'shipped'
        if tracking_number:
            self.tracking_number = tracking_number
        self.save()

    @property
    def is_new(self):
        """Check if request is new (less than 24 hours old)"""
        return (timezone.now() - self.created_at).days < 1


class QuoteFollowUp(models.Model):
    """
    Track follow-ups and communications for quote requests
    """
    quote = models.ForeignKey(QuoteRequest, on_delete=models.CASCADE, related_name='follow_ups')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    FOLLOW_UP_TYPE_CHOICES = [
        ('email', 'Email'),
        ('phone', 'Phone Call'),
        ('meeting', 'Meeting'),
        ('quote_sent', 'Quote Sent'),
        ('sample_sent', 'Sample Sent'),
        ('other', 'Other'),
    ]

    follow_up_type = models.CharField(max_length=20, choices=FOLLOW_UP_TYPE_CHOICES)
    notes = models.TextField()
    next_follow_up = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Follow Up'
        verbose_name_plural = 'Follow Ups'

    def __str__(self):
        return f"{self.quote.company_name} - {self.get_follow_up_type_display()} on {self.created_at.date()}"
