from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from django.core.cache import cache
from django.conf import settings
from django.views.decorators.cache import cache_page
from core.throttling import AdminRateThrottle
from .analytics import AnalyticsService
import hashlib

@api_view(['GET'])
@permission_classes([IsAdminUser])
@throttle_classes([AdminRateThrottle])
def sales_overview(request):
    """Get sales overview metrics"""
    try:
        days = int(request.GET.get('days', 30))
        
        # Create cache key
        cache_key = f"sales_overview_{days}"
        cached_data = cache.get(cache_key)
        
        if cached_data is not None:
            return Response(cached_data, status=status.HTTP_200_OK)
        
        data = AnalyticsService.get_sales_overview(days)
        
        # Cache the data
        cache.set(cache_key, data, settings.CACHE_TTL['ANALYTICS'])
        
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAdminUser])
@throttle_classes([AdminRateThrottle])
def daily_sales(request):
    """Get daily sales data for charts"""
    try:
        days = int(request.GET.get('days', 14))
        
        # Create cache key
        cache_key = f"daily_sales_{days}"
        cached_data = cache.get(cache_key)
        
        if cached_data is not None:
            return Response(cached_data, status=status.HTTP_200_OK)
        
        data = AnalyticsService.get_daily_sales(days)
        
        # Cache the data
        cache.set(cache_key, data, settings.CACHE_TTL['ANALYTICS'])
        
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAdminUser])
@throttle_classes([AdminRateThrottle])
def top_products(request):
    """Get top selling products"""
    try:
        limit = int(request.GET.get('limit', 10))
        days = int(request.GET.get('days', 30))
        
        # Create cache key
        cache_key = f"top_products_{limit}_{days}"
        cached_data = cache.get(cache_key)
        
        if cached_data is not None:
            return Response(cached_data, status=status.HTTP_200_OK)
        
        data = AnalyticsService.get_top_products(limit, days)
        
        # Cache the data
        cache.set(cache_key, data, settings.CACHE_TTL['ANALYTICS'])
        
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAdminUser])
@throttle_classes([AdminRateThrottle])
def brand_performance(request):
    """Get brand performance metrics"""
    try:
        days = int(request.GET.get('days', 30))
        
        # Create cache key
        cache_key = f"brand_performance_{days}"
        cached_data = cache.get(cache_key)
        
        if cached_data is not None:
            return Response(cached_data, status=status.HTTP_200_OK)
        
        data = AnalyticsService.get_brand_performance(days)
        
        # Cache the data
        cache.set(cache_key, data, settings.CACHE_TTL['ANALYTICS'])
        
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAdminUser])
@throttle_classes([AdminRateThrottle])
def customer_insights(request):
    """Get customer analytics"""
    try:
        days = int(request.GET.get('days', 30))
        
        # Create cache key
        cache_key = f"customer_insights_{days}"
        cached_data = cache.get(cache_key)
        
        if cached_data is not None:
            return Response(cached_data, status=status.HTTP_200_OK)
        
        data = AnalyticsService.get_customer_insights(days)
        
        # Cache the data
        cache.set(cache_key, data, settings.CACHE_TTL['ANALYTICS'])
        
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAdminUser])
@throttle_classes([AdminRateThrottle])
def financial_summary(request):
    """Get financial summary metrics"""
    try:
        days = int(request.GET.get('days', 30))
        
        # Create cache key
        cache_key = f"financial_summary_{days}"
        cached_data = cache.get(cache_key)
        
        if cached_data is not None:
            return Response(cached_data, status=status.HTTP_200_OK)
        
        data = AnalyticsService.get_financial_summary(days)
        
        # Cache the data
        cache.set(cache_key, data, settings.CACHE_TTL['ANALYTICS'])
        
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )