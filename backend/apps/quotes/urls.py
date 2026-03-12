from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuoteRequestViewSet, QuoteFollowUpViewSet, SampleRequestViewSet

router = DefaultRouter()
router.register(r'quote-requests', QuoteRequestViewSet, basename='quoterequest')
router.register(r'sample-requests', SampleRequestViewSet, basename='samplerequest')
router.register(r'follow-ups', QuoteFollowUpViewSet, basename='followup')

urlpatterns = [
    path('', include(router.urls)),
]
