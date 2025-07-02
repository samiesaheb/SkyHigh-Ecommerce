from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from products.models import Product
from orders.models import Order, OrderItem  # ✅ from orders app
from products.serializers import ProductSerializer
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_GET
from django.core.mail import send_mail
import json
import traceback
import logging

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name="dispatch")
class CartView(APIView):

    def get(self, request):
        cart = request.session.get("cart", {})
        logger.info("🛍️ Cart GET from session: %s", cart)

        items = []
        for product_id, item in cart.items():
            try:
                if not isinstance(item, dict):
                    continue
                items.append({
                    "id": int(product_id),
                    "name": item["name"],
                    "price": item["price"],
                    "quantity": item["quantity"],
                    "main_image": item.get("main_image", ""),
                })
            except Exception as e:
                logger.error("⚠️ Error building cart item: %s", str(e))
                continue

        return Response({"items": items})

    def post(self, request):
        # ✅ Ensure session exists
        if not request.session.session_key:
            request.session.create()

        print("🛒 POST session key:", request.session.session_key)
        print("🧮 GET  session key:", request.session.session_key)
        product_id = str(request.data.get("product_id"))
        quantity = int(request.data.get("quantity", 1))

        logger.info("🔍 POST body: %s", request.data)

        cart = request.session.get("cart", {})

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        existing = cart.get(product_id, {})
        old_quantity = existing["quantity"] if isinstance(existing, dict) and "quantity" in existing else 0

        cart[product_id] = {
            "name": product.name,
            "price": float(product.price),
            "quantity": old_quantity + quantity,
            "main_image": product.main_image.url if product.main_image else "",
        }

        request.session["cart"] = cart
        request.session.modified = True

        logger.info("📦 Saved cart in session: %s", request.session["cart"])

        return Response({"message": "Item added to cart", "cart": cart}, status=status.HTTP_200_OK)


@csrf_exempt
@require_POST
def update_cart_quantity(request):
    try:
        data = json.loads(request.body)
        product_id = str(data["product_id"])
        quantity = int(data["quantity"])

        if quantity < 1:
            return JsonResponse({"error": "Quantity must be at least 1"}, status=400)

        cart = request.session.get("cart", {})
        if product_id in cart and isinstance(cart[product_id], dict):
            cart[product_id]["quantity"] = quantity
            request.session["cart"] = cart
            request.session.modified = True
            return JsonResponse({"success": True})
        else:
            return JsonResponse({"error": "Item not in cart or invalid"}, status=404)
    except (KeyError, ValueError, json.JSONDecodeError):
        return JsonResponse({"error": "Invalid data"}, status=400)


@csrf_exempt
@require_POST
def remove_from_cart(request):
    try:
        data = json.loads(request.body)
        product_id = str(data["product_id"])

        cart = request.session.get("cart", {})
        if product_id in cart:
            del cart[product_id]
            request.session["cart"] = cart
            request.session.modified = True
            return JsonResponse({"success": True})
        else:
            return JsonResponse({"error": "Item not in cart"}, status=404)
    except (KeyError, json.JSONDecodeError):
        return JsonResponse({"error": "Invalid data"}, status=400)


@csrf_exempt
@require_POST
def checkout_order(request):
    try:
        data = json.loads(request.body)

        full_name = data["fullName"]
        email = data["email"]
        address = data["address"]
        city = data["city"]
        zip_code = data["zip"]
        items = data["items"]

        # ✅ Save order in DB
        order = Order.objects.create(
            user=request.user if request.user.is_authenticated else None,
            full_name=full_name,
            email=email,
            address=address,
            city=city,
            zip=zip_code,
        )

        for item in items:
            product = Product.objects.get(id=item["id"])
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item["quantity"],
                price=item["price"],
            )

        request.session["cart"] = {}
        request.session.modified = True

        request.session["latest_order"] = {
            "name": full_name,
            "email": email,
            "address": address,
            "city": city,
            "zip": zip_code,
            "items": items,
        }

        # ✅ Confirmation email
        message_lines = [
            f"Thank you for your order, {full_name}!\n",
            f"Shipping to:\n{address}, {city}, {zip_code}\n",
            "Order Summary:",
        ]
        for item in items:
            message_lines.append(f"- {item['name']} x {item['quantity']} @ ฿{item['price']}")
        total = sum(float(i["price"]) * i["quantity"] for i in items)
        message_lines.append(f"\nTotal: ฿{total:.2f}")
        message = "\n".join(message_lines)

        send_mail(
            subject="🧾 Your Sky High Order Confirmation",
            message=message,
            from_email=None,
            recipient_list=[email],
        )

        return JsonResponse({"success": True})

    except Exception as e:
        print("❌ Checkout Error:", traceback.format_exc())
        return JsonResponse({"success": False, "error": str(e)}, status=400)


@csrf_exempt
def get_latest_order(request):
    order = request.session.get("latest_order")
    if order:
        return JsonResponse(order, safe=False)
    return JsonResponse({"error": "No order found"}, status=404)


@require_GET
def cart_quantity_view(request):
    cart = request.session.get("cart", {})
    print("🧮 Cart GET raw:", cart)

    total_quantity = 0
    for key, item in cart.items():
        if isinstance(item, dict):
            q = item.get("quantity")
            print(f"🔢 Item ID {key}, quantity:", q)
            try:
                total_quantity += int(q)
            except (TypeError, ValueError):
                continue

    print("🧮 Cart total quantity calculated:", total_quantity)
    return JsonResponse({"quantity": total_quantity})
