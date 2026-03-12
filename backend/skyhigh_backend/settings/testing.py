"""
Testing settings for skyhigh_backend project.
Optimized for fast test execution.
"""

from .base import *
import tempfile
from dotenv import load_dotenv

# Load testing-specific environment variables
load_dotenv(ENV_DIR / '.env.testing', override=True)

# Test mode
DEBUG = False
SECRET_KEY = 'test-secret-key-not-for-production'

# In-memory database for fast tests
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Disable migrations for faster tests
class DisableMigrations:
    def __contains__(self, item):
        return True
    def __getitem__(self, item):
        return None

MIGRATION_MODULES = DisableMigrations()

# Fast password hashing for tests
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Use database sessions for testing (more reliable)
SESSION_ENGINE = 'django.contrib.sessions.backends.db'

# Disable caching except for sessions
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Email backend for testing
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Media files in temp directory
MEDIA_ROOT = tempfile.mkdtemp()

# Disable logging during tests
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'null': {
            'class': 'logging.NullHandler',
        },
    },
    'root': {
        'handlers': ['null'],
    },
}

# Disable Celery during tests
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# Fast test settings
TEST_RUNNER = 'django.test.runner.DiscoverRunner'
TESTING = True