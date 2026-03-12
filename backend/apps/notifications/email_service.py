"""
Email notification service for Sky High International
Handles all email communications including order confirmations, shipping updates, etc.
"""

import logging
from typing import Dict, List, Optional, Any
from django.conf import settings
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils import timezone
from orders.models import Order

logger = logging.getLogger(__name__)

class EmailService:
    """Centralized email service for all Sky High communications"""

    def __init__(self):
        self.from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@skyhigh-inter.com')
        self.company_name = "Sky High International Co., Ltd."

    def send_order_confirmation(self, order: Order) -> bool:
        """Send order confirmation email to customer"""
        try:
            # Calculate order details
            items = order.items.select_related("product").all()
            item_details = []
            total_amount = 0

            for item in items:
                price = float(item.price)
                subtotal = price * item.quantity
                total_amount += subtotal

                item_details.append({
                    'name': item.product.name,
                    'quantity': item.quantity,
                    'price': price,
                    'subtotal': subtotal,
                })

            # Email context
            context = {
                'order': order,
                'items': item_details,
                'total_amount': total_amount,
                'company_name': self.company_name,
                'order_date': order.created_at.strftime('%B %d, %Y'),
                'payment_status': 'Confirmed' if order.is_paid else 'Pending',
            }

            # Generate HTML and text versions
            html_content = self._render_email_template('order_confirmation.html', context)
            text_content = self._generate_order_confirmation_text(order, item_details, total_amount)

            subject = f"Order Confirmation #{order.id} - {self.company_name}"

            return self._send_html_email(
                subject=subject,
                html_content=html_content,
                text_content=text_content,
                recipient_list=[order.email]
            )

        except Exception as e:
            logger.error(f"Failed to send order confirmation for order {order.id}: {e}")
            return False

    def send_shipping_notification(self, order: Order, tracking_number: str) -> bool:
        """Send shipping notification with tracking information"""
        try:
            context = {
                'order': order,
                'tracking_number': tracking_number,
                'company_name': self.company_name,
                'ship_date': timezone.now().strftime('%B %d, %Y'),
            }

            html_content = self._render_email_template('shipping_notification.html', context)
            text_content = f"""
Hi {order.full_name},

Great news! Your order #{order.id} has been shipped and is on its way to you.

Tracking Number: {tracking_number}
Ship Date: {context['ship_date']}

You should receive your package within 3-5 business days.

Thank you for choosing {self.company_name}!

Stay beautiful!
{self.company_name}
            """.strip()

            subject = f"Your Order #{order.id} Has Shipped!"

            return self._send_html_email(
                subject=subject,
                html_content=html_content,
                text_content=text_content,
                recipient_list=[order.email]
            )

        except Exception as e:
            logger.error(f"Failed to send shipping notification for order {order.id}: {e}")
            return False

    def send_welcome_email(self, user_email: str, user_name: str) -> bool:
        """Send welcome email to new users"""
        try:
            context = {
                'user_name': user_name,
                'company_name': self.company_name,
                'website_url': getattr(settings, 'FRONTEND_URL', 'https://skyhigh-inter.com'),
            }

            html_content = self._render_email_template('welcome.html', context)
            text_content = f"""
Welcome to {self.company_name}, {user_name}!

Thank you for joining our community of beauty enthusiasts.

As a member, you'll enjoy:
• Exclusive access to new products
• Special member discounts
• Beauty tips and tutorials
• Personalized product recommendations

Start exploring our premium cosmetic collections at {context['website_url']}

Stay beautiful!
{self.company_name}
            """.strip()

            subject = f"Welcome to {self.company_name}!"

            return self._send_html_email(
                subject=subject,
                html_content=html_content,
                text_content=text_content,
                recipient_list=[user_email]
            )

        except Exception as e:
            logger.error(f"Failed to send welcome email to {user_email}: {e}")
            return False

    def send_password_reset(self, user_email: str, reset_link: str) -> bool:
        """Send password reset email"""
        try:
            context = {
                'reset_link': reset_link,
                'company_name': self.company_name,
            }

            html_content = self._render_email_template('password_reset.html', context)
            text_content = f"""
Password Reset Request

Someone requested a password reset for your {self.company_name} account.

If this was you, click the link below to reset your password:
{reset_link}

If you didn't request this reset, please ignore this email. Your password will remain unchanged.

This link will expire in 24 hours for security reasons.

{self.company_name}
            """.strip()

            subject = f"Password Reset - {self.company_name}"

            return self._send_html_email(
                subject=subject,
                html_content=html_content,
                text_content=text_content,
                recipient_list=[user_email]
            )

        except Exception as e:
            logger.error(f"Failed to send password reset email to {user_email}: {e}")
            return False

    def send_order_status_update(self, order: Order, old_status: str, new_status: str) -> bool:
        """Send email when order status changes"""
        try:
            status_messages = {
                'processing': 'Your order is being prepared',
                'shipped': 'Your order is on its way',
                'delivered': 'Your order has been delivered',
                'cancelled': 'Your order has been cancelled',
            }

            context = {
                'order': order,
                'old_status': old_status,
                'new_status': new_status,
                'status_message': status_messages.get(new_status, f'Status updated to {new_status}'),
                'company_name': self.company_name,
            }

            html_content = self._render_email_template('order_status_update.html', context)
            text_content = f"""
Hi {order.full_name},

Your order #{order.id} status has been updated.

Previous Status: {old_status.title()}
New Status: {new_status.title()}

{context['status_message']}.

You can track your order at any time by visiting our website.

Thank you for choosing {self.company_name}!

Stay beautiful!
{self.company_name}
            """.strip()

            subject = f"Order #{order.id} Status Update - {new_status.title()}"

            return self._send_html_email(
                subject=subject,
                html_content=html_content,
                text_content=text_content,
                recipient_list=[order.email]
            )

        except Exception as e:
            logger.error(f"Failed to send status update email for order {order.id}: {e}")
            return False

    def _send_html_email(self, subject: str, html_content: str, text_content: str,
                        recipient_list: List[str]) -> bool:
        """Send HTML email with text fallback"""
        try:
            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=self.from_email,
                to=recipient_list
            )
            msg.attach_alternative(html_content, "text/html")
            msg.send()

            logger.info(f"Email sent successfully to {', '.join(recipient_list)}: {subject}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {', '.join(recipient_list)}: {e}")
            return False

    def _render_email_template(self, template_name: str, context: Dict[str, Any]) -> str:
        """Render email template with context"""
        try:
            return render_to_string(f'emails/{template_name}', context)
        except Exception as e:
            logger.error(f"Failed to render email template {template_name}: {e}")
            # Return basic fallback HTML
            return f"<html><body><p>Email content unavailable.</p></body></html>"

    def _generate_order_confirmation_text(self, order: Order, items: List[Dict], total: float) -> str:
        """Generate plain text order confirmation"""
        item_lines = []
        for item in items:
            item_lines.append(f"- {item['name']} (x{item['quantity']}): ฿{item['subtotal']:.2f}")

        return f"""
Hi {order.full_name},

Thank you for your order! We've received your payment and are preparing your items.

Order Details:
Order Number: #{order.id}
Order Date: {order.created_at.strftime('%B %d, %Y')}

Items Ordered:
{chr(10).join(item_lines)}

Total: ฿{total:.2f}

Shipping Address:
{order.address}
{order.city}, {order.zip}
{order.country}

We'll send you another email when your order ships with tracking information.

Thank you for choosing {self.company_name}!

Stay beautiful!
{self.company_name}
        """.strip()

# Create singleton instance
email_service = EmailService()