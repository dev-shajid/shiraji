from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from .models import SupplierProfile, SupplierDocument

class SupplierRegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    company_name = forms.CharField(max_length=200)
    tax_id = forms.CharField(max_length=50)
    business_type = forms.CharField(max_length=100)
    phone = forms.CharField(max_length=20)
    address = forms.CharField(widget=forms.Textarea)
    website = forms.URLField(required=False)
    description = forms.CharField(widget=forms.Textarea, required=False)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        if commit:
            user.save()
            SupplierProfile.objects.create(
                user=user,
                company_name=self.cleaned_data['company_name'],
                tax_id=self.cleaned_data['tax_id'],
                business_type=self.cleaned_data['business_type'],
                phone=self.cleaned_data['phone'],
                address=self.cleaned_data['address'],
                website=self.cleaned_data['website'],
                description=self.cleaned_data['description'],
            )
        return user

class SupplierDocumentForm(forms.ModelForm):
    class Meta:
        model = SupplierDocument
        fields = ['document_type', 'title', 'file']
        widgets = {
            'document_type': forms.Select(attrs={'class': 'form-control'}),
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'file': forms.FileInput(attrs={'class': 'form-control'}),
        }