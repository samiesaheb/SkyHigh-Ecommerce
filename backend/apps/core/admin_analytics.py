# backend/core/admin_analytics.py

from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render
from django.db.models import Sum, Count
from django.urls import path
from orders.models import Order, OrderItem
from products.models import Product
from django.contrib.auth import get_user_model
from django.http import HttpResponse
import csv

User = get_user_model()

@staff_member_required
def admin_analytics_view(request):
    start_date = request.GET.get("start")
    end_date = request.GET.get("end")
    group_by = request.GET.get("group_by", "daily")  # "daily", "monthly", "quarterly"

    filters = {}
    if start_date:
        filters["created_at__gte"] = start_date
    if end_date:
        filters["created_at__lte"] = end_date

    # Revenue Grouping
    if group_by == "monthly":
        date_trunc = "strftime('%%Y-%%m', created_at)"  # SQLite
    elif group_by == "quarterly":
        date_trunc = "strftime('%%Y-Q') || ((cast(strftime('%%m', created_at) as integer) - 1)/3 + 1)"  # SQLite trick
    else:
        date_trunc = "date(created_at)"  # Default: daily

    revenue_by_date = (
        Order.objects
        .filter(**filters)
        .extra(select={'date': date_trunc})
        .values('date')
        .annotate(total=Sum('items__price'))
        .order_by('date')
    )

    # Top-Selling Products & Customers (unchanged)
    top_products = (
        OrderItem.objects
        .filter(order__created_at__gte=filters.get("created_at__gte", None),
                order__created_at__lte=filters.get("created_at__lte", None))
        .values('product__name')
        .annotate(total_sold=Sum('quantity'))
        .order_by('-total_sold')[:5]
    )

    top_customers = (
        Order.objects
        .filter(**filters)
        .values('user__email')
        .annotate(order_count=Count('id'))
        .order_by('-order_count')[:5]
    )

    total_revenue = OrderItem.objects.filter(
        order__created_at__gte=filters.get("created_at__gte", None),
        order__created_at__lte=filters.get("created_at__lte", None)
    ).aggregate(sum=Sum('price'))["sum"] or 0

    total_orders = Order.objects.filter(**filters).count()
    total_customers = User.objects.filter(
        order__created_at__gte=filters.get("created_at__gte", None),
        order__created_at__lte=filters.get("created_at__lte", None)
    ).distinct().count()

    context = {
        "labels": [entry["date"] for entry in revenue_by_date],
        "totals": [float(entry["total"] or 0) for entry in revenue_by_date],
        "top_products": list(top_products),
        "top_customers": list(top_customers),
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "total_customers": total_customers,
        "group_by": group_by,
    }

    return render(request, "admin/analytics_dashboard.html", context)


@staff_member_required
def export_analytics_csv(request):
    start_date = request.GET.get("start")
    end_date = request.GET.get("end")

    filters = {}
    if start_date:
        filters["created_at__gte"] = start_date
    if end_date:
        filters["created_at__lte"] = end_date

    total_revenue = OrderItem.objects.filter(
        order__created_at__gte=filters.get("created_at__gte", None),
        order__created_at__lte=filters.get("created_at__lte", None)
    ).aggregate(sum=Sum('price'))["sum"] or 0

    total_orders = Order.objects.filter(**filters).count()

    total_customers = User.objects.filter(
        order__created_at__gte=filters.get("created_at__gte", None),
        order__created_at__lte=filters.get("created_at__lte", None)
    ).distinct().count()

    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = "attachment; filename=analytics_summary.csv"

    writer = csv.writer(response)
    writer.writerow(["Total Revenue", "Total Orders", "Total Customers"])
    writer.writerow([f"{total_revenue:.2f}", total_orders, total_customers])

    return response


# ✅ Admin URL registration hook
def get_analytics_urls():
    return [
        path("admin/analytics/", admin_analytics_view, name="admin_analytics"),
        path("admin/analytics/export-csv/", export_analytics_csv, name="admin_analytics_export_csv"),
    ]
