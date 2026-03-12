"""
Script to create a legacy session cart to test migration
"""
import os
import django
os.environ.setdefault('DJANGO_SECRET_KEY', 'test-key-123')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skyhigh_backend.settings')

django.setup()

from django.contrib.sessions.models import Session
from django.contrib.sessions.backends.db import SessionStore
import json

# Create a session with legacy cart data
session = SessionStore()
session.create()  # Create the session first

cart_data = {
    '9': {
        'name': 'Geometry Facial Foam',
        'price': '450.00',
        'quantity': 1,
        'main_image': '/media/products/geometry/geometry-whitening-facial-foam.jpg'
    },
    '10': {
        'name': 'Geometry Hair Serum',
        'price': '680.00',
        'quantity': 2,
        'main_image': '/media/products/geometry/geometry-extra-hair-serum.jpg'
    }
}

session['cart'] = cart_data
session.modified = True
session.save()

print(f"Created legacy session: {session.session_key}")
print(f"Legacy cart data: {session['cart']}")

# Verify the session was saved
from django.contrib.sessions.models import Session as SessionModel
db_session = SessionModel.objects.get(session_key=session.session_key)
print(f"DB session data: {db_session.get_decoded()}")