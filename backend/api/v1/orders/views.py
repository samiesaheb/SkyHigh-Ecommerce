import stripe
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from orders.models import Order, OrderItem
from products.models import Product
from .serializers import OrderSerializer
from django.core.mail import send_mail
from notifications.email_service import email_service

# ✅ Stripe key will be set conditionally in the checkout function
print("⚠️ INFO: Stripe API key will be set conditionally during checkout")


@api_view(["POST"])
@permission_classes([AllowAny])
def checkout(request):
    data = request.data
    items = data.get("items", [])

    if not items:
        return Response({"error": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

    # ✅ Input validation and sanitization
    required_fields = ["fullName", "email", "address", "city"]
    for field in required_fields:
        if not data.get(field, "").strip():
            return Response({"error": f"{field} is required."}, status=status.HTTP_400_BAD_REQUEST)
    
    # Email validation
    import re
    email = data.get("email", "").strip()
    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
        return Response({"error": "Invalid email format."}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate items exist and have valid data
    validated_items = []
    for item in items:
        try:
            product = Product.objects.get(id=item["id"])
            quantity = int(item["quantity"])
            if quantity <= 0:
                return Response({"error": "Invalid quantity."}, status=status.HTTP_400_BAD_REQUEST)
            validated_items.append({
                "id": product.id,
                "name": product.name,
                "price": str(product.price),  # Use actual product price for security
                "quantity": quantity
            })
        except (Product.DoesNotExist, KeyError, ValueError):
            return Response({"error": "Invalid product data."}, status=status.HTTP_400_BAD_REQUEST)

    # ✅ Log items
    print("📦 Checkout items validated:", validated_items)

    # ✅ Calculate total using validated items
    try:
        total_amount = sum(float(item["price"]) * item["quantity"] for item in validated_items)
        print("💰 Calculated total (THB):", total_amount)
    except Exception as e:
        print("❌ Error calculating total:", e)
        return Response({"error": "Invalid item data.", "details": str(e)}, status=400)

    # ✅ Check Stripe configuration and create PaymentIntent
    mock_keys = [
        "sk_test_YOUR_SECRET_KEY_HERE",
        "sk_test_REPLACE_WITH_YOUR_ACTUAL_STRIPE_SECRET_KEY",
        "sk_test_your_stripe_secret_key"  # Default from settings
    ]

    print(f"🔍 Debug: STRIPE_SECRET_KEY = '{settings.STRIPE_SECRET_KEY}'")
    print(f"🔍 Debug: Mock keys = {mock_keys}")
    print(f"🔍 Debug: Key in mock_keys = {settings.STRIPE_SECRET_KEY in mock_keys}")

    if not settings.STRIPE_SECRET_KEY or settings.STRIPE_SECRET_KEY in mock_keys:

        # Development mode - create a mock PaymentIntent for testing
        print("🔧 Development mode: Using mock Stripe PaymentIntent")
        import uuid
        import time

        # Create a mock intent object that mimics Stripe's response
        class MockIntent:
            def __init__(self):
                self.id = f"pi_mock_{int(time.time())}_{uuid.uuid4().hex[:8]}"
                self.client_secret = f"{self.id}_secret_{uuid.uuid4().hex[:16]}"

        intent = MockIntent()
        print("✅ Mock PaymentIntent created:", intent.id)
    else:
        # Production mode - use real Stripe
        try:
            # Set the API key right before using it
            stripe.api_key = settings.STRIPE_SECRET_KEY

            intent = stripe.PaymentIntent.create(
                amount=int(total_amount * 100),  # Convert to satang
                currency="thb",
                metadata={
                    "integration_check": "accept_a_payment",
                    "order_email": data.get("email", ""),
                    "customer_name": data.get("fullName", ""),
                },
                receipt_email=data.get("email"),  # Send receipt to customer
                description=f"Sky High Order - {len(items)} items",
                automatic_payment_methods={"enabled": True},
            )
            print("✅ Stripe PaymentIntent created:", intent.id)
        except stripe.error.StripeError as e:
            print("❌ Stripe error:", str(e))
            return Response({"error": "Payment processing error", "details": str(e)}, status=500)

    # ✅ Save Order
    order = Order.objects.create(
        user=request.user if request.user.is_authenticated else None,
        full_name=data.get("fullName", ""),
        email=data.get("email", ""),
        address=data.get("address", ""),
        city=data.get("city", ""),
        country=data.get("country", "Thailand"),
        zip=data.get("zip", ""),
        payment_intent_id=intent.id,  # Store payment intent ID immediately
        status='pending'
    )

    for item in validated_items:
        product = Product.objects.get(id=item["id"])
        OrderItem.objects.create(
            order=order,
            product=product,
            quantity=item["quantity"],
            price=item["price"],
        )

    # ✅ Save order ID and payment intent ID to session for later confirmation
    request.session["latest_order_id"] = order.id
    request.session["payment_intent_id"] = intent.id
    print(f"💾 Saved order {order.id} and payment intent {intent.id} to session")

    return Response({
        "success": True,
        "message": "✅ Order created. Complete payment using clientSecret.",
        "clientSecret": intent.client_secret,
        "publicKey": settings.STRIPE_PUBLIC_KEY,
    })



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_order_history(request):
    orders = Order.objects.filter(user=request.user).order_by("-created_at")
    serializer = OrderSerializer(orders, many=True, context={'request': request})  # ✅ fixed
    return Response(serializer.data)



@api_view(["POST"])
@permission_classes([AllowAny])
def confirm_payment(request):
    """Called after successful Stripe payment to send confirmation email and clear cart"""
    order_id = request.session.get("latest_order_id")
    payment_intent_id = request.session.get("payment_intent_id")

    if not order_id or not payment_intent_id:
        return Response({"error": "No order or payment found"}, status=400)

    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)

    # ✅ Mark order as paid and update status
    from django.utils import timezone
    order.is_paid = True
    order.paid_at = timezone.now()
    order.status = 'processing'
    order.save()

    print(f"✅ Order {order.id} marked as paid and status updated to processing")
    
    # ✅ Format ordered items
    items = order.items.select_related("product").all()
    item_lines = []
    total_amount = 0
    
    for item in items:
        name = item.product.name
        quantity = item.quantity
        price = float(item.price)
        subtotal = price * quantity
        total_amount += subtotal
        item_lines.append(f"- {name} (x{quantity}): ฿{subtotal:.2f}")

    item_text = "\n".join(item_lines)

    # ✅ Send confirmation email using enhanced email service
    try:
        email_sent = email_service.send_order_confirmation(order)
        if email_sent:
            print("✅ Confirmation email sent successfully")
        else:
            print("⚠️ Failed to send confirmation email (continuing anyway)")
    except Exception as e:
        print(f"⚠️ Failed to send confirmation email (continuing anyway): {e}")
        # Don't fail the response if email fails
    
    # ✅ Clear the cart after successful payment
    request.session["cart"] = {}
    request.session.modified = True
    print("🛒 Cart cleared after successful payment")
    
    return Response({"success": True, "message": "Payment confirmed"})


@api_view(["GET"])
@permission_classes([AllowAny])
def latest_order(request):
    order_id = request.session.get("latest_order_id")
    if not order_id:
        return Response({"error": "No order found"}, status=404)

    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)

    items = order.items.select_related("product").all()
    serialized_items = []
    for item in items:
        rel = item.product.main_image.url if getattr(item.product, "main_image", None) else ""
        img = request.build_absolute_uri(rel) if rel else ""
        serialized_items.append({
            "id": item.product.id,
            "name": item.product.name,
            "price": item.price,
            "quantity": item.quantity,
            "main_image": img,
        })

    return Response({
        "id": order.id,
        "name": order.full_name,
        "email": order.email,
        "address": order.address,
        "city": order.city,
        "zip": order.zip,
        "items": serialized_items,
        "status": order.status,
        "is_paid": order.is_paid,
        "created_at": order.created_at,
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def order_status(request, order_id):
    """Get order status by order ID"""
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)

    return Response({
        "id": order.id,
        "status": order.status,
        "is_paid": order.is_paid,
        "created_at": order.created_at,
        "paid_at": order.paid_at,
        "tracking_number": order.tracking_number,
    })