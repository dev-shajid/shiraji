#!/usr/bin/env python
"""Test script to verify Odoo XML-RPC connection"""

import os
import sys
import django
from pathlib import Path

# Add the project directory to Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'construction_site.settings')
django.setup()

from core.odoo_service import odoo_service

def test_odoo_connection():
    """Test the Odoo XML-RPC connection"""
    print("Testing Odoo XML-RPC connection...")
    
    # Test authentication
    if odoo_service.authenticate():
        print("✅ Authentication successful!")
        
        # Test creating a sample supplier
        test_vendor_data = {
            'name': 'Test Supplier Company',
            'email': 'test@example.com',
            'phone': '+971501234567',
            'business_type': 'company',
            'address': 'Test Address, Abu Dhabi, UAE',
            'description': 'Test supplier for integration testing'
        }
        
        success, message = odoo_service.create_supplier(test_vendor_data)
        
        if success:
            print(f"✅ Test supplier created: {message}")
        else:
            print(f"❌ Failed to create test supplier: {message}")
    else:
        print("❌ Authentication failed!")
        print("Please check your Odoo credentials in the .env file")

if __name__ == '__main__':
    test_odoo_connection()