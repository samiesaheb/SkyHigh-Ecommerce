# accounts/adapters.py
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.exceptions import ImmediateHttpResponse
from allauth.socialaccount.models import SocialAccount
from django.http import JsonResponse
from django.contrib.auth import get_user_model

User = get_user_model()


class GoogleIDTokenAdapter(GoogleOAuth2Adapter):
    def complete_login(self, request, app, token, response):
        id_token = response.get("id_token")
        print("✅ Adapter received id_token:", id_token)

        # 🛠️ Set token and token type properly
        token.token = id_token
        token.token_type = "id_token"  # 👈 crucial to tell Allauth we're using ID Token

        return super().complete_login(request, app, token, response)


class MySocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        # Skip if the social account is already linked
        if sociallogin.is_existing:
            return

        email = sociallogin.account.extra_data.get("email")
        if not email:
            return

        try:
            user = User.objects.get(email=email)

            # Link the new social account to the existing user
            existing_account = SocialAccount.objects.filter(user=user, provider=sociallogin.account.provider).first()

            if existing_account:
                # 🚫 Already connected via this provider
                raise ImmediateHttpResponse(JsonResponse({
                    "error": "This email is already associated with a Google account."
                }, status=400))

            print("🔗 Linking social account to existing user:", email)
            sociallogin.connect(request, user)

        except User.DoesNotExist:
            pass  # Let it create a new account

from allauth.account.adapter import DefaultAccountAdapter
from django.utils.crypto import get_random_string

class NoUsernameAccountAdapter(DefaultAccountAdapter):
    def populate_username(self, request, user):
        # Generate a random username since we're not using it
        user.username = get_random_string(10)
