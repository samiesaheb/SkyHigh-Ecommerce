from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import json

User = get_user_model()

class NotificationTemplate(models.Model):
    """
    Templates for different types of notifications
    """
    NOTIFICATION_TYPES = [
        ('order_confirmation', 'Order Confirmation'),
        ('order_shipped', 'Order Shipped'),
        ('order_delivered', 'Order Delivered'),
        ('password_reset', 'Password Reset'),
        ('account_verification', 'Account Verification'),
        ('price_drop', 'Price Drop Alert'),
        ('back_in_stock', 'Back in Stock'),
        ('low_stock_admin', 'Low Stock Alert (Admin)'),
        ('newsletter', 'Newsletter'),
        ('promotional', 'Promotional'),
        ('system_maintenance', 'System Maintenance'),
    ]
    
    CHANNEL_TYPES = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('push', 'Push Notification'),
        ('in_app', 'In-App Notification'),
    ]
    
    name = models.CharField(max_length=100)
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES)
    channel = models.CharField(max_length=20, choices=CHANNEL_TYPES)
    
    # Email specific fields
    subject_template = models.CharField(max_length=200, blank=True)
    html_template = models.TextField(blank=True)
    text_template = models.TextField(blank=True)
    
    # SMS specific fields  
    sms_template = models.TextField(blank=True, help_text="SMS message template (160 chars max)")
    
    # Push notification fields
    push_title_template = models.CharField(max_length=100, blank=True)
    push_body_template = models.TextField(blank=True)
    
    # General
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['notification_type', 'channel']
        indexes = [
            models.Index(fields=['notification_type', 'channel']),
        ]
        
    def __str__(self):
        return f"{self.name} ({self.channel})"

class NotificationPreference(models.Model):
    """
    User notification preferences
    """
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE,
        related_name='notification_preferences'
    )
    
    # Email preferences
    email_marketing = models.BooleanField(default=True)
    email_order_updates = models.BooleanField(default=True)
    email_price_alerts = models.BooleanField(default=True)
    email_stock_alerts = models.BooleanField(default=True)
    
    # SMS preferences  
    sms_order_updates = models.BooleanField(default=False)
    sms_delivery_updates = models.BooleanField(default=False)
    
    # Push notification preferences
    push_order_updates = models.BooleanField(default=True)
    push_price_alerts = models.BooleanField(default=True)
    push_marketing = models.BooleanField(default=False)
    
    # Phone number for SMS
    phone_number = models.CharField(max_length=20, blank=True)
    phone_verified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Preferences for {self.user.email}"

