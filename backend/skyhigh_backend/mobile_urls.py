from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from accounts.views import get_user_info, update_profile, change_password
from accounts.serializers import UserSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

@api_view(["POST"])
@permission_classes([AllowAny])
def mobile_register(request):
    data = request.data
    email = data.get("email")
    password1 = data.get("password1")
    password2 = data.get("password2")
    first_name = data.get("first_name", "")
    last_name = data.get("last_name", "")

    if not email or not password1 or not password2:
        return Response({"error": "All fields are required"}, status=400)
    
    if password1 != password2:
        return Response({"error": "Passwords don't match"}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=400)

    user = User.objects.create_user(
        email=email, 
        password=password1,
        first_name=first_name,
        last_name=last_name
    )

    return Response({"success": True}, status=201)

urlpatterns = [
    # JWT Authentication
    path('auth/jwt/create/', TokenObtainPairView.as_view(), name='jwt_create'),
    path('auth/jwt/refresh/', TokenRefreshView.as_view(), name='jwt_refresh'),
    
    # Mobile-specific endpoints
    path('accounts/register/', mobile_register, name='mobile_register'),
    path('accounts/user/', get_user_info, name='mobile_user'),
    path('accounts/profile/', update_profile, name='mobile_update_profile'),
    path('accounts/change-password/', change_password, name='mobile_change_password'),
    
    # App endpoints  
    path('products/', include('products.urls')),
    path('orders/', include('orders.urls')),
    path('wishlist/', include('wishlist.urls')),
    path('reviews/', include('reviews.urls')),
]