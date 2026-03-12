"""
Debug views to help diagnose cart issues
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Cart, CartItem
from .services import CartService
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([AllowAny])
def debug_cart_state(request):
    """
    Debug endpoint to see both session cart and database cart
    """
    try:
        user = request.user if request.user.is_authenticated else None
        session_key = request.session.session_key
        
        # Get session cart data
        if not request.session.session_key:
            request.session.create()
        session_cart = request.session.get('cart', {})
        
        # Get database cart
        try:
            if user and user.is_authenticated:
                db_cart = Cart.objects.filter(user=user).first()
            elif session_key:
                db_cart = Cart.objects.filter(session_key=session_key).first()
            else:
                db_cart = None
        except:
            db_cart = None
        
        # Get database cart items if cart exists
        db_cart_items = []
        if db_cart:
            db_cart_items = list(db_cart.items.values(
                'id', 'product__id', 'product__name', 'quantity', 'price_at_time'
            ))
        
        return Response({
            'session_key': session_key,
            'is_authenticated': user.is_authenticated if user else False,
            'user_id': user.id if user and user.is_authenticated else None,
            'session_cart': session_cart,
            'database_cart_id': db_cart.id if db_cart else None,
            'database_cart_items': db_cart_items,
            'session_cart_count': len(session_cart),
            'database_cart_count': len(db_cart_items),
        })
        
    except Exception as e:
        logger.error(f"Error in debug_cart_state: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def debug_clear_all_carts(request):
    """
    Debug endpoint to clear both session and database carts
    """
    try:
        # Clear session cart
        request.session['cart'] = {}
        request.session.modified = True
        
        # Clear database carts
        user = request.user if request.user.is_authenticated else None
        session_key = request.session.session_key
        
        deleted_carts = 0
        if user and user.is_authenticated:
            deleted_carts += Cart.objects.filter(user=user).delete()[0]
        if session_key:
            deleted_carts += Cart.objects.filter(session_key=session_key).delete()[0]
        
        return Response({
            'message': 'All carts cleared',
            'session_cart_cleared': True,
            'database_carts_deleted': deleted_carts
        })
        
    except Exception as e:
        logger.error(f"Error in debug_clear_all_carts: {str(e)}")
        return Response({'error': str(e)}, status=500)