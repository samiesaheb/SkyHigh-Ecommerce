from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
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