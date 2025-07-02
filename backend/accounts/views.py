from django.shortcuts import render
import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    data = request.data
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    full_name = data.get("name")

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)

    if full_name:
        parts = full_name.strip().split(" ", 1)
        user.first_name = parts[0]
        user.last_name = parts[1] if len(parts) > 1 else ""
    user.save()

    login(request, user)
    return Response({"success": True})


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    data = request.data
    username = data.get("username")
    password = data.get("password")

    user = authenticate(request, username=username, password=password)
    if user:
        login(request, user)
        return Response({"success": True, "user": {"id": user.id, "username": user.username}})
    else:
        return Response({"error": "Invalid credentials"}, status=400)


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def logout_user(request):
    logout(request)
    return Response({"success": True})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@ensure_csrf_cookie
@api_view(["GET"])
@permission_classes([AllowAny])
def get_csrf_token(request):
    return Response({"message": "CSRF cookie set"})


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
