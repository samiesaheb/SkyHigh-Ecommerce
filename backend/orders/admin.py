# backend/orders/admin.py

import csv
from django.contrib import admin, messages
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.urls import path
from django import forms
from django.contrib.auth import get_user_model
from .models import Order, OrderItem

User = get_user_model()

class OrderItemImportForm(forms.Form):
    csv_file = forms.FileField()
    confirm = forms.BooleanField(required=False, label="Confirm import?")


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product", "quantity", "price")
    can_delete = False


class CSVImportForm(forms.Form):
    csv_file = forms.FileField()
    confirm = forms.BooleanField(required=False, label="Confirm import?")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "full_name", "email", "get_total_price", "created_at", "user")
    list_filter = ("created_at", "user")
    search_fields = ("full_name", "email", "user__username")
    inlines = [OrderItemInline]
    readonly_fields = ("created_at",)
    actions = ["export_as_csv"]
    change_list_template = "admin/orders/order/change_list.html"

    def get_total_price(self, obj):
        return f"฿{obj.get_total_price():.2f}"
    get_total_price.short_description = "Total Price"

    def export_as_csv(self, request, queryset):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="orders.csv"'

        writer = csv.writer(response)
        writer.writerow(["id", "full_name", "email", "user_id", "created_at"])

        for order in queryset:
            writer.writerow([
                order.id,
                order.full_name,
                order.email,
                order.user.id if order.user else "",
                order.created_at,
            ])

        return response
    export_as_csv.short_description = "Export Selected Orders to CSV"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path("import-csv/", self.import_csv, name="orders_order_import_csv"),
            path("download-template/", self.download_template, name="orders_order_download_template"),
        ]
        return custom_urls + urls

    def import_csv(self, request):
        if request.method == "POST":
            form = CSVImportForm(request.POST, request.FILES)
            if form.is_valid():
                csv_file = form.cleaned_data["csv_file"].read().decode("utf-8").splitlines()
                reader = csv.DictReader(csv_file)
                rows = list(reader)

                if not form.cleaned_data.get("confirm"):
                    return render(request, "admin/csv_form.html", {
                        "form": form,
                        "rows": rows,
                        "title": "Preview Orders to Import"
                    })

                created_count = 0
                updated_count = 0

                for row in rows:
                    try:
                        order = None
                        if row.get("id"):
                            order = Order.objects.filter(id=row["id"]).first()

                        try:
                            user = User.objects.get(id=row["user_id"]) if row.get("user_id") else None
                        except User.DoesNotExist:
                            messages.error(request, f"❌ User ID {row['user_id']} not found in row: {row}")
                            continue

                        if order:
                            order.full_name = row["full_name"]
                            order.email = row["email"]
                            order.user = user
                            order.save()
                            updated_count += 1
                        else:
                            Order.objects.create(
                                full_name=row["full_name"],
                                email=row["email"],
                                user=user
                            )
                            created_count += 1
                    except Exception as e:
                        messages.error(request, f"Error importing row: {row} — {e}")

                self.message_user(request, f"✅ Imported: {created_count} created, {updated_count} updated.")
                return redirect("..")
        else:
            form = CSVImportForm()

        return render(request, "admin/csv_form.html", {"form": form, "title": "Import Orders from CSV"})

    def download_template(self, request):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="order_template.csv"'
        writer = csv.writer(response)
        writer.writerow(["id", "full_name", "email", "user_id"])
        writer.writerow(["", "John Doe", "john@example.com", "1"])  # example row
        return response


from products.models import Product  # add at the top if not present

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "product", "quantity", "price")
    list_filter = ("order", "product")
    search_fields = ("order__full_name", "product__name")
    change_list_template = "admin/orders/orderitem/change_list.html"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path("import-csv/", self.import_csv, name="orders_orderitem_import_csv"),
            path("download-template/", self.download_template, name="orders_orderitem_download_template"),
        ]
        return custom_urls + urls

    def import_csv(self, request):
        if request.method == "POST":
            form = OrderItemImportForm(request.POST, request.FILES)
            if form.is_valid():
                csv_file = form.cleaned_data["csv_file"].read().decode("utf-8").splitlines()
                reader = csv.DictReader(csv_file)
                rows = list(reader)

                if not form.cleaned_data.get("confirm"):
                    return render(request, "admin/csv_form.html", {
                        "form": form,
                        "rows": rows,
                        "title": "Preview Order Items to Import"
                    })

                created_count = 0
                for row in rows:
                    try:
                        order = Order.objects.get(id=row["order_id"])
                        product = Product.objects.get(id=row["product_id"])

                        OrderItem.objects.create(
                            order=order,
                            product=product,
                            quantity=int(row["quantity"]),
                            price=float(row["price"]),
                        )
                        created_count += 1
                    except Order.DoesNotExist:
                        messages.error(request, f"❌ Order ID {row['order_id']} not found — {row}")
                        continue
                    except Product.DoesNotExist:
                        messages.error(request, f"❌ Product ID {row['product_id']} not found — {row}")
                        continue
                    except Exception as e:
                        messages.error(request, f"⚠️ Error importing row: {row} — {e}")
                        continue

                self.message_user(request, f"✅ Imported {created_count} OrderItems.")
                return redirect("..")
        else:
            form = OrderItemImportForm()

        return render(request, "admin/csv_form.html", {
            "form": form,
            "title": "Import Order Items from CSV"
        })

    def download_template(self, request):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="order_items_template.csv"'
        writer = csv.writer(response)
        writer.writerow(["order_id", "product_id", "quantity", "price"])
        writer.writerow(["12", "3", "2", "199.00"])  # example row
        return response
