from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Wishlist, WishlistItem
from products.models import Product
from products.serializers import ProductSerializer
import json

User = get_user_model()


class WishlistItemSerializer:
    """Simple serializer for wishlist items"""
    
    @staticmethod
    def serialize(wishlist_item):
        return {
            'id': wishlist_item.id,
            'product': ProductSerializer(wishlist_item.product).data,
            'added_at': wishlist_item.added_at.isoformat(),
            'price_when_added': str(wishlist_item.price_when_added) if wishlist_item.price_when_added else None,
            'notes': wishlist_item.notes,
        }


class WishlistSerializer:
    """Simple serializer for wishlist"""
    
    @staticmethod
    def serialize(wishlist):
        return {
            'id': wishlist.id,
            'user': {
                'id': wishlist.user.id,
                'email': wishlist.user.email,
                'first_name': wishlist.user.first_name,
                'last_name': wishlist.user.last_name,
            },
            'items': [WishlistItemSerializer.serialize(item) for item in wishlist.items.all()],
            'item_count': wishlist.item_count,
            'total_value': str(wishlist.total_value),
            'created_at': wishlist.created_at.isoformat(),
            'updated_at': wishlist.updated_at.isoformat(),
        }


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wishlist(request):
    """Get user's wishlist"""
    try:
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        return Response(WishlistSerializer.serialize(wishlist))
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch wishlist'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_wishlist(request):
    """Add product to user's wishlist"""
    try:
        # Parse request data
        if hasattr(request, 'data'):
            data = request.data
        else:
            data = json.loads(request.body)
        
        product_id = data.get('product_id')
        if not product_id:
            return Response(
                {'error': 'Product ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get product
        product = get_object_or_404(Product, id=product_id)
        
        # Get or create wishlist
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        
        # Add product to wishlist (get_or_create prevents duplicates)
        wishlist_item, item_created = wishlist.add_product(product)
        
        if item_created:
            return Response({
                'message': 'Product added to wishlist',
                'item': WishlistItemSerializer.serialize(wishlist_item)
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'message': 'Product already in wishlist',
                'item': WishlistItemSerializer.serialize(wishlist_item)
            })
            
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to add to wishlist: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_wishlist(request, product_id):
    """Remove product from user's wishlist"""
    try:
        # Get product
        product = get_object_or_404(Product, id=product_id)
        
        # Get user's wishlist
        try:
            wishlist = Wishlist.objects.get(user=request.user)
        except Wishlist.DoesNotExist:
            return Response(
                {'error': 'Wishlist not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Remove product from wishlist
        deleted_count, _ = wishlist.remove_product(product)
        
        if deleted_count > 0:
            return Response({
                'message': 'Product removed from wishlist'
            })
        else:
            return Response(
                {'error': 'Product not in wishlist'},
                status=status.HTTP_404_NOT_FOUND
            )
            
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to remove from wishlist: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_wishlist(request):
    """Toggle product in user's wishlist"""
    try:
        # Parse request data
        if hasattr(request, 'data'):
            data = request.data
        else:
            data = json.loads(request.body)
        
        product_id = data.get('product_id')
        if not product_id:
            return Response(
                {'error': 'Product ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get product
        product = get_object_or_404(Product, id=product_id)
        
        # Get or create wishlist
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        
        # Check if product is already in wishlist
        existing_item = wishlist.items.filter(product=product).first()
        
        if existing_item:
            # Remove from wishlist
            existing_item.delete()
            return Response({
                'message': 'Product removed from wishlist',
                'in_wishlist': False
            })
        else:
            # Add to wishlist
            wishlist_item, item_created = wishlist.add_product(product)
            return Response({
                'message': 'Product added to wishlist',
                'in_wishlist': True,
                'item': WishlistItemSerializer.serialize(wishlist_item)
            })
            
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to toggle wishlist: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_wishlist(request, product_id):
    """Check if product is in user's wishlist"""
    try:
        # Get product
        product = get_object_or_404(Product, id=product_id)
        
        # Check if user has wishlist and product is in it
        try:
            wishlist = Wishlist.objects.get(user=request.user)
            in_wishlist = wishlist.items.filter(product=product).exists()
        except Wishlist.DoesNotExist:
            in_wishlist = False
        
        return Response({
            'in_wishlist': in_wishlist,
            'product_id': product_id
        })
        
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to check wishlist: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
