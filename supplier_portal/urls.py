from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('register/', views.supplier_register, name='supplier_register'),
    path('login/', auth_views.LoginView.as_view(template_name='supplier_portal/login.html'), name='supplier_login'),
    path('logout/', auth_views.LogoutView.as_view(), name='supplier_logout'),
    path('dashboard/', views.supplier_dashboard, name='supplier_dashboard'),
    path('upload-document/', views.upload_document, name='upload_document'),
]