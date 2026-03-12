from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from api.v1.accounts.views import get_user_info, update_profile, change_password
from .views import mobile_register

urlpatterns = [
    # JWT Authentication
    path('auth/jwt/create/', TokenObtainPairView.as_view(), name='mobile_jwt_create'),
    path('auth/jwt/refresh/', TokenRefreshView.as_view(), name='mobile_jwt_refresh'),
    
    # Mobile-specific endpoints
    path('accounts/register/', mobile_register, name='mobile_register'),
    path('accounts/user/', get_user_info, name='mobile_user'),
    path('accounts/profile/', update_profile, name='mobile_update_profile'),
    path('accounts/change-password/', change_password, name='mobile_change_password'),
    
    # App endpoints - include the API endpoints with proper namespacing
    path('products/', include('api.v1.products.urls')),
    path('orders/', include('api.v1.orders.urls')),
]