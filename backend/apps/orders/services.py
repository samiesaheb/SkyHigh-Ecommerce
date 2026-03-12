"""
Orders service layer - contains business logic for order operations
"""
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Order, OrderItem
from products.models import Product, Brand
import logging

logger = logging.getLogger(__name__)

class OrderService:
    """
    Service class for order-related business logic
    """
    
    @staticmethod
    def create_order(user=None, full_name=None, email=None, address=None, 
                    city=None, country=None, zip_code=None, cart_items=None):
        """
        Create a new order from cart items
        """
        try:
            # Create the order
            order = Order.objects.create(
                user=user,
                full_name=full_name,
                email=email,
                address=address,
                city=city,
                country=country,
                zip=zip_code
            )
            
            # Create order items from cart
            if cart_items:
                for item in cart_items:
                    OrderItem.objects.create(
                        order=order,
                        product=item['product'],
                        quantity=item['quantity'],
                        price=item['price']
                    )
            
            logger.info(f"Order created successfully: {order.id}")
            return order
            
        except Exception as e:
            logger.error(f"Error creating order: {str(e)}")
            raise
    
    @staticmethod
    def get_user_orders(user, limit=None):
        """
        Get orders for a specific user
        """
        try:
            orders = Order.objects.filter(user=user).prefetch_related(
                'items__product', 'items__product__brand'
            ).order_by('-created_at')
            
            if limit:
                orders = orders[:limit]
            
            return orders
            
        except Exception as e:
            logger.error(f"Error fetching user orders: {str(e)}")
            return Order.objects.none()
    
    @staticmethod
    def get_order_details(order_id, user=None):
        """
        Get detailed order information
        """
        try:
            query = Order.objects.prefetch_related(
                'items__product', 'items__product__brand'
            )
            
            if user:
                query = query.filter(user=user)
            
            order = query.get(id=order_id)
            return order
            
        except Order.DoesNotExist:
            logger.warning(f"Order not found: {order_id}")
            return None
        except Exception as e:
            logger.error(f"Error fetching order details: {str(e)}")
            return None

class AnalyticsService:
    """
    Service class for analytics and reporting
    """
    
    @staticmethod
    def get_sales_overview(days=30):
        """
        Get sales overview for the specified number of days
        """
        try:
            end_date = timezone.now()
            start_date = end_date - timedelta(days=days)
            
            orders = Order.objects.filter(created_at__gte=start_date)
            
            total_orders = orders.count()
            total_revenue = sum(order.get_total_price() for order in orders)
            avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
            
            return {
                'total_orders': total_orders,
                'total_revenue': total_revenue,
                'avg_order_value': avg_order_value,
                'period_days': days,
                'start_date': start_date,
                'end_date': end_date
            }
            
        except Exception as e:
            logger.error(f"Error generating sales overview: {str(e)}")
            return {
                'total_orders': 0,
                'total_revenue': 0,
                'avg_order_value': 0,
                'period_days': days,
                'start_date': None,
                'end_date': None
            }
    
    @staticmethod
    def get_daily_sales(days=7):
        """
        Get daily sales data for the specified number of days
        """
        try:
            end_date = timezone.now().date()
            start_date = end_date - timedelta(days=days)
            
            daily_sales = []
            current_date = start_date
            
            while current_date <= end_date:
                next_date = current_date + timedelta(days=1)
                
                orders = Order.objects.filter(
                    created_at__date=current_date
                )
                
                total_orders = orders.count()
                total_revenue = sum(order.get_total_price() for order in orders)
                
                daily_sales.append({
                    'date': current_date,
                    'orders': total_orders,
                    'revenue': total_revenue
                })
                
                current_date = next_date
            
            return daily_sales
            
        except Exception as e:
            logger.error(f"Error generating daily sales: {str(e)}")
            return []
    
    @staticmethod
    def get_top_products(limit=10, days=30):
        """
        Get top selling products
        """
        try:
            end_date = timezone.now()
            start_date = end_date - timedelta(days=days)
            
            top_products = OrderItem.objects.filter(
                order__created_at__gte=start_date
            ).values(
                'product__name', 'product__brand__name'
            ).annotate(
                total_quantity=Sum('quantity'),
                total_revenue=Sum('price')
            ).order_by('-total_quantity')[:limit]
            
            return list(top_products)
            
        except Exception as e:
            logger.error(f"Error generating top products: {str(e)}")
            return []
    
    @staticmethod
    def get_brand_performance(days=30):
        """
        Get performance metrics by brand
        """
        try:
            end_date = timezone.now()
            start_date = end_date - timedelta(days=days)
            
            brand_performance = OrderItem.objects.filter(
                order__created_at__gte=start_date
            ).values(
                'product__brand__name', 'product__brand__slug'
            ).annotate(
                total_orders=Count('order', distinct=True),
                total_quantity=Sum('quantity'),
                total_revenue=Sum('price'),
                avg_order_value=Avg('price')
            ).order_by('-total_revenue')
            
            return list(brand_performance)
            
        except Exception as e:
            logger.error(f"Error generating brand performance: {str(e)}")
            return []
    
    @staticmethod
    def get_customer_insights(days=30):
        """
        Get customer behavior insights
        """
        try:
            end_date = timezone.now()
            start_date = end_date - timedelta(days=days)
            
            orders = Order.objects.filter(created_at__gte=start_date)
            
            total_customers = orders.values('user').distinct().count()
            new_customers = orders.filter(
                user__date_joined__gte=start_date
            ).values('user').distinct().count()
            
            repeat_customers = orders.values('user').annotate(
                order_count=Count('id')
            ).filter(order_count__gt=1).count()
            
            return {
                'total_customers': total_customers,
                'new_customers': new_customers,
                'repeat_customers': repeat_customers,
                'repeat_customer_rate': (repeat_customers / total_customers * 100) if total_customers > 0 else 0
            }
            
        except Exception as e:
            logger.error(f"Error generating customer insights: {str(e)}")
            return {
                'total_customers': 0,
                'new_customers': 0,
                'repeat_customers': 0,
                'repeat_customer_rate': 0
            }