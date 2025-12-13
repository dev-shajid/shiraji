from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login
from django.contrib import messages
from .models import SupplierProfile, SupplierDocument
from .forms import SupplierRegistrationForm, SupplierDocumentForm

def supplier_register(request):
    if request.method == 'POST':
        form = SupplierRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Registration successful! Welcome to the supplier portal.')
            return redirect('supplier_dashboard')
    else:
        form = SupplierRegistrationForm()
    
    return render(request, 'supplier_portal/register.html', {'form': form})

@login_required
def supplier_dashboard(request):
    try:
        supplier = request.user.supplierprofile
    except SupplierProfile.DoesNotExist:
        messages.error(request, 'Supplier profile not found. Please contact support.')
        return redirect('index')  # Changed from 'home' to 'index'
    
    documents = supplier.documents.all()
    context = {
        'supplier': supplier,
        'documents': documents,
    }
    return render(request, 'supplier_portal/dashboard.html', context)

@login_required
def upload_document(request):
    try:
        supplier = request.user.supplierprofile
    except SupplierProfile.DoesNotExist:
        messages.error(request, 'Supplier profile not found.')
        return redirect('index')  # Changed from 'home' to 'index'
    
    if request.method == 'POST':
        form = SupplierDocumentForm(request.POST, request.FILES)
        if form.is_valid():
            document = form.save(commit=False)
            document.supplier = supplier
            document.save()
            messages.success(request, 'Document uploaded successfully!')
            return redirect('supplier_dashboard')
    else:
        form = SupplierDocumentForm()
    
    return render(request, 'supplier_portal/upload_document.html', {'form': form})
