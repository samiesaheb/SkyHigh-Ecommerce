"""
Backward compatibility layer for old cart endpoints
Maps old /api/products/cart/ endpoints to new /api/cart/ endpoints
"""
from django.http import JsonResponse
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from cart.views import CartView, CartItemView
from rest_framework.response import Response
import json
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["GET", "POST"])
def cart_compat_view(request):
    """
    Backward compatibility for /api/products/cart/
    Redirects to new cart API
    """
    try:
        # Use the new cart view
        cart_view = CartView()
        cart_view.request = request
        cart_view.format_kwarg = None
        
        if request.method == "POST":
            # Handle add to cart
            try:
                # Parse the JSON data from the request
                data = json.loads(request.body)
                product_id = data.get('product_id')
                quantity = data.get('quantity', 1)
                
                if not product_id:
                    return JsonResponse({'error': 'Product ID is required'}, status=400)
                
                # Use the cart service directly
                from cart.services import CartService
                from products.models import Product
                
                # Get or create session if needed
                if not request.session.session_key:
                    request.session.create()
                
                user = request.user if request.user.is_authenticated else None
                session_key = request.session.session_key
                
                # Validate product exists
                try:
                    Product.objects.get(id=product_id)
                except Product.DoesNotExist:
                    return JsonResponse({'error': 'Product not found'}, status=404)
                
                # Add to cart using the service
                cart_item = CartService.add_to_cart(
                    user=user,
                    session_key=session_key,
                    product_id=product_id,
                    quantity=quantity
                )
                
                # Get updated cart summary
                cart_summary = CartService.get_cart_summary(
                    user=user,
                    session_key=session_key,
                    request=request
                )
                
                # Transform response to old format
                items = []
                if cart_summary['cart'] and hasattr(cart_summary['cart'], 'items'):
                    for item in cart_summary['cart'].items.all():
                        items.append({
                            'id': item.product.id,
                            'name': item.product.name,
                            'price': float(item.product.price),
                            'quantity': item.quantity,
                            'main_image': item.product.main_image.url if item.product.main_image else '',
                        })
                
                return JsonResponse({'items': items}, status=200)
                
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON data'}, status=400)
            except Exception as e:
                logger.error(f"Error adding to cart: {str(e)}")
                return JsonResponse({'error': str(e)}, status=500)
        
        else:  # GET request
            response = cart_view.get(request)
            
            # Transform response to old format if needed
            if hasattr(response, 'data') and 'cart' in response.data:
                # Extract items for old format compatibility
                items = []
                if 'items' in response.data['cart']:
                    for item in response.data['cart']['items']:
                        items.append({
                            'id': item['product']['id'],
                            'name': item['product']['name'],
                            'price': float(item['product']['price']),
                            'quantity': item['quantity'],
                            'main_image': item['product']['main_image'],
                        })
                
                return JsonResponse({'items': items})
            
            return JsonResponse({'items': []})
        
    except Exception as e:
        logger.error(f"Error in cart_compat_view: {str(e)}")
        if request.method == "POST":
            return JsonResponse({'error': str(e)}, status=500)
        else:
            return JsonResponse({'items': []})

@csrf_exempt
@require_http_methods(["GET"])
def cart_quantity_compat_view(request):
    """
    Backward compatibility for /api/products/cart/quantity/
    """
    try:
        # Use the new cart view
        cart_view = CartView()
        cart_view.request = request
        cart_view.format_kwarg = None
        
        response = cart_view.get(request)
        
        total_quantity = 0
        if hasattr(response, 'data') and 'summary' in response.data:
            total_quantity = response.data['summary'].get('total_items', 0)
        
        return JsonResponse({'quantity': total_quantity})
        
    except Exception as e:
        logger.error(f"Error in cart_quantity_compat_view: {str(e)}")
        return JsonResponse({'quantity': 0})

@csrf_exempt
@require_http_methods(["POST"])
def update_cart_quantity(request):
    """
    Backward compatibility for updating cart item quantity
    """
    try:
        data = json.loads(request.body)
        product_id = data.get("product_id")
        quantity = data.get("quantity")
        
        if not product_id:
            return JsonResponse({"error": "Product ID required"}, status=400)
        
        if quantity is None:
            return JsonResponse({"error": "Quantity required"}, status=400)
        
        # Get or create session if needed
        if not request.session.session_key:
            request.session.create()
        
        user = request.user if request.user.is_authenticated else None
        session_key = request.session.session_key
        
        # Use the cart service to update quantity
        from cart.services import CartService
        
        if quantity <= 0:
            # Remove item if quantity is 0 or negative
            success = CartService.remove_from_cart(
                user=user,
                session_key=session_key,
                product_id=product_id
            )
            if success:
                return JsonResponse({"success": True, "message": "Item removed"})
            else:
                return JsonResponse({"error": "Item not found in cart"}, status=404)
        else:
            # Update item quantity
            cart_item = CartService.update_cart_item(
                user=user,
                session_key=session_key,
                product_id=product_id,
                quantity=quantity
            )
            
            if cart_item:
                return JsonResponse({"success": True, "quantity": cart_item.quantity})
            else:
                return JsonResponse({"error": "Item not found in cart"}, status=404)
        
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)
    except Exception as e:
        logger.error(f"Error updating cart quantity: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt 
@require_http_methods(["POST"])
def remove_from_cart_compat(request):
    """
    Backward compatibility for old remove_from_cart endpoint
    """
    try:
        data = json.loads(request.body)
        product_id = data.get("product_id")
        
        if not product_id:
            return JsonResponse({"error": "Product ID required"}, status=400)
        
        # Use the new cart item view
        cart_item_view = CartItemView()
        cart_item_view.request = request
        cart_item_view.format_kwarg = None
        
        response = cart_item_view.delete(request, product_id=product_id)
        
        if hasattr(response, 'status_code') and response.status_code == 200:
            return JsonResponse({"success": True})
        else:
            return JsonResponse({"error": "Item not found"}, status=404)
            
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        logger.error(f"Error in remove_from_cart_compat: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)