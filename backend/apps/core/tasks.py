from celery import shared_task
from django.contrib.sessions.models import Session
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

@shared_task
def cleanup_expired_sessions():
    """Remove expired sessions from database"""
    try:
        expired_sessions = Session.objects.filter(expire_date__lt=timezone.now())
        count = expired_sessions.count()
        expired_sessions.delete()
        logger.info(f"Cleaned up {count} expired sessions")
        return f"Cleaned up {count} expired sessions"
    except Exception as e:
        logger.error(f"Error cleaning up sessions: {str(e)}")
        return f"Error: {str(e)}"

@shared_task
def send_async_email(subject, message, from_email, recipient_list):
    """Send email asynchronously"""
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        logger.info(f"Email sent to {recipient_list}")
        return f"Email sent successfully to {recipient_list}"
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        return f"Error sending email: {str(e)}"

@shared_task
def update_search_index():
    """Update Elasticsearch search index"""
    try:
        from django_elasticsearch_dsl.management.commands.search_index import Command
        from io import StringIO
        import sys
        
        # Capture output
        old_stdout = sys.stdout
        sys.stdout = buffer = StringIO()
        
        try:
            # Rebuild the search index
            command = Command()
            command.handle(action='rebuild', force=True, parallel=True)
            output = buffer.getvalue()
            logger.info(f"Search index updated: {output}")
            return f"Search index updated successfully"
        finally:
            sys.stdout = old_stdout
            
    except Exception as e:
        logger.error(f"Error updating search index: {str(e)}")
        return f"Error updating search index: {str(e)}"

@shared_task
def generate_sales_report():
    """Generate and cache sales report"""
    try:
        from orders.analytics import AnalyticsService
        from django.core.cache import cache
        
        # Generate comprehensive sales data
        sales_data = {
            'overview': AnalyticsService.get_sales_overview(30),
            'daily_sales': AnalyticsService.get_daily_sales(30),
            'top_products': AnalyticsService.get_top_products(20, 30),
            'brand_performance': AnalyticsService.get_brand_performance(30),
            'customer_insights': AnalyticsService.get_customer_insights(30),
        }
        
        # Cache the report for quick access
        cache.set('sales_report_monthly', sales_data, 60 * 60 * 6)  # 6 hours
        
        logger.info("Monthly sales report generated and cached")
        return "Sales report generated successfully"
        
    except Exception as e:
        logger.error(f"Error generating sales report: {str(e)}")
        return f"Error generating sales report: {str(e)}"