"""
WSGI config for skyhigh_backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""
from dotenv import load_dotenv
load_dotenv()

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skyhigh_backend.settings')

application = get_wsgi_application()
