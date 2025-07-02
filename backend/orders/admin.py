# backend/orders/admin.py
from django.contrib import admin
from .models import Order, OrderItem
import csv
from django.http import HttpResponse


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product", "quantity", "price")
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "full_name", "email", "get_total_price", "created_at", "user")
    list_filter = ("created_at", "user")
    search_fields = ("full_name", "email", "user__username")
    inlines = [OrderItemInline]
    readonly_fields = ("created_at",)
    actions = ["export_as_csv"]  # 👈 string name of method

    def get_total_price(self, obj):
        return f"฿{obj.get_total_price():.2f}"
    get_total_price.short_description = "Total Price"

    def export_as_csv(self, request, queryset):
        import csv
        from django.http import HttpResponse

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="orders.csv"'

        writer = csv.writer(response)
        writer.writerow(["Order ID", "Customer Name", "Email", "Total", "Created At"])

        for order in queryset:
            total = order.get_total_price()
            writer.writerow([order.id, order.full_name, order.email, f"฿{total:.2f}", order.created_at])

        return response
    export_as_csv.short_description = "Export Selected Orders to CSV"



@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "product", "quantity", "price")
    list_filter = ("order", "product")
    search_fields = ("order__full_name", "product__name")
