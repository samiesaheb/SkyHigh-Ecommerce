from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.utils.decorators import method_decorator
import json
import os

from django.core.mail import send_mail
from django.contrib.auth import get_user_model

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import serializers, status


# ───── Basic Views ─────────────────────────────────────────

def about_view(request):
    return JsonResponse({
        "title": "About Us",
        "content": "Sky High International Co., Ltd. is a leading OEM/ODM cosmetic manufacturer based in Thailand..."
    })


def services_view(request):
    services = [
        "Custom Formulation",
        "Packaging & Labeling Solutions",
        "Regulatory & Legal Services",
        "Personal Care Development",
        "Baby & Sensitive Skin Product Design",
        "After Sales & Export Support"
    ]
    return JsonResponse({
        "title": "Our Services",
        "services": services
    })


@csrf_exempt
def contact_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            name = data.get("name")
            email = data.get("email")
            message = data.get("message")

            full_message = f"New message from {name} <{email}>:\n\n{message}"

            send_mail(
                subject="New Contact Form Submission - Sky High Website",
                message=full_message,
                from_email=os.getenv("DJANGO_DEFAULT_FROM_EMAIL", "no-reply@skyhigh.co.th"),
                recipient_list=[os.getenv("DJANGO_CONTACT_EMAIL", "samie@skyhigh.co.th")],
                fail_silently=False,
            )

            return JsonResponse({"status": "success", "message": "Message sent successfully!"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

    return JsonResponse({"message": "Send a POST request with name, email, and message."})


@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({"message": "CSRF cookie set."})


# ───── Profile Update View ────────────────────────────────

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email']

@method_decorator(csrf_exempt, name='dispatch')  # optional for testing, ideally use proper CSRF
class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.decorators import api_view, permission_classes

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    user = request.user
    return Response({
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
    })
