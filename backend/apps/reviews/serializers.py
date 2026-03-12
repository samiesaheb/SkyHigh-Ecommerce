from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ProductReview, ReviewHelpful
from products.models import Product

User = get_user_model()

class ReviewUserSerializer(serializers.ModelSerializer):
    """Serializer for user info in reviews"""
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email']
        read_only_fields = ['id', 'email']

class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for displaying reviews"""
    user = ReviewUserSerializer(read_only=True)
    helpful_count = serializers.SerializerMethodField()
    is_helpful = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductReview
        fields = [
            'id', 'user', 'rating', 'title', 'comment', 
            'verified_purchase', 'helpful_count', 'is_helpful',
            'created_at', 'updated_at', 'is_approved'
        ]
        read_only_fields = [
            'id', 'user', 'verified_purchase', 'helpful_count', 
            'created_at', 'updated_at', 'is_approved'
        ]
    
    def get_helpful_count(self, obj):
        """Get number of helpful votes"""
        return obj.helpful_markers.count()
    
    def get_is_helpful(self, obj):
        """Check if current user found this review helpful"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return ReviewHelpful.objects.filter(
                review=obj, 
                user=request.user
            ).exists()
        return False

class ReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reviews"""
    product_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = ProductReview
        fields = ['product_id', 'rating', 'title', 'comment']
    
    def validate_product_id(self, value):
        """Validate product exists and is Geometry brand"""
        try:
            product = Product.objects.get(id=value)
            if product.brand.slug != 'geometry':
                raise serializers.ValidationError(
                    "Reviews are only available for Geometry brand products."
                )
            return value
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found.")
    
    def validate_rating(self, value):
        """Validate rating is between 1 and 5"""
        if not 1 <= value <= 5:
            raise serializers.ValidationError(
                "Rating must be between 1 and 5 stars."
            )
        return value
    
    def create(self, validated_data):
        """Create review with proper product association"""
        product_id = validated_data.pop('product_id')
        product = Product.objects.get(id=product_id)
        
        review = ProductReview.objects.create(
            product=product,
            **validated_data
        )
        return review