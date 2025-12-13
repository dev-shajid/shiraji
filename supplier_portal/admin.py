from django.contrib import admin
from .models import SupplierProfile, SupplierDocument

@admin.register(SupplierProfile)
class SupplierProfileAdmin(admin.ModelAdmin):
    list_display = ['company_name', 'user', 'status', 'created_at']
    list_filter = ['status', 'business_type', 'created_at']
    search_fields = ['company_name', 'user__email', 'tax_id']
    actions = ['approve_suppliers', 'reject_suppliers']
    
    def approve_suppliers(self, request, queryset):
        queryset.update(status='approved')
        self.message_user(request, f'{queryset.count()} suppliers approved.')
    approve_suppliers.short_description = 'Approve selected suppliers'
    
    def reject_suppliers(self, request, queryset):
        queryset.update(status='rejected')
        self.message_user(request, f'{queryset.count()} suppliers rejected.')
    reject_suppliers.short_description = 'Reject selected suppliers'

@admin.register(SupplierDocument)
class SupplierDocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'supplier', 'document_type', 'uploaded_at', 'is_verified']
    list_filter = ['document_type', 'is_verified', 'uploaded_at']
    search_fields = ['title', 'supplier__company_name']
