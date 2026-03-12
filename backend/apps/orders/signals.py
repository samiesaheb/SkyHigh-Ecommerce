"""
Django signals for order management
Handles automatic email notifications when order status changes
"""

import logging
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.core.cache import cache
from .models import Order
from notifications.email_service import email_service

logger = logging.getLogger(__name__)

@receiver(pre_save, sender=Order)
def capture_old_order_status(sender, instance, **kwargs):
    """Capture old status before saving to compare with new status"""
    if instance.pk:  # Only for existing orders (updates)
        try:
            old_order = Order.objects.get(pk=instance.pk)
            # Store old status in cache temporarily
            cache_key = f"order_old_status_{instance.pk}"
            cache.set(cache_key, old_order.status, timeout=60)  # 1 minute timeout
        except Order.DoesNotExist:
            pass

@receiver(post_save, sender=Order)
def send_order_status_notifications(sender, instance, created, **kwargs):
    """Send email notifications based on order status changes"""

    if created:
        # New order created - this is handled by the checkout/webhook flow
        logger.info(f"New order created: #{instance.id}")
        return

    # Get old status from cache
    cache_key = f"order_old_status_{instance.pk}"
    old_status = cache.get(cache_key)

    if old_status and old_status != instance.status:
        # Status changed - send notification
        try:
            logger.info(f"Order #{instance.id} status changed: {old_status} → {instance.status}")

            # Send status update email
            email_sent = email_service.send_order_status_update(
                order=instance,
                old_status=old_status,
                new_status=instance.status
            )

            if email_sent:
                logger.info(f"✅ Status update email sent for order #{instance.id}")
            else:
                logger.warning(f"⚠️ Failed to send status update email for order #{instance.id}")

            # Special handling for shipped status
            if instance.status == 'shipped' and instance.tracking_number:
                # Send shipping notification with tracking info
                shipping_email_sent = email_service.send_shipping_notification(
                    order=instance,
                    tracking_number=instance.tracking_number
                )

                if shipping_email_sent:
                    logger.info(f"✅ Shipping notification sent for order #{instance.id}")
                else:
                    logger.warning(f"⚠️ Failed to send shipping notification for order #{instance.id}")

        except Exception as e:
            logger.error(f"❌ Error sending order status notification for order #{instance.id}: {e}")
        finally:
            # Clean up cache
            cache.delete(cache_key)

@receiver(post_save, sender=Order)
def handle_payment_confirmation(sender, instance, created, **kwargs):
    """Send order confirmation email when payment is marked as paid"""

    if not created and instance.is_paid:
        # Check if this is a new payment (not already processed)
        cache_key = f"payment_confirmed_{instance.pk}"

        if not cache.get(cache_key):
            try:
                # Send order confirmation email
                email_sent = email_service.send_order_confirmation(instance)

                if email_sent:
                    logger.info(f"✅ Payment confirmation email sent for order #{instance.id}")
                    # Mark as processed to avoid duplicate emails
                    cache.set(cache_key, True, timeout=60 * 60 * 24)  # 24 hours
                else:
                    logger.warning(f"⚠️ Failed to send payment confirmation email for order #{instance.id}")

            except Exception as e:
                logger.error(f"❌ Error sending payment confirmation email for order #{instance.id}: {e}")