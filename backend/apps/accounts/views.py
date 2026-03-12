from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash, get_user_model
from django.contrib.auth.forms import SetPasswordForm
from django.contrib.auth.tokens import default_token_generator
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.template.loader import render_to_string
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer
from django.conf import settings

import logging

logger = logging.getLogger(__name__)
User = get_user_model()

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
    logger.debug(f"User auth check: {request.user.is_authenticated}")
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

# ✅ Password reset — sends a frontend reset link
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def custom_password_reset(request):
    email = request.data.get("email")
    if not email:
        return Response({"error": "Email is required"}, status=400)

    # Always return success to avoid revealing whether an email is registered
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"message": "If this email is registered, a reset link has been sent."})

    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
    reset_link = f"{frontend_url}/reset-password/{uid}/{token}"

    html_message = render_to_string(
        "registration/password_reset_email.html",
        {"reset_link": reset_link, "user": user},
    )
    send_mail(
        subject="Password Reset – Sky High",
        message=f"Click the link below to reset your password:\n\n{reset_link}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        html_message=html_message,
    )
    return Response({"message": "If this email is registered, a reset link has been sent."})


# ✅ Password reset confirm — validates token and sets new password
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    uid = request.data.get("uid")
    token = request.data.get("token")
    new_password1 = request.data.get("new_password1")
    new_password2 = request.data.get("new_password2")

    if not all([uid, token, new_password1, new_password2]):
        return Response({"error": "All fields are required."}, status=400)

    if new_password1 != new_password2:
        return Response({"error": "Passwords do not match."}, status=400)

    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({"error": "Invalid reset link."}, status=400)

    if not default_token_generator.check_token(user, token):
        return Response({"error": "This reset link is invalid or has expired."}, status=400)

    form = SetPasswordForm(user, data={"new_password1": new_password1, "new_password2": new_password2})
    if form.is_valid():
        form.save()
        return Response({"message": "Password reset successfully."})
    else:
        errors = "; ".join(
            msg for field_errors in form.errors.values() for msg in field_errors
        )
        return Response({"error": errors}, status=400)


# ─── Flutter OAuth bridge ────────────────────────────────────────────────────
# Flow:
#   1. Flutter generates a random state key and opens a popup to start-flutter-auth/?state=KEY
#   2. start-flutter-auth stores the key in the session, then redirects to allauth Google login
#   3. After Google auth, allauth redirects to flutter-auth-complete/ (LOGIN_REDIRECT_URL)
#   4. flutter-auth-complete creates a JWT access token, stores it in cache under the state key
#   5. Flutter polls flutter-token/?state=KEY every second, gets the JWT, sends as Bearer

from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
from django.core.cache import cache
from django.shortcuts import redirect as _redirect


def start_flutter_auth(request):
    """Store the Flutter state key in the session, then begin Google OAuth."""
    state = request.GET.get('state', '')
    request.session['flutter_state'] = state
    return _redirect('/accounts/google/login/')


@login_required
def flutter_auth_complete(request):
    """After allauth login: issue a DRF Token and stash it in cache keyed by state."""
    from rest_framework.authtoken.models import Token
    token, _ = Token.objects.get_or_create(user=request.user)
    state = request.session.get('flutter_state', '')
    if state:
        cache.set(f'flutter_auth_{state}', token.key, timeout=300)  # 5-min TTL
    return HttpResponse("""<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head><body>
<script>window.close();</script>
<p>Authentication complete. You may close this window.</p>
</body></html>""")


def flutter_token(request):
    """Flutter polls this until the JWT for its state key appears (one-time use)."""
    state = request.GET.get('state', '')
    if not state:
        return JsonResponse({'token': None})
    token = cache.get(f'flutter_auth_{state}')
    if token:
        cache.delete(f'flutter_auth_{state}')
        return JsonResponse({'token': token})
    return JsonResponse({'token': None})
