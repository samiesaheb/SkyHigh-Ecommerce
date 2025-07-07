from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash, get_user_model
from django.contrib.auth.forms import PasswordResetForm
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer
from django.contrib.auth.views import PasswordResetView
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.conf import settings

# 🔐 Google login support
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from rest_framework.request import Request
from rest_framework.views import exception_handler
from rest_framework.response import Response
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://localhost:3000"
    client_class = OAuth2Client

    def post(self, request, *args, **kwargs):
        logger.warning("🔍 GoogleLogin request data: %s", request.data)
        print("🔍 GoogleLogin request data:", request.data)
        return super().post(request, *args, **kwargs)

# ✅ Register
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    data = request.data
    email = data.get("email")
    password = data.get("password")
    full_name = data.get("name")

    if not email or not password:
        return Response({"error": "Email and password are required"}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=400)

    user = User.objects.create_user(email=email, password=password)

    if full_name:
        parts = full_name.strip().split(" ", 1)
        user.first_name = parts[0]
        user.last_name = parts[1] if len(parts) > 1 else ""
    user.save()

    # ✅ Set backend manually to avoid ValueError when multiple backends are configured
    user.backend = settings.AUTHENTICATION_BACKENDS[0]
    login(request, user)

    return Response({"success": True})

# ✅ Login
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    data = request.data
    email = data.get("email")
    password = data.get("password")

    from django.conf import settings
    user = authenticate(request, email=email, password=password)

    if user:
        user.backend = settings.AUTHENTICATION_BACKENDS[0]
        login(request, user)
        return Response({"success": True, "user": {"id": user.id, "email": user.email}})
    else:
        return Response({"error": "Invalid credentials"}, status=400)

# ✅ Logout
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def logout_user(request):
    logout(request)
    return Response({"success": True})

# ✅ Get user info
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

# ✅ CSRF
@ensure_csrf_cookie
@api_view(["GET"])
@permission_classes([AllowAny])
def get_csrf_token(request):
    return Response({"message": "CSRF cookie set"})

# ✅ Update profile
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    name = request.data.get("name")
    email = request.data.get("email")

    if name:
        parts = name.strip().split(" ", 1)
        user.first_name = parts[0]
        user.last_name = parts[1] if len(parts) > 1 else ""
    if email:
        user.email = email

    user.save()
    return Response({'message': 'Profile updated successfully'})

# ✅ Change password
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    data = request.data
    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not user.check_password(current_password):
        return Response({"error": "Current password is incorrect."}, status=400)

    user.set_password(new_password)
    user.save()
    update_session_auth_hash(request, user)
    return Response({"message": "Password updated successfully."})

# ✅ Password reset
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def custom_password_reset(request):
    email = request.data.get("email")
    if not email:
        return Response({"error": "Email is required"}, status=400)

    form = PasswordResetForm(data={"email": email})
    if form.is_valid():
        form.save(
            request=request,
            use_https=request.is_secure(),
            email_template_name="registration/password_reset_email.html",
        )
        return Response({"message": "✅ Password reset link sent"})
    else:
        return Response({"error": "❌ Invalid email or user does not exist"}, status=400)
