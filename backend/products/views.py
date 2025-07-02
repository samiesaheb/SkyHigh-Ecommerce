from rest_framework import generics
from .models import Brand, Product
from .serializers import BrandSerializer, ProductSerializer
from django.http import JsonResponse
from django.db.models import Q

class BrandListView(generics.ListAPIView):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer


class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.all()

        brand_slug = self.request.query_params.get("brand")
        if brand_slug:
            queryset = queryset.filter(brand__slug=brand_slug)

        product_slug = self.request.query_params.get("slug")
        if product_slug:
            queryset = queryset.filter(slug=product_slug)

        product_id = self.request.query_params.get("id")
        if product_id and product_id.isdigit():
            queryset = queryset.filter(id=int(product_id))

        # ✅ Add this block for search support
        search_query = self.request.query_params.get("search")
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query)
            )

        return queryset


def product_search_suggestions(request):
    query = request.GET.get("query", "")
    if query:
        products = Product.objects.filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        )[:10]
        suggestions = [
            {
                "id": p.id,
                "name": p.name,
                "slug": p.slug,
                "main_image": p.main_image.url if p.main_image else ""
            }
            for p in products
        ]
    else:
        suggestions = []
    return JsonResponse(suggestions, safe=False)


# ✅ Cart quantity endpoint with session creation fallback
from django.views.decorators.http import require_GET

@require_GET
def cart_quantity_view(request):
    if not request.session.session_key:
        request.session.create()  # ✅ Force session creation if not present

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
