"""
Products service layer - contains business logic for product operations
"""
from django.db.models import Q, Case, When, Value, IntegerField
from django.shortcuts import get_object_or_404
from .models import Product, Brand
from orders.models import OrderItem
import logging

try:
    from elasticsearch_dsl import Search
    from .documents import ProductDocument, BrandDocument
    ELASTICSEARCH_AVAILABLE = True
except ImportError:
    ELASTICSEARCH_AVAILABLE = False

logger = logging.getLogger(__name__)

class ProductService:
    """
    Service class for product-related business logic
    """
    
    @staticmethod
    def get_filtered_products(brand=None, min_price=None, max_price=None, 
                            search=None, ordering=None):
        """
        Get filtered products with proper business logic
        """
        try:
            queryset = Product.objects.select_related('brand').prefetch_related('reviews')
            
            # Apply filters
            if brand:
                queryset = queryset.filter(brand__slug=brand)
            
            if min_price:
                try:
                    queryset = queryset.filter(price__gte=float(min_price))
                except (ValueError, TypeError):
                    logger.warning(f"Invalid min_price value: {min_price}")
            
            if max_price:
                try:
                    queryset = queryset.filter(price__lte=float(max_price))
                except (ValueError, TypeError):
                    logger.warning(f"Invalid max_price value: {max_price}")
            
            if search:
                search = search.strip()
                if search:
                    # Use Elasticsearch if available for better search
                    if ELASTICSEARCH_AVAILABLE:
                        try:
                            # Get product IDs from Elasticsearch
                            search_results = ProductService.search_products(search, limit=100)
                            if search_results:
                                product_ids = [p.id for p in search_results]
                                # Filter queryset to match Elasticsearch results and preserve ranking
                                queryset = queryset.filter(id__in=product_ids)
                                # Note: We'll apply the search ordering later in this method
                            else:
                                # No Elasticsearch results, return empty queryset
                                queryset = queryset.none()
                        except Exception as es_error:
                            logger.warning(f"Elasticsearch search failed in filtering, falling back to Django ORM: {str(es_error)}")
                            # Fall back to Django ORM search
                            queryset = queryset.filter(
                                Q(name__icontains=search) | Q(description__icontains=search) | Q(brand__name__icontains=search)
                            )
                    else:
                        # Use Django ORM search as fallback
                        queryset = queryset.filter(
                            Q(name__icontains=search) | Q(description__icontains=search) | Q(brand__name__icontains=search)
                        )
            
            # Apply ordering with business logic
            if ordering:
                if ordering == "price":
                    # Low to High: Show priced products first (sorted low to high), then unpriced products
                    # Clear any existing ordering first to avoid conflicts
                    queryset = queryset.order_by().annotate(
                        has_price=Case(
                            When(price__gt=0, then=Value(0)),  # Priced products get priority 0 (first)
                            When(price=0, then=Value(1)),      # Zero-priced products get priority 1 (last)
                            default=Value(1),
                            output_field=IntegerField(),
                        )
                    ).order_by('has_price', 'price')
                elif ordering == "-price":
                    # High to Low: Show priced products first (sorted high to low), then unpriced products
                    # Clear any existing ordering first to avoid conflicts
                    queryset = queryset.order_by().annotate(
                        has_price=Case(
                            When(price__gt=0, then=Value(0)),  # Priced products get priority 0 (first)
                            When(price=0, then=Value(1)),      # Zero-priced products get priority 1 (last)  
                            default=Value(1),
                            output_field=IntegerField(),
                        )
                    ).order_by('has_price', '-price')
                else:
                    queryset = queryset.order_by(ordering)
            else:
                # Default ordering: Geometry products first, then by creation date
                queryset = queryset.annotate(
                    brand_priority=Case(
                        When(brand__name='Geometry', then=Value(0)),
                        default=Value(1),
                        output_field=IntegerField(),
                    )
                ).order_by('brand_priority', '-created_at')
            
            return queryset
            
        except Exception as e:
            logger.error(f"Error in get_filtered_products: {str(e)}")
            return Product.objects.none()
    
    @staticmethod
    def get_product_by_slug(slug):
        """
        Get product by slug with optimized queries
        """
        return get_object_or_404(
            Product.objects.select_related('brand'),
            slug=slug
        )
    
    @staticmethod
    def search_products(query, limit=10):
        """
        Search products using Elasticsearch with fallback to Django ORM
        """
        try:
            if not query or not query.strip():
                return []
            
            query = query.strip()
            
            # Use Elasticsearch if available
            if ELASTICSEARCH_AVAILABLE:
                try:
                    # Create multi-field search with enhanced brand matching
                    search = ProductDocument.search()
                    
                    # Combine multiple query types for better brand matching
                    search = search.query("bool", should=[
                        # Exact and fuzzy matches
                        {
                            "multi_match": {
                                "query": query,
                                "fields": [
                                    "name^3",  # Boost name matches
                                    "brand.name^3",  # High boost for brand matches
                                    "description^1"  # Lower boost for description
                                ],
                                "type": "best_fields",
                                "fuzziness": "AUTO"
                            }
                        },
                        # Prefix matching for brands (great for "geo" -> "Geometry")
                        {
                            "match_phrase_prefix": {
                                "brand.name": {
                                    "query": query,
                                    "boost": 2.5
                                }
                            }
                        },
                        # Wildcard matching for partial brand names
                        {
                            "wildcard": {
                                "brand.name": {
                                    "value": f"*{query.lower()}*",
                                    "boost": 2.0
                                }
                            }
                        },
                        # Prefix matching for product names
                        {
                            "match_phrase_prefix": {
                                "name": {
                                    "query": query,
                                    "boost": 2.0
                                }
                            }
                        }
                    ], minimum_should_match=1)
                    
                    # No availability filter since model doesn't have is_available field
                    
                    # Execute search with limit
                    response = search[:limit].execute()
                    
                    # Convert Elasticsearch hits to Product objects
                    product_ids = [hit.meta.id for hit in response]
                    if product_ids:
                        # Preserve search ranking by ordering by the IDs list
                        products = Product.objects.filter(
                            id__in=product_ids
                        ).select_related('brand')
                        
                        # Sort by the original Elasticsearch ranking
                        products_dict = {p.id: p for p in products}
                        ranked_products = [products_dict[int(pid)] for pid in product_ids if int(pid) in products_dict]
                        
                        return ranked_products
                    
                    return []
                    
                except Exception as es_error:
                    logger.warning(f"Elasticsearch search failed, falling back to Django ORM: {str(es_error)}")
                    # Fall back to Django ORM search
                    pass
            
            # Fallback to Django ORM search
            products = Product.objects.filter(
                Q(name__icontains=query) | Q(description__icontains=query) | Q(brand__name__icontains=query)
            ).select_related('brand')[:limit]
            
            return products
            
        except Exception as e:
            logger.error(f"Error in search_products: {str(e)}")
            return []

    @staticmethod
    def search_suggestions(query, limit=5):
        """
        Get search suggestions using Elasticsearch completion
        """
        try:
            if not query or not query.strip():
                return []
            
            query = query.strip()
            suggestions = []
            
            # Use Elasticsearch if available
            if ELASTICSEARCH_AVAILABLE:
                try:
                    # Use the same enhanced search as products for consistent brand matching
                    enhanced_products = ProductService.search_products(query, limit)
                    suggestions = [
                        {
                            'text': p.name,
                            'id': p.id,
                            'slug': p.slug,
                            'brand': p.brand.name if p.brand else '',
                        }
                        for p in enhanced_products[:limit]
                    ]
                    
                    return suggestions
                    
                except Exception as es_error:
                    logger.warning(f"Elasticsearch suggestions failed, falling back to basic search: {str(es_error)}")
                    # Fall back to basic search
                    pass
            
            # Fallback to basic product search
            products = ProductService.search_products(query, limit)[:limit]
            suggestions = [
                {
                    'text': p.name,
                    'id': p.id,
                    'slug': p.slug,
                    'brand': p.brand.name if p.brand else '',
                }
                for p in products
            ]
            
            return suggestions
            
        except Exception as e:
            logger.error(f"Error in search_suggestions: {str(e)}")
            return []

class BrandService:
    """
    Service class for brand-related business logic
    """
    
    @staticmethod
    def get_all_brands():
        """
        Get all brands with caching
        """
        return Brand.objects.all().order_by('name')
    
    @staticmethod
    def get_brand_by_slug(slug):
        """
        Get brand by slug
        """
        return get_object_or_404(Brand, slug=slug)

