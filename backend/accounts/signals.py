from django.dispatch import receiver
from allauth.account.signals import user_signed_up
from django.core.mail import send_mail
from django.conf import settings

@receiver(user_signed_up)
def send_welcome_email(request, user, **kwargs):
    subject = "🎉 Welcome to Sky High!"
    message = f"Hi {user.email},\n\nThank you for signing up at Sky High International. We're excited to have you!"
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
