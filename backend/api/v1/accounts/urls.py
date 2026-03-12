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
    GoogleLogin,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # 🔐 Auth routes
    path("register/", register_user, name="api_register"),
    path("login/", login_user, name="api_login"),
    path("logout/", logout_user, name="api_logout"),
    path("user/", get_user_info, name="api_user"),
    path("csrf/", get_csrf_token, name="api_csrf"),
    path("update-profile/", update_profile, name="api_update_profile"),
    path("change-password/", change_password, name="api_change_password"),

    # 🔁 Password reset routes
    path("password-reset/", custom_password_reset, name="api_password_reset"),
    path("password-reset-confirm/", password_reset_confirm, name="api_password_reset_confirm"),

    # 🌐 Google OAuth login
    path("google-login/", GoogleLogin.as_view(), name="api_google_login"),

    # ✅ JWT for mobile (email + password → access/refresh)
    path("token/", TokenObtainPairView.as_view(), name="api_token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="api_token_refresh"),
]