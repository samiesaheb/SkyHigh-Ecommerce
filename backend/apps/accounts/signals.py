import logging
from django.dispatch import receiver
from allauth.account.signals import user_signed_up
from django.core.mail import send_mail
from django.conf import settings
from notifications.email_service import email_service

logger = logging.getLogger(__name__)

@receiver(user_signed_up)
def send_welcome_email(request, user, **kwargs):
    """Send welcome email to newly registered users using EmailService"""
    try:
        # Get user's display name (first_name or email)
        user_name = user.first_name or user.email.split('@')[0]

        # Send welcome email using EmailService
        email_sent = email_service.send_welcome_email(
            user_email=user.email,
            user_name=user_name
        )

        if email_sent:
            logger.info(f"✅ Welcome email sent to new user: {user.email}")
        else:
            logger.warning(f"⚠️ Failed to send welcome email to: {user.email}")

    except Exception as e:
        logger.error(f"❌ Error sending welcome email to {user.email}: {e}")

        # Fallback to simple email if EmailService fails
        try:
            subject = "🎉 Welcome to Sky High!"
            message = f"Hi {user.email},\n\nThank you for signing up at Sky High International. We're excited to have you!"
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
            logger.info(f"📧 Fallback welcome email sent to: {user.email}")
        except Exception as fallback_error:
            logger.error(f"❌ Fallback email also failed for {user.email}: {fallback_error}")
