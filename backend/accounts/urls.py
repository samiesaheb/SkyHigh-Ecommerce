from django.urls import path
from .views import (
    register_user,
    login_user,
    logout_user,
    get_user_info,
    get_csrf_token,
    update_profile,
)

urlpatterns = [
    path("register/", register_user),
    path("login/", login_user),
    path("logout/", logout_user),
    path("user/", get_user_info),
    path("csrf/", get_csrf_token),
    path("update-profile/", update_profile),
]
