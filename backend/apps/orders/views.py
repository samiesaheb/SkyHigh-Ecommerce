import stripe
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Order, OrderItem
from products.models import Product
from .serializers import OrderSerializer
from django.core.mail import send_mail

# ✅ Stripe secret key
stripe.api_key = settings.STRIPE_SECRET_KEY


@api_view(["POST"])
@permission_classes([AllowAny])
def checkout(request):
    data = request.data
    items = data.get("items", [])

    if not items:
        return Response({"error": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

    # ✅ Log items
    print("📦 Checkout items received:", items)

    # ✅ Calculate total
    try:
        total_amount = sum(float(item["price"]) * item["quantity"] for item in items)
        print("💰 Calculated total (THB):", total_amount)
    except Exception as e:
        print("❌ Error calculating total:", e)
        return Response({"error": "Invalid item data.", "details": str(e)}, status=400)

    # ✅ Create Stripe PaymentIntent
    try:
        intent = stripe.PaymentIntent.create(
            amount=int(total_amount * 100),  # Convert to satang
            currency="thb",
            metadata={"integration_check": "accept_a_payment"},
        )
        print("✅ Stripe PaymentIntent created:", intent.id)
    except stripe.error.StripeError as e:
        print("❌ Stripe error:", str(e))
        return Response({"error": "Stripe error", "details": str(e)}, status=500)

    # ✅ Save Order
    order = Order.objects.create(
        user=request.user if request.user.is_authenticated else None,
        full_name=data.get("fullName", ""),
        email=data.get("email", ""),
        address=data.get("address", ""),
        city=data.get("city", ""),
        zip=data.get("zip", ""),
    )

    for item in items:
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

    # ✅ Send confirmation email (optional in development)
    try:
        send_mail(
            subject="Your Sky High Order Confirmation",
            message=(
                f"Hi {order.full_name},\n\n"
                f"Thank you for your order! Payment successful.\n\n"
                f"We'll ship it to:\n"
                f"{order.address}, {order.city}, {order.zip}\n\n"
                f"Order Summary:\n"
                f"{item_text}\n\n"
                f"Total: ฿{total_amount:.2f}\n\n"
                f"Stay beautiful!\n"
                f"Sky High International Co., Ltd."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[order.email],
            fail_silently=False,
        )
        print("✅ Confirmation email sent successfully")
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
        "name": order.full_name,
        "email": order.email,
        "address": order.address,
        "city": order.city,
        "zip": order.zip,
        "items": serialized_items,
    })