class Notification(models.Model):
    """
    Individual notifications sent to users
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    template = models.ForeignKey(NotificationTemplate, on_delete=models.CASCADE)
    
    # Content
    subject = models.CharField(max_length=200, blank=True)
    message = models.TextField()
    html_content = models.TextField(blank=True)
    
    # Metadata
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='normal')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Scheduling
    send_at = models.DateTimeField(default=timezone.now)
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    
    # Tracking
    opened_at = models.DateTimeField(null=True, blank=True)
    clicked_at = models.DateTimeField(null=True, blank=True)
    
    # Context data (JSON)
    context_data = models.JSONField(default=dict, blank=True)
    
    # Error handling
    error_message = models.TextField(blank=True)
    retry_count = models.PositiveIntegerField(default=0)
    max_retries = models.PositiveIntegerField(default=3)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'send_at']),
            models.Index(fields=['template', 'status']),
            models.Index(fields=['priority', 'send_at']),
        ]
        
    def __str__(self):
        return f"{self.template.name} to {self.user.email} ({self.status})"
    
    def mark_sent(self):
        """Mark notification as sent"""
        self.status = 'sent'
        self.sent_at = timezone.now()
        self.save(update_fields=['status', 'sent_at'])
    
    def mark_delivered(self):
        """Mark notification as delivered"""
        self.status = 'delivered'
        self.delivered_at = timezone.now()
        self.save(update_fields=['status', 'delivered_at'])
    
    def mark_failed(self, error_message=''):
        """Mark notification as failed"""
        self.status = 'failed'
        self.error_message = error_message
        self.retry_count += 1
        self.save(update_fields=['status', 'error_message', 'retry_count'])
    
    def mark_opened(self):
        """Mark notification as opened"""
        if not self.opened_at:
            self.opened_at = timezone.now()
            self.save(update_fields=['opened_at'])
    
    def mark_clicked(self):
        """Mark notification as clicked"""
        if not self.clicked_at:
            self.clicked_at = timezone.now()
            self.save(update_fields=['clicked_at'])
    
    def can_retry(self):
        """Check if notification can be retried"""
        return self.status == 'failed' and self.retry_count < self.max_retries

class EmailProvider(models.Model):
    """
    Email service provider configurations
    """
    PROVIDER_TYPES = [
        ('smtp', 'SMTP'),
        ('sendgrid', 'SendGrid'),
        ('mailgun', 'Mailgun'),
        ('ses', 'Amazon SES'),
        ('postmark', 'Postmark'),
    ]
    
    name = models.CharField(max_length=100)
    provider_type = models.CharField(max_length=20, choices=PROVIDER_TYPES)
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    
    # Configuration (stored as JSON)
    configuration = models.JSONField(
        default=dict,
        help_text="Provider-specific configuration"
    )
    
    # Limits and quotas
    daily_limit = models.PositiveIntegerField(default=1000)
    hourly_limit = models.PositiveIntegerField(default=100)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.provider_type})"
    
    def save(self, *args, **kwargs):
        # Ensure only one default provider
        if self.is_default:
            EmailProvider.objects.exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)

class SMSProvider(models.Model):
    """
    SMS service provider configurations
    """
    PROVIDER_TYPES = [
        ('twilio', 'Twilio'),
        ('nexmo', 'Vonage (Nexmo)'),
        ('aws_sns', 'AWS SNS'),
        ('clicksend', 'ClickSend'),
    ]
    
    name = models.CharField(max_length=100)
    provider_type = models.CharField(max_length=20, choices=PROVIDER_TYPES)
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    
    # Configuration (stored as JSON)
    configuration = models.JSONField(
        default=dict,
        help_text="Provider-specific configuration"
    )
    
    # Limits and quotas
    daily_limit = models.PositiveIntegerField(default=100)
    hourly_limit = models.PositiveIntegerField(default=10)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.provider_type})"
    
    def save(self, *args, **kwargs):
        # Ensure only one default provider
        if self.is_default:
            SMSProvider.objects.exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)

class NotificationLog(models.Model):
    """
    Detailed logging for notification sending
    """
    notification = models.ForeignKey(
        Notification, 
        on_delete=models.CASCADE,
        related_name='logs'
    )
    provider_name = models.CharField(max_length=100, blank=True)
    provider_response = models.JSONField(default=dict, blank=True)
    
    # Tracking IDs
    provider_message_id = models.CharField(max_length=200, blank=True)
    tracking_url = models.URLField(blank=True)
    
    # Performance metrics
    send_duration_ms = models.PositiveIntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Log for {self.notification}"

class NotificationQueue(models.Model):
    """
    Queue for batch processing notifications
    """
    QUEUE_TYPES = [
        ('immediate', 'Immediate'),
        ('scheduled', 'Scheduled'),
        ('bulk', 'Bulk'),
        ('retry', 'Retry'),
    ]
    
    notification = models.OneToOneField(
        Notification,
        on_delete=models.CASCADE,
        related_name='queue_entry'
    )
    queue_type = models.CharField(max_length=20, choices=QUEUE_TYPES, default='immediate')
    priority_score = models.IntegerField(default=0)
    
    # Processing
    is_processing = models.BooleanField(default=False)
    processing_started_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-priority_score', 'created_at']
        indexes = [
            models.Index(fields=['queue_type', 'is_processing']),
            models.Index(fields=['priority_score', 'created_at']),
        ]
        
    def __str__(self):
        return f"Queue entry for {self.notification}"
