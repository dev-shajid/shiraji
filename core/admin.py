from django.contrib import admin
from .models import Service, Project, ContactSubmission, Testimonial, Job

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'order')
    list_editable = ('order',)

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'completed_date', 'featured')
    list_filter = ('category', 'featured')
    list_editable = ('featured',)

@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'created_at')
    readonly_fields = ('created_at',)

@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('name', 'company')

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'department', 'location', 'job_type', 'is_active', 'created_at')
    list_filter = ('department', 'job_type', 'is_active', 'location')
    list_editable = ('is_active',)
    search_fields = ('title', 'department', 'description')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Job Information', {
            'fields': ('title', 'department', 'location', 'job_type', 'is_active')
        }),
        ('Job Details', {
            'fields': ('description', 'requirements')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
