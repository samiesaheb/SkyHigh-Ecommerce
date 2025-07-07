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
)
from django.contrib.auth import views as auth_views

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
    path("password-reset/done/", auth_views.PasswordResetDoneView.as_view(), name="password_reset_done"),
    path("reset/<uidb64>/<token>/", auth_views.PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
    path("reset/done/", auth_views.PasswordResetCompleteView.as_view(), name="password_reset_complete"),

    # 🌐 Google OAuth login
    path("google-login/", GoogleLogin.as_view(), name="google_login"),
]
