from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Count
from .models import ProductReview, ReviewHelpful
from .serializers import ReviewSerializer, ReviewCreateSerializer
from products.models import Product
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_review(request):
    """Create a new product review"""
    try:
        serializer = ReviewCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Check if user already reviewed this product
            product_id = serializer.validated_data['product_id']
            existing_review = ProductReview.objects.filter(
                product_id=product_id,
                user=request.user
            ).first()
            
            if existing_review:
                return Response(
                    {'error': 'You have already reviewed this product.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create the review
            review = serializer.save(user=request.user)
            response_serializer = ReviewSerializer(review, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"Error creating review: {str(e)}")
        return Response({'error': 'Failed to create review'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def product_reviews(request, product_id):
    """Get all reviews for a specific product"""
    try:
        product = get_object_or_404(Product, id=product_id)
        reviews = ProductReview.objects.filter(
            product=product,
            is_approved=True
        ).select_related('user').prefetch_related('helpful_markers')
        
        serializer = ReviewSerializer(reviews, many=True, context={'request': request})
        return Response(serializer.data)
        
    except Exception as e:
        logger.error(f"Error fetching reviews for product {product_id}: {str(e)}")
        return Response({'error': 'Failed to fetch reviews'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def product_review_summary(request, product_id):
    """Get review summary statistics for a product"""
    try:
        product = get_object_or_404(Product, id=product_id)
        reviews = ProductReview.objects.filter(
            product=product,
            is_approved=True
        )
        
        # Calculate statistics
        review_count = reviews.count()
        avg_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0
        
        # Rating distribution
        rating_distribution = {}
        for i in range(1, 6):
            rating_distribution[str(i)] = reviews.filter(rating=i).count()
        
        return Response({
            'product_id': product_id,
            'review_count': review_count,
            'average_rating': round(avg_rating, 1),
            'rating_distribution': rating_distribution
        })
        
    except Exception as e:
        logger.error(f"Error fetching review summary for product {product_id}: {str(e)}")
        return Response({'error': 'Failed to fetch review summary'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_review_helpful(request, review_id):
    """Mark or unmark a review as helpful"""
    try:
        review = get_object_or_404(ProductReview, id=review_id)
        
        # Check if user already marked this review as helpful
        helpful, created = ReviewHelpful.objects.get_or_create(
            review=review,
            user=request.user
        )
        
        if not created:
            # If it already exists, remove it (toggle)
            helpful.delete()
            is_helpful = False
        else:
            is_helpful = True
        
        # Get updated helpful count
        helpful_count = review.helpful_markers.count()
        
        return Response({
            'is_helpful': is_helpful,
            'helpful_count': helpful_count
        })
        
    except Exception as e:
        logger.error(f"Error marking review {review_id} as helpful: {str(e)}")
        return Response({'error': 'Failed to update helpful status'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_reviews(request):
    """Get all reviews by the current user"""
    try:
        reviews = ProductReview.objects.filter(
            user=request.user
        ).select_related('product', 'product__brand').prefetch_related('helpful_markers')
        
        serializer = ReviewSerializer(reviews, many=True, context={'request': request})
        return Response(serializer.data)
        
    except Exception as e:
        logger.error(f"Error fetching user reviews: {str(e)}")
        return Response({'error': 'Failed to fetch user reviews'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
