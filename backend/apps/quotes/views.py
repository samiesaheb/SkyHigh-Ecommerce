from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import QuoteRequest, QuoteFollowUp, SampleRequest
from .serializers import (
    QuoteRequestSerializer, QuoteRequestAdminSerializer, QuoteFollowUpSerializer,
    SampleRequestSerializer, SampleRequestAdminSerializer
)


def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


class QuoteRequestViewSet(viewsets.ModelViewSet):
    """
    API endpoint for B2B quote requests
    """
    queryset = QuoteRequest.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['company_name', 'contact_name', 'email', 'product_type']
    ordering_fields = ['created_at', 'status', 'priority']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.user.is_staff:
            return QuoteRequestAdminSerializer
        return QuoteRequestSerializer

    def get_permissions(self):
        """Allow anyone to create quote requests, but only admins can view/manage"""
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]

    def create(self, request, *args, **kwargs):
        """Create a new quote request with tracking info"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Add tracking information
        quote = serializer.save(
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            referrer=request.META.get('HTTP_REFERER', '')
        )

        # Send notification email to admin
        self.send_admin_notification(quote)

        # Send confirmation email to client
        self.send_client_confirmation(quote)

        return Response(
            {
                'message': 'Quote request received successfully. We will contact you within 24 hours.',
                'quote_id': quote.id
            },
            status=status.HTTP_201_CREATED
        )

    def send_admin_notification(self, quote):
        """Send email notification to admin team"""
        try:
            subject = f'New B2B Quote Request from {quote.company_name}'
            message = f"""
New quote request received:

Company: {quote.company_name}
Contact: {quote.contact_name}
Email: {quote.email}
Phone: {quote.phone}
Country: {quote.country}

Product Type: {quote.product_type}
Volume: {quote.volume_range}
Timeline: {quote.timeline}

View full details in admin panel: {settings.SITE_URL}/admin/quotes/quoterequest/{quote.id}/
            """

            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [settings.ADMIN_EMAIL],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Failed to send admin notification: {e}")

    def send_client_confirmation(self, quote):
        """Send confirmation email to client"""
        try:
            subject = 'Quote Request Received - Sky High International'
            message = f"""
Dear {quote.contact_name},

Thank you for your interest in Sky High International's manufacturing services.

We have received your quote request for {quote.product_type} with an estimated volume of {quote.volume_range}.

Our business development team will review your requirements and contact you within 24 hours to discuss your project in detail.

If you have any urgent questions, please contact us at:
Phone: (+66) 23233517-20
Email: info@skyhigh.co.th

Best regards,
Sky High International Team
            """

            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [quote.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Failed to send client confirmation: {e}")

    @action(detail=True, methods=['post'])
    def mark_contacted(self, request, pk=None):
        """Mark quote as contacted"""
        quote = self.get_object()
        quote.mark_as_contacted()
        return Response({'status': 'marked as contacted'})

    @action(detail=True, methods=['post'])
    def mark_quote_sent(self, request, pk=None):
        """Mark quote as sent"""
        quote = self.get_object()
        quote.mark_quote_sent()
        return Response({'status': 'quote sent'})

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get quote request statistics"""
        queryset = self.get_queryset()

        total = queryset.count()
        new = queryset.filter(status='new').count()
        reviewing = queryset.filter(status='reviewing').count()
        quoted = queryset.filter(status='quoted').count()
        converted = queryset.filter(status='converted').count()

        # Recent quotes (last 30 days)
        recent_date = timezone.now() - timezone.timedelta(days=30)
        recent = queryset.filter(created_at__gte=recent_date).count()

        return Response({
            'total': total,
            'new': new,
            'reviewing': reviewing,
            'quoted': quoted,
            'converted': converted,
            'recent_30_days': recent,
            'conversion_rate': round((converted / total * 100), 2) if total > 0 else 0
        })


