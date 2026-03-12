"""
Base Django settings for skyhigh_backend project.
Common settings shared across all environments.
"""

from pathlib import Path
import os
import sys
from dotenv import load_dotenv
import logging

# Load environment variables from config/env directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_DIR = BASE_DIR / 'config' / 'env'

# Add apps directory to Python path
APPS_DIR = BASE_DIR / 'apps'
sys.path.insert(0, str(APPS_DIR))

# Load base environment variables (can be overridden by environment-specific files)
load_dotenv(ENV_DIR / '.env.example', override=False)


# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    # Local apps (in apps/ directory)
    'core',
    'products',
    'orders',
    'accounts',
    'cart',
    'inventory',
    'wishlist',
    'notifications',
    'reviews',
    'quotes',
    'django.contrib.sites',
    'django_extensions',
    # 3rd-party auth
    'dj_rest_auth',
    'dj_rest_auth.registration',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'import_export',
    'django_elasticsearch_dsl',
]

AUTHENTICATION_BACKENDS = (
    'accounts.backends.EmailBackend',  
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
)

SITE_ID = 1

# Auth settings (email-only login) - Updated for django-allauth 65+
ACCOUNT_EMAIL_VERIFICATION = 'optional'
ACCOUNT_LOGIN_METHODS = {'email'}
ACCOUNT_SIGNUP_FIELDS = ['email*', 'password1*', 'password2*']

ACCOUNT_ADAPTER = 'accounts.adapters.NoUsernameAccountAdapter'
ACCOUNT_USER_MODEL_USERNAME_FIELD = None
AUTH_USER_MODEL = 'accounts.CustomUser'

REST_USE_JWT = False

# JWT Settings
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}

SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "OAUTH_PKCE_ENABLED": True,
        "SCOPE": ["profile", "email"],
    }
}

SOCIALACCOUNT_AUTO_SIGNUP = False
SOCIALACCOUNT_ADAPTER = "accounts.adapters.MySocialAccountAdapter"

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    "django.middleware.csrf.CsrfViewMiddleware",
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    "allauth.account.middleware.AccountMiddleware",
]

ROOT_URLCONF = 'skyhigh_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / "templates"],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'skyhigh_backend.wsgi.application'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Django REST Framework
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "accounts.auth.CsrfExemptSessionAuthentication",
        "rest_framework.authentication.BasicAuthentication",
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.TokenAuthentication",  # Flutter mobile/web
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle"
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",
        "user": "1000/hour",
        "login": "10/hour",
        "search": "60/minute",
        "cart": "30/minute",
        "admin": "200/hour",
    },
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.LimitOffsetPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.OrderingFilter",
        "rest_framework.filters.SearchFilter",
    ],
}

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static and Media files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
]

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Email settings
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "Sky High <noreply@skyhigh.com>")

# Cache timeout settings (in seconds)
CACHE_TTL = {
    'PRODUCTS': 60 * 15,  # 15 minutes
    'BRANDS': 60 * 60,    # 1 hour
    'ANALYTICS': 60 * 5,  # 5 minutes
    'USER_CART': 60 * 30, # 30 minutes
}

# Elasticsearch Configuration
ELASTICSEARCH_DSL = {
    'default': {
        'hosts': ['http://localhost:9200']
    },
}

# Celery Configuration
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
CELERY_BEAT_SCHEDULE = {
    'cleanup-sessions': {
        'task': 'core.tasks.cleanup_expired_sessions',
        'schedule': 60.0 * 60.0,  # Run every hour
    },
}

# Frontend URL (used for password reset links in emails)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Stripe Configuration
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_PUBLIC_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")