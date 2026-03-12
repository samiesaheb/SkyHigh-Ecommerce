from django.http import JsonResponse
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
from django.views import View
from orders.analytics import AnalyticsService
import json

@method_decorator(staff_member_required, name='dispatch')
class ComprehensiveDashboardView(View):
    """
    Comprehensive dashboard API endpoint for admin analytics
    """
    
    def get(self, request):
        """Get comprehensive dashboard data"""
        days = int(request.GET.get('days', 30))
        
        try:
            dashboard_data = AnalyticsService.get_comprehensive_dashboard(days)
            
            # Add additional system metrics
            dashboard_data['system_metrics'] = self._get_system_metrics()
            
            return JsonResponse({
                'success': True,
                'data': dashboard_data
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
    
    def _get_system_metrics(self):
        """Get system-wide metrics"""
        from django.contrib.auth import get_user_model
        from products.models import Product, Brand
        from orders.models import Order
        
        User = get_user_model()
        
        # Count various entities
        total_users = User.objects.count()
        total_products = Product.objects.count()
        total_brands = Brand.objects.count()
        total_orders = Order.objects.count()
        
        # Recent activity (last 7 days)
        from django.utils import timezone
        from datetime import timedelta
        
        week_ago = timezone.now() - timedelta(days=7)
        new_users_week = User.objects.filter(date_joined__gte=week_ago).count()
        new_orders_week = Order.objects.filter(created_at__gte=week_ago).count()
        
        return {
            'total_users': total_users,
            'total_products': total_products,
            'total_brands': total_brands,
            'total_orders': total_orders,
            'new_users_this_week': new_users_week,
            'new_orders_this_week': new_orders_week
        }

@method_decorator(staff_member_required, name='dispatch')
class InventoryDashboardView(View):
    """
    Inventory-focused dashboard for stock management
    """
    
    def get(self, request):
        """Get inventory dashboard data"""
        try:
            from inventory.models import StockLevel, StockAlert, PurchaseOrder
            
            # Stock alerts summary
            critical_alerts = StockAlert.objects.filter(
                priority='critical',
                is_resolved=False
            ).count()
            
            high_alerts = StockAlert.objects.filter(
                priority='high',
                is_resolved=False
            ).count()
            
            # Purchase orders status
            pending_pos = PurchaseOrder.objects.filter(
                status__in=['draft', 'sent']
            ).count()
            
            # Low stock items
            low_stock_items = StockLevel.objects.filter(
                status='low_stock'
            ).select_related('product').values(
                'product__name',
                'product__id',
                'quantity',
                'low_stock_threshold'
            )[:10]
            
            # Out of stock items
            out_of_stock_count = StockLevel.objects.filter(
                status='out_of_stock'
            ).count()
            
            dashboard_data = {
                'alerts_summary': {
                    'critical_alerts': critical_alerts,
                    'high_alerts': high_alerts
                },
                'purchase_orders': {
                    'pending_orders': pending_pos
                },
                'stock_status': {
                    'out_of_stock_count': out_of_stock_count,
                    'low_stock_items': list(low_stock_items)
                }
            }
            
            return JsonResponse({
                'success': True,
                'data': dashboard_data
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)

@method_decorator(staff_member_required, name='dispatch')
class NotificationsDashboardView(View):
    """
    Notifications dashboard for system alerts and messaging
    """
    
    def get(self, request):
        """Get notifications dashboard data"""
        try:
            from notifications.models import Notification, NotificationQueue
            
            # Notification status summary
            pending_notifications = Notification.objects.filter(
                status='pending'
            ).count()
            
            failed_notifications = Notification.objects.filter(
                status='failed'
            ).count()
            
            # Queue status
            queued_notifications = NotificationQueue.objects.filter(
                is_processing=False
            ).count()
            
            # Recent notifications
            recent_notifications = Notification.objects.select_related(
                'template', 'user'
            ).order_by('-created_at')[:10].values(
                'id',
                'template__name',
                'user__email',
                'status',
                'created_at',
                'sent_at'
            )
            
            dashboard_data = {
                'status_summary': {
                    'pending': pending_notifications,
                    'failed': failed_notifications,
                    'queued': queued_notifications
                },
                'recent_notifications': list(recent_notifications)
            }
            
            return JsonResponse({
                'success': True,
                'data': dashboard_data
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)