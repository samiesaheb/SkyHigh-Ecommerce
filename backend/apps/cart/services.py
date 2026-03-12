from django.shortcuts import get_object_or_404
from django.db import transaction
from products.models import Product
from .models import Cart, CartItem
import logging

logger = logging.getLogger(__name__)

class CartService:
    """
    Business logic for cart operations
    """
    
    @staticmethod
    def get_or_create_cart(user=None, session_key=None):
        """
        Get or create a cart for the user or session
        """
        if user and user.is_authenticated:
            cart, created = Cart.objects.get_or_create(user=user)
            # Merge session cart with user cart if exists
            if not created and session_key:
                CartService._merge_session_cart(cart, session_key)
        elif session_key:
            cart, created = Cart.objects.get_or_create(session_key=session_key)
        else:
            raise ValueError("Either user or session_key must be provided")
        
        return cart
    
    @staticmethod
    def _merge_session_cart(user_cart, session_key):
        """
        Merge anonymous session cart with user cart when user logs in
        """
        try:
            session_cart = Cart.objects.get(session_key=session_key)
            for item in session_cart.items.all():
                CartService.add_to_cart(
                    cart=user_cart,
                    product_id=item.product.id,
                    quantity=item.quantity
                )
            session_cart.delete()
        except Cart.DoesNotExist:
            pass
    
    @staticmethod
    @transaction.atomic
    def add_to_cart(cart=None, user=None, session_key=None, product_id=None, quantity=1):
        """
        Add a product to the cart or update quantity if it already exists
        """
        if not cart:
            cart = CartService.get_or_create_cart(user=user, session_key=session_key)
        
        product = get_object_or_404(Product, id=product_id)
        
        # Check if item already exists in cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            # Item exists, update quantity
            cart_item.quantity += quantity
            cart_item.save()
        
        return cart_item
    
    @staticmethod
    @transaction.atomic
    def update_cart_item(cart=None, user=None, session_key=None, product_id=None, quantity=0):
        """
        Update cart item quantity or remove if quantity is 0
        """
        if not cart:
            cart = CartService.get_or_create_cart(user=user, session_key=session_key)
        
        try:
            cart_item = CartItem.objects.get(cart=cart, product_id=product_id)
            
            if quantity <= 0:
                cart_item.delete()
                return None
            else:
                cart_item.quantity = quantity
                cart_item.save()
                return cart_item
                
        except CartItem.DoesNotExist:
            if quantity > 0:
                # Create new cart item if it doesn't exist
                return CartService.add_to_cart(
                    cart=cart, 
                    product_id=product_id, 
                    quantity=quantity
                )
            return None
    
    @staticmethod
    def remove_from_cart(cart=None, user=None, session_key=None, product_id=None):
        """
        Remove a specific item from cart
        """
        if not cart:
            cart = CartService.get_or_create_cart(user=user, session_key=session_key)
        
        try:
            cart_item = CartItem.objects.get(cart=cart, product_id=product_id)
            cart_item.delete()
            return True
        except CartItem.DoesNotExist:
            return False
    
    @staticmethod
    def clear_cart(cart=None, user=None, session_key=None):
        """
        Clear all items from cart
        """
        if not cart:
            cart = CartService.get_or_create_cart(user=user, session_key=session_key)
        
        cart.clear()
        return cart
    
    @staticmethod
    def get_cart_summary(cart=None, user=None, session_key=None, request=None):
        """
        Get cart with items and summary information
        """
        if not cart:
            cart = CartService.get_or_create_cart(user=user, session_key=session_key)
        
        # Check for legacy session cart data and migrate if needed
        if request:
            CartService._migrate_legacy_session_cart(cart, request)
        
        return {
            'cart': cart,
            'total_items': cart.total_items,
            'total_price': cart.total_price,
            'items_count': cart.items.count()
        }
    
    @staticmethod
    @transaction.atomic
    def _migrate_legacy_session_cart(cart, request):
        """
        Migrate old session-based cart data to new database cart
        """
        try:
            legacy_cart = request.session.get('cart', {})
            if not legacy_cart:
                return
            
            logger.info(f"Found legacy cart data, migrating {len(legacy_cart)} items")
            
            for product_id, item_data in legacy_cart.items():
                try:
                    if not isinstance(item_data, dict):
                        continue
                    
                    # Try to get the product
                    try:
                        product = Product.objects.get(id=int(product_id))
                    except (Product.DoesNotExist, ValueError):
                        logger.warning(f"Product {product_id} not found during migration")
                        continue
                    
                    quantity = item_data.get('quantity', 1)
                    if quantity > 0:
                        # Add to new database cart
                        CartService.add_to_cart(
                            cart=cart,
                            product_id=product.id,
                            quantity=quantity
                        )
                        logger.info(f"Migrated product {product.name} (qty: {quantity})")
                
                except Exception as e:
                    logger.error(f"Error migrating cart item {product_id}: {str(e)}")
                    continue
            
            # Clear the legacy session cart after successful migration
            request.session['cart'] = {}
            request.session.modified = True
            logger.info("Legacy cart migration completed and session cart cleared")
            
        except Exception as e:
            logger.error(f"Error during legacy cart migration: {str(e)}")
    
    @staticmethod
    def remove_from_cart_with_migration(user=None, session_key=None, product_id=None, request=None):
        """
        Remove item from cart, handling both new database cart and legacy session cart
        """
        cart = CartService.get_or_create_cart(user=user, session_key=session_key)
        
        # First try to remove from database cart
        database_removed = CartService.remove_from_cart(cart=cart, product_id=product_id)
        
        # Also try to remove from legacy session cart if it exists
        legacy_removed = False
        if request and 'cart' in request.session:
            legacy_cart = request.session.get('cart', {})
            product_id_str = str(product_id)
            if product_id_str in legacy_cart:
                del legacy_cart[product_id_str]
                request.session['cart'] = legacy_cart
                request.session.modified = True
                legacy_removed = True
                logger.info(f"Removed product {product_id} from legacy session cart")
        
        return database_removed or legacy_removed