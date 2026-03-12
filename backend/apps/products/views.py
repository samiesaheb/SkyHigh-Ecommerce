from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Brand, Product
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

@method_decorator(cache_page(60 * 15), name='dispatch')  # Cache for 15 minutes
class BrandListView(generics.ListAPIView):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer

class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    pagination_class = None  # Use settings default
    
    search_fields = ["name", "description"]
    ordering_fields = ["price", "name", "id", "created_at"]
    filterset_fields = ["brand__slug"]

    def get_queryset(self):
        from .services import ProductService
        
        # Extract parameters
        brand = self.request.query_params.get("brand")
        search = self.request.query_params.get("search")
        ordering = self.request.query_params.get("ordering")
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")
        
        # Create cache key from parameters
        cache_key_data = f"products_{brand}_{search}_{ordering}_{min_price}_{max_price}"
        cache_key = hashlib.md5(cache_key_data.encode()).hexdigest()
        
        # Handle specific filters for backward compatibility
        product_slug = self.request.query_params.get("slug")
        product_id = self.request.query_params.get("id")
        
        if product_slug:
            return Product.objects.filter(slug=product_slug).select_related('brand')
        
        if product_id and product_id.isdigit():
            return Product.objects.filter(id=int(product_id)).select_related('brand')
        
        # Try to get from cache first
        cached_result = cache.get(cache_key)
        if cached_result is not None:
            return cached_result
        
        # Use service layer for standard filtering
        queryset = ProductService.get_filtered_products(
            brand=brand,
            min_price=min_price,
            max_price=max_price,
            search=search,
            ordering=ordering
        )
        
        # Cache the queryset
        cache.set(cache_key, queryset, settings.CACHE_TTL['PRODUCTS'])
        return queryset

@cache_page(60 * 5)  # Cache search suggestions for 5 minutes
@throttle_classes([SearchRateThrottle])
def product_search_suggestions(request):
    try:
        from .services import ProductService
        
        query = request.GET.get("query", "").strip()
        base = request.build_absolute_uri("/")[:-1]  # strip trailing slash

        if query:
            # Create cache key for search suggestions
            search_cache_key = f"search_suggestions_{hashlib.md5(query.encode()).hexdigest()}"
            cached_suggestions = cache.get(search_cache_key)
            
            if cached_suggestions is not None:
                return JsonResponse(cached_suggestions, safe=False)
            
            products = ProductService.search_products(query, limit=10)
            suggestions = [
                {
                    "id": p.id,
                    "name": p.name,
                    "slug": p.slug,
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

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView

@api_view(["GET"])
def filtered_products(request):
    try:
        from .services import ProductService
        
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

@method_decorator(cache_page(60 * 10), name='dispatch')  # Cache product details for 10 minutes
class ProductDetailView(RetrieveAPIView):
    queryset = Product.objects.select_related('brand').prefetch_related(
        'reviews__user', 'reviews__helpful_markers'
    ).all()
    serializer_class = ProductDetailSerializer
    lookup_field = "slug"

# Review API endpoints moved to reviews app
