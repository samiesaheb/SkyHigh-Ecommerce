from rest_framework import serializers
from .models import QuoteRequest, QuoteFollowUp, SampleRequest


class QuoteRequestSerializer(serializers.ModelSerializer):
    """Serializer for creating quote requests"""

    class Meta:
        model = QuoteRequest
        fields = [
            'id',
            'company_name',
            'contact_name',
            'email',
            'phone',
            'country',
            'product_type',
            'custom_product_type',
            'volume_range',
            'timeline',
            'has_formulation',
            'branding_requirements',
            'additional_info',
            'hear_about_us',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def validate_email(self, value):
        """Validate email format"""
        return value.lower().strip()

    def validate_phone(self, value):
        """Validate phone number"""
        return value.strip()


class QuoteRequestAdminSerializer(serializers.ModelSerializer):
    """Serializer for admin management of quote requests"""

    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    follow_up_count = serializers.SerializerMethodField()
    is_new = serializers.BooleanField(read_only=True)
    response_time = serializers.FloatField(read_only=True)

    class Meta:
        model = QuoteRequest
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'ip_address', 'user_agent', 'referrer']

    def get_follow_up_count(self, obj):
        return obj.follow_ups.count()


class QuoteFollowUpSerializer(serializers.ModelSerializer):
    """Serializer for follow-up records"""

    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = QuoteFollowUp
        fields = '__all__'
        read_only_fields = ['created_at']


class SampleRequestSerializer(serializers.ModelSerializer):
    """Serializer for creating sample requests"""

    class Meta:
        model = SampleRequest
        fields = [
            'id',
            'company_name',
            'contact_name',
            'email',
            'phone',
            'country',
            'shipping_address',
            'product_categories',
            'specific_products',
            'intended_use',
            'business_type',
            'additional_info',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def validate_email(self, value):
        """Validate email format"""
        return value.lower().strip()


class SampleRequestAdminSerializer(serializers.ModelSerializer):
    """Serializer for admin management of sample requests"""

    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    is_new = serializers.BooleanField(read_only=True)

    class Meta:
        model = SampleRequest
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'ip_address', 'user_agent', 'referrer']
