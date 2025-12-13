from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('about/', views.about, name='about'),
    path('services/', views.services, name='services'),
    path('projects/', views.projects, name='projects'),
    path('careers/', views.careers, name='careers'),
    path('contact/', views.contact, name='contact'),
    path('vendor-registration/', views.vendor_registration, name='vendor_registration'),
]