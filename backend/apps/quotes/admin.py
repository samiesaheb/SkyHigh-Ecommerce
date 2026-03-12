from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import QuoteRequest, QuoteFollowUp, SampleRequest


class QuoteFollowUpInline(admin.TabularInline):
    model = QuoteFollowUp
    extra = 1
    fields = ['follow_up_type', 'notes', 'next_follow_up', 'user']
    readonly_fields = ['user']

    def save_model(self, request, obj, form, change):
        if not obj.user_id:
            obj.user = request.user
        super().save_model(request, obj, form, change)


@admin.register(QuoteRequest)
class QuoteRequestAdmin(admin.ModelAdmin):
    list_display = [
        'company_name',
        'contact_name',
        'product_type',
        'volume_range',
        'status_badge',
        'priority_badge',
        'created_at',
        'is_new_badge',
        'response_time_display'
    ]
    list_filter = [
        'status',
        'priority',
        'product_type',
        'created_at',
        'has_formulation'
    ]
    search_fields = [
        'company_name',
        'contact_name',
        'email',
        'phone',
        'country',
        'product_type'
    ]
    readonly_fields = [
        'created_at',
        'updated_at',
        'ip_address',
        'user_agent',
        'referrer',
        'is_new',
        'response_time'
    ]

    fieldsets = (
        ('Company Information', {
            'fields': ('company_name', 'contact_name', 'email', 'phone', 'country')
        }),
        ('Project Details', {
            'fields': (
                'product_type',
                'custom_product_type',
                'volume_range',
                'timeline',
                'has_formulation',
                'branding_requirements',
                'additional_info',
                'hear_about_us'
            )
        }),
        ('Management', {
            'fields': (
                'status',
                'priority',
                'assigned_to',
                'internal_notes',
                'contacted_at',
                'quote_sent_at'
            )
        }),
        ('Tracking & Metadata', {
            'fields': (
                'created_at',
                'updated_at',
                'ip_address',
                'user_agent',
                'referrer',
                'is_new',
                'response_time'
            ),
            'classes': ('collapse',)
        }),
    )

    inlines = [QuoteFollowUpInline]

    actions = ['mark_as_reviewing', 'mark_as_quoted', 'mark_as_high_priority']

    def status_badge(self, obj):
        colors = {
            'new': 'blue',
            'reviewing': 'orange',
            'quoted': 'purple',
            'negotiating': 'yellow',
            'converted': 'green',
            'declined': 'red'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def priority_badge(self, obj):
        colors = {
            'low': '#e0e0e0',
            'medium': '#fff3cd',
            'high': '#ffccbc',
            'urgent': '#ffcdd2'
        }
        color = colors.get(obj.priority, '#e0e0e0')
        return format_html(
            '<span style="background-color: {}; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_priority_display()
        )
    priority_badge.short_description = 'Priority'

    def is_new_badge(self, obj):
        if obj.is_new:
            return format_html('<span style="color: green;">✓ New</span>')
        return '-'
    is_new_badge.short_description = 'New'

    def response_time_display(self, obj):
        if obj.response_time:
            return f"{obj.response_time} hours"
        return "Not contacted"
    response_time_display.short_description = 'Response Time'

    def mark_as_reviewing(self, request, queryset):
        queryset.update(status='reviewing')
    mark_as_reviewing.short_description = "Mark as Under Review"

    def mark_as_quoted(self, request, queryset):
        queryset.update(status='quoted', quote_sent_at=timezone.now())
    mark_as_quoted.short_description = "Mark as Quote Sent"

    def mark_as_high_priority(self, request, queryset):
        queryset.update(priority='high')
    mark_as_high_priority.short_description = "Mark as High Priority"


@admin.register(QuoteFollowUp)
class QuoteFollowUpAdmin(admin.ModelAdmin):
    list_display = [
        'quote',
        'follow_up_type',
        'user',
        'created_at',
        'next_follow_up'
    ]
    list_filter = [
        'follow_up_type',
        'created_at'
    ]
    search_fields = [
        'quote__company_name',
        'quote__contact_name',
        'notes'
    ]
    readonly_fields = ['created_at']

    def save_model(self, request, obj, form, change):
        if not obj.user_id:
            obj.user = request.user
        super().save_model(request, obj, form, change)


@admin.register(SampleRequest)
class SampleRequestAdmin(admin.ModelAdmin):
    list_display = [
        'company_name',
        'contact_name',
        'product_categories',
        'status_badge',
        'created_at',
        'is_new_badge',
        'tracking_number'
    ]
    list_filter = [
        'status',
        'intended_use',
        'created_at',
    ]
    search_fields = [
        'company_name',
        'contact_name',
        'email',
        'phone',
        'country',
        'product_categories'
    ]
    readonly_fields = [
        'created_at',
        'updated_at',
        'ip_address',
        'user_agent',
        'referrer',
        'is_new'
    ]

    fieldsets = (
        ('Company Information', {
            'fields': ('company_name', 'contact_name', 'email', 'phone', 'country', 'shipping_address')
        }),
        ('Sample Request Details', {
            'fields': (
                'product_categories',
                'specific_products',
                'intended_use',
                'business_type',
                'additional_info'
            )
        }),
        ('Management', {
            'fields': (
                'status',
                'assigned_to',
                'internal_notes',
                'tracking_number',
                'approved_at',
                'shipped_at'
            )
        }),
        ('Tracking & Metadata', {
            'fields': (
                'created_at',
                'updated_at',
                'ip_address',
                'user_agent',
                'referrer',
                'is_new'
            ),
            'classes': ('collapse',)
        }),
    )

    actions = ['mark_as_approved', 'mark_as_shipped']

    def status_badge(self, obj):
        colors = {
            'new': 'blue',
            'approved': 'green',
            'preparing': 'orange',
            'shipped': 'purple',
            'delivered': 'darkgreen',
            'declined': 'red'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def is_new_badge(self, obj):
        if obj.is_new:
            return format_html('<span style="color: green;">✓ New</span>')
        return '-'
    is_new_badge.short_description = 'New'

    def mark_as_approved(self, request, queryset):
        for sample in queryset:
            sample.mark_as_approved()
    mark_as_approved.short_description = "Mark as Approved"

    def mark_as_shipped(self, request, queryset):
        for sample in queryset:
            sample.mark_as_shipped()
    mark_as_shipped.short_description = "Mark as Shipped"
