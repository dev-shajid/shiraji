import requests
import logging
from django.shortcuts import render, redirect
from django.contrib import messages
from django.conf import settings
from django.views.decorators.csrf import csrf_protect
from django.http import JsonResponse
from .forms import VendorRegistrationForm, ContactForm, QuoteRequestForm
from .models import Service, Project, Testimonial, Job
from .odoo_service import odoo_service

# Set up logging
logger = logging.getLogger(__name__)

def index(request):
    services = Service.objects.all().order_by('order')[:3]  # Get top 3 services
    featured_projects = Project.objects.filter(featured=True)[:4]  # Get featured projects
    testimonials = Testimonial.objects.all()[:3]  # Get top 3 testimonials
    
    # Handle quote request form
    if request.method == 'POST':
        form = QuoteRequestForm(request.POST)
        if form.is_valid():
            # Process the form data (you could save it to a model or send an email)
            messages.success(request, 'Your quote request has been submitted. We will contact you soon!')
            return redirect('index')
    else:
        form = QuoteRequestForm()
    
    context = {
        'services': services,
        'featured_projects': featured_projects,
        'testimonials': testimonials,
        'form': form,
    }
    return render(request, 'core/index.html', context)

def about(request):
    context = {
        # Add any context variables needed for the about page
    }
    return render(request, 'core/about.html', context)

def services(request):
    services_list = Service.objects.all().order_by('order')
    return render(request, 'core/services.html', {'services': services_list})

def projects(request):
    category = request.GET.get('category', None)
    if category:
        projects_list = Project.objects.filter(category=category)
    else:
        projects_list = Project.objects.all()
    
    context = {
        'projects': projects_list,
        'current_category': category,
    }
    return render(request, 'core/projects.html', context)

def contact(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            form.save()  # Save the form data to the ContactSubmission model
            messages.success(request, 'Your message has been sent. We will contact you soon!')
            return redirect('contact')
    else:
        form = ContactForm()
    
    return render(request, 'core/contact.html', {'form': form})

@csrf_protect
def vendor_registration(request):
    if request.method == 'POST':
        form = VendorRegistrationForm(request.POST)
        if form.is_valid():
            # Extract form data
            vendor_data = {
                'name': form.cleaned_data['name'],
                'email': form.cleaned_data['email'],
                'phone': form.cleaned_data['phone'],
                'address': form.cleaned_data.get('address', ''),
                'tax_id': form.cleaned_data.get('tax_id', ''),
                'business_type': form.cleaned_data['business_type'],
                'website': form.cleaned_data.get('website', ''),
                'description': form.cleaned_data.get('description', '')
            }
            
            # Send data to Odoo using XML-RPC
            success, message = odoo_service.create_supplier(vendor_data)
            
            if success:
                logger.info(f"Vendor registration successful for {vendor_data['email']}")
                messages.success(
                    request, 
                    'Vendor registration submitted successfully! Your supplier account has been created in our system. '
                    'Our team will review your application and contact you soon.'
                )
                return redirect('vendor_registration')
            else:
                logger.error(f"Vendor registration failed for {vendor_data['email']}: {message}")
                messages.error(
                    request, 
                    f'Registration failed: {message}. Please try again or contact our support team at info@shiraji.ae'
                )
    else:
        form = VendorRegistrationForm()
    
    return render(request, 'core/vendor_registration.html', {'form': form})

# Remove the old create_vendor_in_odoo function as it's replaced by the XML-RPC service

def careers(request):
    # Simple version without complex processing
    job_openings = Job.objects.filter(is_active=True).order_by('-created_at')
    return render(request, 'core/careers.html', {'job_openings': job_openings})
