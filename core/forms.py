from django import forms
from django.core.validators import EmailValidator, RegexValidator
from .models import ContactSubmission

class ContactForm(forms.ModelForm):
    class Meta:
        model = ContactSubmission
        fields = ['name', 'email', 'phone', 'message']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Your Name'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Your Email'}),
            'phone': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Your Phone Number'}),
            'message': forms.Textarea(attrs={'class': 'form-control', 'placeholder': 'Your Message', 'rows': 5}),
        }

class QuoteRequestForm(forms.Form):
    name = forms.CharField(max_length=100, widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Your Name'}))
    email = forms.EmailField(widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Your Email'}))
    phone = forms.CharField(max_length=20, widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Your Phone Number'}))
    project_type = forms.ChoiceField(choices=[
        ('', 'Select Project Type'),
        ('commercial', 'Commercial'),
        ('residential', 'Residential'),
        ('industrial', 'Industrial'),
        ('other', 'Other'),
    ], widget=forms.Select(attrs={'class': 'form-control'}))
    details = forms.CharField(widget=forms.Textarea(attrs={'class': 'form-control', 'placeholder': 'Project Details', 'rows': 5}))


class VendorRegistrationForm(forms.Form):
    name = forms.CharField(
        max_length=200,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Company Name or Full Name',
            'required': True
        }),
        label='Vendor Name'
    )
    
    email = forms.EmailField(
        validators=[EmailValidator()],
        widget=forms.EmailInput(attrs={
            'class': 'form-control',
            'placeholder': 'vendor@company.com',
            'required': True
        }),
        label='Email Address'
    )
    
    phone = forms.CharField(
        max_length=20,
        validators=[RegexValidator(
            regex=r'^\+?[1-9]\d{1,14}$',
            message='Enter a valid phone number (e.g., +971501234567)'
        )],
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': '+971501234567',
            'required': True
        }),
        label='Phone Number'
    )
    
    address = forms.CharField(
        max_length=500,
        required=False,
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'placeholder': 'Complete Address (Optional)',
            'rows': 3
        }),
        label='Address'
    )
    
    tax_id = forms.CharField(
        max_length=50,
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Tax Registration Number (Optional)'
        }),
        label='Tax ID'
    )
    
    BUSINESS_TYPES = [
        ('company', 'Company'),
        ('individual', 'Individual'),
        ('partnership', 'Partnership'),
        ('llc', 'LLC'),
    ]
    
    business_type = forms.ChoiceField(
        choices=BUSINESS_TYPES,
        widget=forms.Select(attrs={
            'class': 'form-control'
        }),
        label='Business Type'
    )
    
    website = forms.URLField(
        required=False,
        widget=forms.URLInput(attrs={
            'class': 'form-control',
            'placeholder': 'https://www.company.com (Optional)'
        }),
        label='Website'
    )
    
    description = forms.CharField(
        max_length=1000,
        required=False,
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'placeholder': 'Brief description of your services/products (Optional)',
            'rows': 4
        }),
        label='Business Description'
    )
    
    terms_accepted = forms.BooleanField(
        required=True,
        widget=forms.CheckboxInput(attrs={
            'class': 'form-check-input'
        }),
        label='I agree to the Terms and Conditions'
    )