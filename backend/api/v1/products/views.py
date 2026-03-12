from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from products.models import Brand, Product
from .serializers import (
    BrandSerializer, ProductSerializer, ProductDetailSerializer
)
from django.http import JsonResponse
from django.db.models import Q
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404
from django.core.cache import cache
from django.conf import settings
from core.throttling import SearchRateThrottle
from orders.models import OrderItem
import logging
import hashlib

logger = logging.getLogger(__name__)

# @method_decorator(cache_page(60 * 15), name='dispatch')  # Cache disabled for debugging
class BrandListView(generics.ListAPIView):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer

class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    pagination_class = None  # Use settings default
    
    def list(self, request, *args, **kwargs):
        """Override list method to have full control over response"""
        from products.services import ProductService
        
        # Extract parameters
        brand = request.GET.get("brand")
        search = request.GET.get("search") 
        ordering = request.GET.get("ordering")
        min_price = request.GET.get("min_price")
        max_price = request.GET.get("max_price")
        
        # Handle specific filters for backward compatibility
        product_slug = request.GET.get("slug")
        product_id = request.GET.get("id")
        
        if product_slug:
            queryset = Product.objects.filter(slug=product_slug).select_related('brand')
        elif product_id and product_id.isdigit():
            queryset = Product.objects.filter(id=int(product_id)).select_related('brand')
        else:
            # Use service layer for consistent results
            queryset = ProductService.get_filtered_products(
                brand=brand,
                min_price=min_price,
                max_price=max_price,
                search=search,
                ordering=ordering
            )
        
        # Serialize the queryset
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

@cache_page(60 * 5)  # Cache search suggestions for 5 minutes
@throttle_classes([SearchRateThrottle])
def product_search_suggestions(request):
    try:
        from products.services import ProductService
        
        query = request.GET.get("query", "").strip()
        base = request.build_absolute_uri("/")[:-1]  # strip trailing slash

        if query:
            # Create cache key for search suggestions
            search_cache_key = f"es_search_suggestions_{hashlib.md5(query.encode()).hexdigest()}"
            cached_suggestions = cache.get(search_cache_key)
            
            if cached_suggestions is not None:
                return JsonResponse(cached_suggestions, safe=False)
            
            # Use Elasticsearch-powered search
            products = ProductService.search_products(query, limit=10)
            suggestions = [
                {
                    "id": p.id,
                    "name": p.name,
                    "slug": p.slug,
                    "brand": p.brand.name if p.brand else "",
                    "main_image": f"{base}{p.main_image.url}" if p.main_image else ""
                }
                for p in products
            ]
            
            # Cache the suggestions
            cache.set(search_cache_key, suggestions, 60 * 5)  # 5 minutes
        else:
            suggestions = []
        return JsonResponse(suggestions, safe=False)
    except Exception as e:
        logger.error(f"Error in product_search_suggestions: {str(e)}")
        return JsonResponse({"error": "Search failed"}, status=500)

@api_view(["GET"])
def filtered_products(request):
    try:
        from products.services import ProductService
        
        # Extract parameters
        brand = request.GET.get("brand")
        min_price = request.GET.get("min_price")
        max_price = request.GET.get("max_price")
        search = request.GET.get("search")
        ordering = request.GET.get("ordering")
        
        logger.debug(f"Mobile API - Filtering products with brand: {brand}")
        
        # Use service layer for business logic
        products = ProductService.get_filtered_products(
            brand=brand,
            min_price=min_price,
            max_price=max_price,
            search=search,
            ordering=ordering
        )

        serializer = ProductSerializer(products, many=True, context={"request": request})
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error in filtered_products: {str(e)}")
        return Response({"error": "Product filtering failed"}, status=500)

@api_view(["GET"])
@throttle_classes([SearchRateThrottle])
def elasticsearch_suggestions(request):
    """Advanced Elasticsearch-powered search suggestions with autocomplete"""
    try:
        from products.services import ProductService
        
        query = request.GET.get("query", "").strip()
        limit = int(request.GET.get("limit", 5))
        
        if query:
            # Create cache key for ES suggestions
            es_cache_key = f"es_autocomplete_{hashlib.md5(query.encode()).hexdigest()}_{limit}"
            cached_suggestions = cache.get(es_cache_key)
            
            if cached_suggestions is not None:
                return Response(cached_suggestions)
            
            # Use Elasticsearch suggestions
            suggestions = ProductService.search_suggestions(query, limit=limit)
            
            # Cache the suggestions
            cache.set(es_cache_key, suggestions, 60 * 3)  # 3 minutes
            return Response(suggestions)
        
        return Response([])
    except Exception as e:
        logger.error(f"Error in elasticsearch_suggestions: {str(e)}")
        return Response({"error": "Elasticsearch suggestions failed"}, status=500)

@method_decorator(cache_page(60 * 10), name='dispatch')  # Cache product details for 10 minutes
class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.select_related('brand').prefetch_related(
        'reviews__user', 'reviews__helpful_markers'
    ).all()
    serializer_class = ProductDetailSerializer
    lookup_field = "slug"