from django.urls import path
from .views import (
    register_user,
    login_user,
    logout_user,
    get_user_info,
    get_csrf_token,
    update_profile,
    change_password,
    custom_password_reset,
    password_reset_confirm,
    start_flutter_auth,
    flutter_auth_complete,
    flutter_token,
)

from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from .adapters import GoogleIDTokenAdapter
from .serializers import GoogleLoginSerializer  # ✅ Import your custom serializer

# ✅ Custom Google Login view using ID token
class GoogleLogin(SocialLoginView):
    adapter_class = GoogleIDTokenAdapter
    serializer_class = GoogleLoginSerializer  # ✅ Hook up the serializer

    def post(self, request, *args, **kwargs):
        print("📥 Incoming Google login payload:", request.data)
        return super().post(request, *args, **kwargs)

urlpatterns = [
    # 🔐 Auth routes
    path("register/", register_user),
    path("login/", login_user),
    path("logout/", logout_user),
    path("user/", get_user_info),
    path("csrf/", get_csrf_token),
    path("update-profile/", update_profile),
    path("change-password/", change_password, name="change_password"),

    # 🔁 Password reset routes
    path("password-reset/", custom_password_reset, name="password_reset"),
    path("password-reset-confirm/", password_reset_confirm, name="password_reset_confirm_api"),

    # 🌐 Google OAuth login (ID-token flow, used by Next.js)
    path("google-login/", GoogleLogin.as_view(), name="google_login"),

    # 🔗 Flutter OAuth bridge (popup + server-side polling)
    path("start-flutter-auth/", start_flutter_auth, name="start_flutter_auth"),
    path("flutter-auth-complete/", flutter_auth_complete, name="flutter_auth_complete"),
    path("flutter-token/", flutter_token, name="flutter_token"),
]

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns += [
    # ✅ JWT for mobile (email + password → access/refresh)
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]