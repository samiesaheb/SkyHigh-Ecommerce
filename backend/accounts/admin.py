from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from orders.models import Order
from django.db.models import Count, Sum, Max
from django.http import HttpResponse
import csv

User = get_user_model()


class OrderInline(admin.TabularInline):
    model = Order
    fields = ("id", "full_name", "created_at", "get_total_price")
    readonly_fields = fields
    can_delete = False
    extra = 0
    verbose_name_plural = "Order History"

    def get_total_price(self, obj):
        return f"฿{obj.get_total_price():.2f}"
    get_total_price.short_description = "Total Price"


@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    ordering = ("email",)  # ✅ Fixes 'username' field issue

    list_display = (
        "id",
        "email",
        "first_name",
        "last_name",
        "is_staff",
        "order_count",
        "total_spent",
        "last_order_date",
    )
    readonly_fields = ("order_count", "total_spent", "last_order_date")
    inlines = [OrderInline]
    actions = ["export_customers_to_csv"]

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(
            _order_count=Count("order"),
            _total_spent=Sum("order__items__price"),
            _last_order_date=Max("order__created_at"),
        )

    def order_count(self, obj):
        return obj._order_count
    order_count.short_description = "Orders"

    def total_spent(self, obj):
        return f"฿{obj._total_spent:.2f}" if obj._total_spent else "฿0.00"
    total_spent.short_description = "Total Spent"

    def last_order_date(self, obj):
        return obj._last_order_date
    last_order_date.short_description = "Last Purchase"

    def export_customers_to_csv(self, request, queryset):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="customers.csv"'
        writer = csv.writer(response)
        writer.writerow(["ID", "Email", "First Name", "Last Name", "Orders", "Total Spent", "Last Purchase"])

        for user in queryset.annotate(
            order_count=Count("order"),
            total_spent=Sum("order__items__price"),
            last_order=Max("order__created_at"),
        ):
            writer.writerow([
                user.id,
                user.email,
                user.first_name,
                user.last_name,
                user.order_count,
                f"฿{user.total_spent:.2f}" if user.total_spent else "฿0.00",
                user.last_order or "-",
            ])

        return response

    export_customers_to_csv.short_description = "Export selected customers to CSV"
