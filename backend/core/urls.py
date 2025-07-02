from django.urls import path
from .views import (
    about_view,
    services_view,
    contact_view,
    get_csrf_token,
    UpdateProfileView,
    current_user_view,
)
urlpatterns = [
    path("about/", about_view, name="about"),
    path("services/", services_view, name="services"),
    path("contact/", contact_view, name="contact"),
    path("csrf/", get_csrf_token),
    path('update-profile/', UpdateProfileView.as_view(), name='update-profile'),
    path("me/", current_user_view),
]
