from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from core.admin_analytics import get_analytics_urls

urlpatterns = [
    *get_analytics_urls(),
    path("admin/", admin.site.urls),

    # ✅ New centralized API structure
    path("api/v1/", include([
        path("core/", include("core.urls")),
        path("products/", include("api.v1.products.urls")),
        path("accounts/", include("api.v1.accounts.urls")),
        path("orders/", include("api.v1.orders.urls")),
        path("cart/", include("cart.urls")),
        path("reviews/", include("reviews.urls")),
        path("quotes/", include("apps.quotes.urls")),
        path("mobile/", include("api.v1.mobile.urls")),
    ])),

    # ✅ Keep legacy API endpoints for backward compatibility
    path("api/", include([
        path("", include("core.urls")),             # /api/csrf/, /api/account/user/
        path("products/", include("products.urls")),# /api/products/...
        path("accounts/", include("accounts.urls")), # /api/accounts/... (login/logout, etc.)
        path("orders/", include("orders.urls")),    # /api/orders/...
        path("cart/", include("cart.urls")),
        path("reviews/", include("reviews.urls")),
        path("quotes/", include("apps.quotes.urls")),
    ])),

    # Allauth (web flows)
    path("accounts/", include("allauth.urls")),
    
    # Legacy mobile endpoints (redirect to new structure)
    path('mobile/', include('api.v1.mobile.urls')),
]

# Media during dev
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
