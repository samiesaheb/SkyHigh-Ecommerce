from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from products.models import Product
from core.throttling import CartRateThrottle
from .models import Cart, CartItem
from .serializers import (
    CartSerializer, 
    AddToCartSerializer, 
    UpdateCartItemSerializer
)
from .services import CartService
import logging

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name="dispatch")
class CartView(APIView):
    """
    Handle cart operations: GET, POST (add items)
    """
    permission_classes = [AllowAny]
    throttle_classes = [CartRateThrottle]
    
    def get(self, request):
        """Get current cart contents"""
        try:
            user = request.user if request.user.is_authenticated else None
            session_key = request.session.session_key
            
            if not session_key and not user:
                # Create session if it doesn't exist
                request.session.create()
                session_key = request.session.session_key
            
            cart_summary = CartService.get_cart_summary(
                user=user, 
                session_key=session_key,
                request=request
            )
            
            serializer = CartSerializer(cart_summary['cart'])
            
            return Response({
                'cart': serializer.data,
                'summary': {
                    'total_items': cart_summary['total_items'],
                    'total_price': str(cart_summary['total_price']),
                    'items_count': cart_summary['items_count']
                }
            })
            
        except Exception as e:
            logger.error(f"Error getting cart: {str(e)}")
            return Response(
                {'error': 'Failed to retrieve cart'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request):
        """Add item to cart"""
        try:
            serializer = AddToCartSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(
                    {'errors': serializer.errors}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate product exists
            product_id = serializer.validated_data['product_id']
            try:
                product = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                return Response(
                    {'error': 'Product not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            user = request.user if request.user.is_authenticated else None
            session_key = request.session.session_key
            
            if not session_key and not user:
                request.session.create()
                session_key = request.session.session_key
            
            cart_item = CartService.add_to_cart(
                user=user,
                session_key=session_key,
                product_id=product_id,
                quantity=serializer.validated_data['quantity']
            )
            
            # Return updated cart
            cart = cart_item.cart
            cart_serializer = CartSerializer(cart)
            
            return Response({
                'message': f'Added {product.name} to cart',
                'cart': cart_serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error adding to cart: {str(e)}")
            return Response(
                {'error': 'Failed to add item to cart'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@method_decorator(csrf_exempt, name="dispatch")
class CartItemView(APIView):
    """
    Handle individual cart item operations: PUT (update), DELETE
    """
    permission_classes = [AllowAny]
    throttle_classes = [CartRateThrottle]
    
    def put(self, request, product_id):
        """Update cart item quantity"""
        try:
            serializer = UpdateCartItemSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(
                    {'errors': serializer.errors}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user = request.user if request.user.is_authenticated else None
            session_key = request.session.session_key
            
            cart_item = CartService.update_cart_item(
                user=user,
                session_key=session_key,
                product_id=product_id,
                quantity=serializer.validated_data['quantity']
            )
            
            if cart_item:
                cart_serializer = CartSerializer(cart_item.cart)
                return Response({
                    'message': 'Cart updated successfully',
                    'cart': cart_serializer.data
                })
            else:
                # Item was removed
                cart = CartService.get_or_create_cart(user=user, session_key=session_key)
                cart_serializer = CartSerializer(cart)
                return Response({
                    'message': 'Item removed from cart',
                    'cart': cart_serializer.data
                })
                
        except Exception as e:
            logger.error(f"Error updating cart item: {str(e)}")
            return Response(
                {'error': 'Failed to update cart item'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request, product_id):
        """Remove item from cart"""
        try:
            user = request.user if request.user.is_authenticated else None
            session_key = request.session.session_key
            
            # Use migration-aware removal that handles both database and legacy session cart
            success = CartService.remove_from_cart_with_migration(
                user=user,
                session_key=session_key,
                product_id=product_id,
                request=request
            )
            
            if success:
                cart = CartService.get_or_create_cart(user=user, session_key=session_key)
                cart_serializer = CartSerializer(cart)
                return Response({
                    'message': 'Item removed from cart',
                    'cart': cart_serializer.data
                })
            else:
                return Response(
                    {'error': 'Item not found in cart'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
                
        except Exception as e:
            logger.error(f"Error removing cart item: {str(e)}")
            return Response(
                {'error': 'Failed to remove cart item'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@method_decorator(csrf_exempt, name="dispatch")
class ClearCartView(APIView):
    """
    Clear all items from cart
    """
    permission_classes = [AllowAny]
    
    def delete(self, request):
        """Clear all cart items"""
        try:
            user = request.user if request.user.is_authenticated else None
            session_key = request.session.session_key
            
            cart = CartService.clear_cart(user=user, session_key=session_key)
            cart_serializer = CartSerializer(cart)
            
            return Response({
                'message': 'Cart cleared successfully',
                'cart': cart_serializer.data
            })
            
        except Exception as e:
            logger.error(f"Error clearing cart: {str(e)}")
            return Response(
                {'error': 'Failed to clear cart'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )