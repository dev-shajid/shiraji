from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class SupplierProfile(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('suspended', 'Suspended'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=200)
    tax_id = models.CharField(max_length=50)
    business_type = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    website = models.URLField(blank=True)
    description = models.TextField(blank=True)
    
    # Simple status field
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def approve(self):
        self.status = 'approved'
        self.save()
    
    def reject(self):
        self.status = 'rejected'
        self.save()
    
    def __str__(self):
        return f"{self.company_name} - {self.user.email}"

class SupplierDocument(models.Model):
    DOCUMENT_TYPES = [
        ('certificate', 'Certificate'),
        ('license', 'License'),
        ('insurance', 'Insurance'),
        ('tax_document', 'Tax Document'),
        ('other', 'Other'),
    ]
    
    supplier = models.ForeignKey(SupplierProfile, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='supplier_documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.supplier.company_name} - {self.title}"
