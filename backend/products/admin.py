# backend/products/admin.py

import csv
from django.http import HttpResponse
from django.contrib import admin, messages
from django.shortcuts import render, redirect
from django.urls import path
from django import forms
from .models import Brand, Product


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("id", "name")


class CSVImportForm(forms.Form):
    csv_file = forms.FileField()
    confirm = forms.BooleanField(required=False, label="Confirm import?")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "brand", "price")
    list_filter = ("brand",)
    actions = ["export_products_as_csv"]
    change_list_template = "admin/products/product/change_list.html"

    def export_products_as_csv(self, request, queryset):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="products.csv"'
        writer = csv.writer(response)
        writer.writerow(["Product ID", "Name", "Brand", "Price"])

        for product in queryset:
            writer.writerow([
                product.id,
                product.name,
                product.brand.name,
                f"฿{product.price:.2f}"
            ])

        return response

    export_products_as_csv.short_description = "Export Selected Products to CSV"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path("import-csv/", self.import_csv, name="products_product_import_csv"),
            path("download-template/", self.download_template, name="products_product_download_template"),
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
                        "title": "Preview Products to Import"
                    })

                created_count = 0
                updated_count = 0
                for row in rows:
                    try:
                        product = None
                        if row.get("id"):
                            product = Product.objects.filter(id=row["id"]).first()
                        if not product and row.get("name"):
                            product = Product.objects.filter(name=row["name"]).first()

                        try:
                            brand = Brand.objects.get(id=row["brand_id"])
                        except Brand.DoesNotExist:
                            messages.error(request, f"❌ Brand ID {row['brand_id']} not found for row: {row}")
                            continue

                        if product:
                            product.name = row["name"]
                            product.brand = brand
                            product.price = row["price"]
                            product.save()
                            updated_count += 1
                        else:
                            Product.objects.create(
                                name=row["name"],
                                brand=brand,
                                price=row["price"]
                            )
                            created_count += 1

                    except Exception as e:
                        messages.error(request, f"Error importing row: {row} — {e}")

                self.message_user(request, f"✅ Imported: {created_count} created, {updated_count} updated.")
                return redirect("..")
        else:
            form = CSVImportForm()

        return render(request, "admin/csv_form.html", {"form": form, "title": "Import Products from CSV"})

    def download_template(self, request):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="product_template.csv"'
        writer = csv.writer(response)
        writer.writerow(["id", "name", "brand_id", "price"])
        writer.writerow(["", "Sample Product", "1", "199.99"])  # example row
        return response
