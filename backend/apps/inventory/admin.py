from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    StockLevel, StockMovement, Supplier, PurchaseOrder, 
    PurchaseOrderItem, StockAlert
)

@admin.register(StockLevel)
class StockLevelAdmin(admin.ModelAdmin):
    list_display = [
        'product', 'quantity', 'reserved_quantity', 'available_quantity_display',
        'status', 'low_stock_threshold', 'reorder_point', 'needs_reorder_display', 'last_updated'
    ]
    list_filter = ['status', 'last_updated']
    search_fields = ['product__name', 'product__sku']
    readonly_fields = ['last_updated', 'created_at', 'available_quantity_display']
    list_editable = ['quantity', 'low_stock_threshold', 'reorder_point']
    
    def available_quantity_display(self, obj):
        return obj.available_quantity
    available_quantity_display.short_description = 'Available'
    
    def needs_reorder_display(self, obj):
        if obj.needs_reorder:
            return format_html('<span style="color: red;">Yes</span>')
        return 'No'
    needs_reorder_display.short_description = 'Needs Reorder'
    needs_reorder_display.boolean = True
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('product')

@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = [
        'stock_level', 'movement_type', 'quantity_change_display',
        'quantity_before', 'quantity_after', 'reason', 'created_at'
    ]
    list_filter = ['movement_type', 'created_at']
    search_fields = ['stock_level__product__name', 'reason', 'reference_id']
    readonly_fields = ['created_at']
    
    def quantity_change_display(self, obj):
        color = 'green' if obj.quantity_change >= 0 else 'red'
        sign = '+' if obj.quantity_change >= 0 else ''
        return format_html(
            '<span style="color: {};">{}{}</span>',
            color, sign, obj.quantity_change
        )
    quantity_change_display.short_description = 'Change'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'stock_level__product', 'created_by'
        )

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['name', 'contact_person', 'email', 'phone', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'contact_person', 'email']
    list_editable = ['is_active']

class PurchaseOrderItemInline(admin.TabularInline):
    model = PurchaseOrderItem
    extra = 0
    readonly_fields = ['total_cost']

@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = [
        'po_number', 'supplier', 'status', 'order_date', 
        'expected_date', 'total_amount', 'created_by'
    ]
    list_filter = ['status', 'order_date', 'supplier']
    search_fields = ['po_number', 'supplier__name']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [PurchaseOrderItemInline]
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('supplier', 'created_by')

@admin.register(StockAlert)
class StockAlertAdmin(admin.ModelAdmin):
    list_display = [
        'stock_level', 'alert_type', 'priority_display', 'message_preview',
        'is_resolved', 'created_at'
    ]
    list_filter = ['alert_type', 'priority', 'is_resolved', 'created_at']
    search_fields = ['stock_level__product__name', 'message']
    readonly_fields = ['created_at', 'resolved_at']
    actions = ['mark_resolved']
    
    def priority_display(self, obj):
        colors = {
            'low': 'green',
            'medium': 'orange', 
            'high': 'red',
            'critical': 'darkred'
        }
        color = colors.get(obj.priority, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_priority_display()
        )
    priority_display.short_description = 'Priority'
    
    def message_preview(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
    message_preview.short_description = 'Message'
    
    def mark_resolved(self, request, queryset):
        for alert in queryset:
            alert.resolve(user=request.user)
        self.message_user(request, f'{queryset.count()} alerts marked as resolved.')
    mark_resolved.short_description = 'Mark selected alerts as resolved'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'stock_level__product', 'resolved_by'
        )
