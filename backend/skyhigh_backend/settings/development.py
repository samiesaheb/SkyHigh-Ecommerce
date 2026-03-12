"""
Development settings for skyhigh_backend project.
"""

from .base import *
import os
from dotenv import load_dotenv

# Load development-specific environment variables
load_dotenv(ENV_DIR / '.env.development', override=True)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-9hi-_u-h5+=^ki=-4-9r=lv15$+!@x0hec8b-ddg+4i)nf%1lq')

ALLOWED_HOSTS = ["*", "localhost", "127.0.0.1", "192.168.1.120"]

# Database - SQLite for development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# CORS settings for development
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
]

# Session settings for development
SESSION_ENGINE = "django.contrib.sessions.backends.db"
SESSION_COOKIE_NAME = "sessionid"
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SECURE = False

CSRF_COOKIE_NAME = "csrftoken"
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SECURE = False

# Cache Configuration - local memory for development
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-snowflake",
    }
}

# Use memory cache for sessions in development
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "default"

# Redirect login links to frontend
LOGIN_URL = "http://localhost:3000/account/login"

# After allauth social login, redirect to Flutter bridge (sends token via postMessage)
LOGIN_REDIRECT_URL = "/api/accounts/flutter-auth-complete/"

# Development logging
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "DEBUG",
    },
}