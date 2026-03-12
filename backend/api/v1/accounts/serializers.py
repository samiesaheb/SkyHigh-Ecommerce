from django.contrib.auth import get_user_model
User = get_user_model()

from rest_framework import serializers
from dj_rest_auth.registration.serializers import SocialLoginSerializer

# 👤 Existing user serializer
class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "full_name", "is_admin"]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()
    
    def get_is_admin(self, obj):
        return obj.is_staff or obj.is_superuser

# 🌐 Google login serializer using id_token
class GoogleLoginSerializer(SocialLoginSerializer):
    id_token = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        # 👇 Required: Set access_token from id_token
        attrs["access_token"] = attrs.get("id_token")
        return super().validate(attrs)