from django.db import models
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Order, OrderItem
from products.models import Product, Brand

class AnalyticsService:
    @staticmethod
    def get_sales_overview(days=30):
        """Get sales overview for the last N days"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        orders = Order.objects.filter(created_at__range=(start_date, end_date))
        
        total_revenue = sum(order.get_total_price() for order in orders)
        total_orders = orders.count()
        avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
        
        return {
            'total_revenue': float(total_revenue),
            'total_orders': total_orders,
            'average_order_value': float(avg_order_value),
            'period_days': days
        }
    
    @staticmethod
    def get_daily_sales(days=14):
        """Get daily sales data for charts"""
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Get orders grouped by day
        daily_data = []
        current_date = start_date
        
        while current_date <= end_date:
            next_date = current_date + timedelta(days=1)
            
            orders = Order.objects.filter(
                created_at__date=current_date
            )
            
            daily_revenue = sum(order.get_total_price() for order in orders)
            daily_orders = orders.count()
            
            daily_data.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'revenue': float(daily_revenue),
                'orders': daily_orders
            })
            
            current_date = next_date
        
        return daily_data
    
    @staticmethod
    def get_top_products(limit=10, days=30):
        """Get top selling products by quantity and revenue"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        # Top by quantity
        top_by_quantity = (
            OrderItem.objects
            .filter(order__created_at__range=(start_date, end_date))
            .values('product__name', 'product__id')
            .annotate(total_quantity=Sum('quantity'))
            .order_by('-total_quantity')[:limit]
        )
        
        # Top by revenue
        top_by_revenue = (
            OrderItem.objects
            .filter(order__created_at__range=(start_date, end_date))
            .values('product__name', 'product__id')
            .annotate(
                total_revenue=Sum(models.F('quantity') * models.F('price'))
            )
            .order_by('-total_revenue')[:limit]
        )
        
        return {
            'by_quantity': [
                {
                    'name': item['product__name'],
                    'product_id': item['product__id'],
                    'quantity': item['total_quantity']
                }
                for item in top_by_quantity
            ],
            'by_revenue': [
                {
                    'name': item['product__name'],
                    'product_id': item['product__id'],
                    'revenue': float(item['total_revenue'])
                }
                for item in top_by_revenue
            ]
        }
    
    @staticmethod
    def get_brand_performance(days=30):
        """Get brand performance metrics"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        brand_data = (
            OrderItem.objects
            .filter(order__created_at__range=(start_date, end_date))
            .values('product__brand__name', 'product__brand__id')
            .annotate(
                total_quantity=Sum('quantity'),
                total_revenue=Sum(models.F('quantity') * models.F('price')),
                order_count=Count('order', distinct=True)
            )
            .order_by('-total_revenue')
        )
        
        return [
            {
                'brand_name': item['product__brand__name'],
                'brand_id': item['product__brand__id'],
                'quantity': item['total_quantity'],
                'revenue': float(item['total_revenue']),
                'orders': item['order_count']
            }
            for item in brand_data
        ]
    
    @staticmethod
    def get_customer_insights(days=30):
        """Get customer analytics"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        orders = Order.objects.filter(created_at__range=(start_date, end_date))
        
        # Geographic distribution
        geo_data = (
            orders.values('country')
            .annotate(
                order_count=Count('id'),
                revenue=Sum('items__quantity') * Sum('items__price')
            )
            .order_by('-order_count')
        )
        
        # New vs returning customers (simplified)
        total_customers = orders.values('user').distinct().count()
        
        return {
            'total_customers': total_customers,
            'geographic_distribution': [
                {
                    'country': item['country'],
                    'orders': item['order_count']
                }
                for item in geo_data[:10]  # Top 10 countries
            ]
        }
    
    @staticmethod
    def get_inventory_insights():
        """Get inventory and stock analytics"""
        from inventory.models import StockLevel, StockAlert
        from products.models import Product
        
        # Stock status distribution
        stock_status = (
            StockLevel.objects
            .values('status')
            .annotate(count=Count('id'))
        )
        
        # Low stock alerts
        low_stock_count = StockAlert.objects.filter(
            alert_type__in=['low_stock', 'out_of_stock'],
            is_resolved=False
        ).count()
        
        # Products without stock tracking
        products_without_stock = Product.objects.filter(stock_level__isnull=True).count()
        
        # Total inventory value
        total_inventory_value = sum(
            level.quantity * level.product.price
            for level in StockLevel.objects.select_related('product').all()
            if level.product.price
        )
        
        return {
            'stock_status_distribution': [
                {
                    'status': item['status'],
                    'count': item['count']
                }
                for item in stock_status
            ],
            'low_stock_alerts': low_stock_count,
            'products_without_stock': products_without_stock,
            'total_inventory_value': float(total_inventory_value)
        }
    
    @staticmethod
    def get_conversion_metrics(days=30):
        """Get conversion and engagement metrics"""
        from products.models import Product
        
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        # Wishlist conversion (if wishlist app is available)
        try:
            from wishlist.models import WishlistItem
            wishlist_items = WishlistItem.objects.filter(
                added_at__range=(start_date, end_date)
            )
            
            # Check how many wishlist items were later purchased
            purchased_from_wishlist = 0
            for item in wishlist_items:
                if OrderItem.objects.filter(
                    product=item.product,
                    order__user=item.wishlist.user,
                    order__created_at__gte=item.added_at
                ).exists():
                    purchased_from_wishlist += 1
            
            wishlist_conversion_rate = (
                purchased_from_wishlist / wishlist_items.count() * 100
                if wishlist_items.count() > 0 else 0
            )
        except ImportError:
            wishlist_conversion_rate = 0
            
        return {
            'wishlist_conversion_rate': round(wishlist_conversion_rate, 2)
        }
    
    @staticmethod
    def get_financial_summary(days=30):
        """Get comprehensive financial metrics"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        orders = Order.objects.filter(created_at__range=(start_date, end_date))
        
        # Revenue metrics
        total_revenue = sum(order.get_total_price() for order in orders)
        
        # Cost analysis (approximate based on product cost if available)
        total_cost = 0
        total_profit = 0
        
        for order in orders:
            for item in order.items.all():
                # Assuming 60% margin (40% cost) if no cost data available
                item_cost = float(item.price) * 0.4 * item.quantity
                item_profit = float(item.price) * 0.6 * item.quantity
                total_cost += item_cost
                total_profit += item_profit
        
        profit_margin = (total_profit / total_revenue * 100) if total_revenue > 0 else 0
        
        # Monthly comparison
        prev_start = start_date - timedelta(days=days)
        prev_orders = Order.objects.filter(created_at__range=(prev_start, start_date))
        prev_revenue = sum(order.get_total_price() for order in prev_orders)
        
        revenue_growth = (
            (total_revenue - prev_revenue) / prev_revenue * 100
            if prev_revenue > 0 else 0
        )
        
        return {
            'total_revenue': float(total_revenue),
            'total_cost': float(total_cost),
            'total_profit': float(total_profit),
            'profit_margin': round(profit_margin, 2),
            'revenue_growth': round(revenue_growth, 2),
            'previous_period_revenue': float(prev_revenue)
        }
    
    @staticmethod
    def get_comprehensive_dashboard(days=30):
        """Get all analytics data for dashboard"""
        return {
            'sales_overview': AnalyticsService.get_sales_overview(days),
            'daily_sales': AnalyticsService.get_daily_sales(14),
            'top_products': AnalyticsService.get_top_products(10, days),
            'brand_performance': AnalyticsService.get_brand_performance(days),
            'customer_insights': AnalyticsService.get_customer_insights(days),
            'inventory_insights': AnalyticsService.get_inventory_insights(),
            'conversion_metrics': AnalyticsService.get_conversion_metrics(days),
            'financial_summary': AnalyticsService.get_financial_summary(days),
            'generated_at': timezone.now().isoformat(),
            'period_days': days
        }