class QuoteFollowUpViewSet(viewsets.ModelViewSet):
    """
    API endpoint for quote follow-ups
    """
    queryset = QuoteFollowUp.objects.all()
    serializer_class = QuoteFollowUpSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [filters.OrderingFilter]
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        quote_id = self.request.query_params.get('quote', None)
        if quote_id:
            queryset = queryset.filter(quote_id=quote_id)
        return queryset

    def perform_create(self, serializer):
        """Set the user when creating a follow-up"""
        serializer.save(user=self.request.user)


class SampleRequestViewSet(viewsets.ModelViewSet):
    """
    API endpoint for B2B sample requests
    """
    queryset = SampleRequest.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['company_name', 'contact_name', 'email', 'product_categories']
    ordering_fields = ['created_at', 'status']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.user.is_staff:
            return SampleRequestAdminSerializer
        return SampleRequestSerializer

    def get_permissions(self):
        """Allow anyone to create sample requests, but only admins can view/manage"""
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]

    def create(self, request, *args, **kwargs):
        """Create a new sample request with tracking info"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Add tracking information
        sample = serializer.save(
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            referrer=request.META.get('HTTP_REFERER', '')
        )

        # Send notification email to admin
        self.send_admin_notification(sample)

        # Send confirmation email to client
        self.send_client_confirmation(sample)

        return Response(
            {
                'message': 'Sample request received successfully. We will contact you within 24 hours.',
                'sample_id': sample.id
            },
            status=status.HTTP_201_CREATED
        )

    def send_admin_notification(self, sample):
        """Send email notification to admin team"""
        try:
            subject = f'New Sample Request from {sample.company_name}'
            message = f"""
New sample request received:

Company: {sample.company_name}
Contact: {sample.contact_name}
Email: {sample.email}
Phone: {sample.phone}
Country: {sample.country}

Product Categories: {sample.product_categories}
Intended Use: {sample.get_intended_use_display()}
Business Type: {sample.business_type}

Shipping Address:
{sample.shipping_address}

View full details in admin panel: {settings.SITE_URL}/admin/quotes/samplerequest/{sample.id}/
            """

            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [settings.ADMIN_EMAIL],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Failed to send admin notification: {e}")

    def send_client_confirmation(self, sample):
        """Send confirmation email to client"""
        try:
            subject = 'Sample Request Received - Sky High International'
            message = f"""
Dear {sample.contact_name},

Thank you for your interest in Sky High International's products.

We have received your request for samples in the following categories: {sample.product_categories}

Our team will review your request and contact you within 24 hours to confirm sample availability and shipping details.

Sample shipping typically takes 3-5 business days after approval.

If you have any urgent questions, please contact us at:
Phone: (+66) 23233517-20
Email: info@skyhigh.co.th

Best regards,
Sky High International Team
            """

            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [sample.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Failed to send client confirmation: {e}")

    @action(detail=True, methods=['post'])
    def mark_approved(self, request, pk=None):
        """Mark sample request as approved"""
        sample = self.get_object()
        sample.mark_as_approved()
        return Response({'status': 'marked as approved'})

    @action(detail=True, methods=['post'])
    def mark_shipped(self, request, pk=None):
        """Mark samples as shipped"""
        sample = self.get_object()
        tracking = request.data.get('tracking_number', '')
        sample.mark_as_shipped(tracking)
        return Response({'status': 'marked as shipped', 'tracking_number': sample.tracking_number})

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get sample request statistics"""
        queryset = self.get_queryset()

        total = queryset.count()
        new = queryset.filter(status='new').count()
        approved = queryset.filter(status='approved').count()
        shipped = queryset.filter(status='shipped').count()
        delivered = queryset.filter(status='delivered').count()

        # Recent requests (last 30 days)
        recent_date = timezone.now() - timezone.timedelta(days=30)
        recent = queryset.filter(created_at__gte=recent_date).count()

        return Response({
            'total': total,
            'new': new,
            'approved': approved,
            'shipped': shipped,
            'delivered': delivered,
            'recent_30_days': recent,
        })
