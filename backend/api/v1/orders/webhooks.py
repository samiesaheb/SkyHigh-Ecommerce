import stripe
import json
import logging
from datetime import timedelta
from django.conf import settings
from django.http import HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.utils.decorators import method_decorator
from django.utils import timezone
from orders.models import Order, OrderItem
from products.models import Product
from django.core.mail import send_mail
from notifications.email_service import email_service

logger = logging.getLogger(__name__)

# Set Stripe API key
stripe.api_key = settings.STRIPE_SECRET_KEY

@csrf_exempt
@require_POST
def stripe_webhook(request):
    """
    Handle Stripe webhook events for secure payment processing.
    This ensures payment confirmation is handled server-side regardless of client-side issues.
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    if not sig_header:
        logger.error("Missing Stripe signature header")
        return HttpResponseBadRequest("Missing signature")
    
    # Get webhook endpoint secret from settings
    endpoint_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', None)
    if not endpoint_secret:
        logger.error("Stripe webhook secret not configured")
        return HttpResponseBadRequest("Webhook not configured")
    
    try:
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        logger.error(f"Invalid payload: {e}")
        return HttpResponseBadRequest("Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid signature: {e}")
        return HttpResponseBadRequest("Invalid signature")
    
    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        handle_payment_success(payment_intent)
        
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        handle_payment_failure(payment_intent)
        
    elif event['type'] == 'payment_intent.created':
        payment_intent = event['data']['object']
        handle_payment_created(payment_intent)
        
    else:
        logger.info(f"Unhandled event type: {event['type']}")
    
    return HttpResponse(status=200)

def handle_payment_success(payment_intent):
    """Handle successful payment confirmation"""
    payment_intent_id = payment_intent['id']
    amount_received = payment_intent['amount_received']

    logger.info(f"Payment succeeded: {payment_intent_id}, Amount: {amount_received}")

    try:
        # Find order by payment intent ID (more reliable than amount matching)
        order = Order.objects.get(payment_intent_id=payment_intent_id)

        # Mark order as paid and update status
        from django.utils import timezone
        order.is_paid = True
        order.paid_at = timezone.now()
        order.status = 'processing'

        # Store Stripe charge ID if available
        if 'latest_charge' in payment_intent:
            order.stripe_charge_id = payment_intent['latest_charge']

        order.save()

        # Send confirmation email using EmailService
        try:
            email_sent = email_service.send_order_confirmation(order)
            if email_sent:
                logger.info(f"✅ Order confirmation email sent for order {order.id}")
            else:
                logger.warning(f"⚠️ Failed to send order confirmation email for order {order.id}")
        except Exception as e:
            logger.error(f"❌ Error sending order confirmation email for order {order.id}: {e}")

        logger.info(f"Order {order.id} marked as paid via webhook")

    except Order.DoesNotExist:
        logger.error(f"No order found for payment intent: {payment_intent_id}")
    except Exception as e:
        logger.error(f"Error processing payment success webhook: {e}")

def handle_payment_failure(payment_intent):
    """Handle failed payment"""
    payment_intent_id = payment_intent['id']
    logger.warning(f"Payment failed: {payment_intent_id}")
    
    # You could mark orders as failed or send notification emails here

def handle_payment_created(payment_intent):
    """Handle payment intent creation"""
    payment_intent_id = payment_intent['id']
    logger.info(f"Payment intent created: {payment_intent_id}")

