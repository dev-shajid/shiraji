import xmlrpc.client
import logging
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)

class OdooXMLRPCService:
    def __init__(self):
        self.url = settings.ODOO_URL
        self.db = settings.ODOO_DB
        self.username = settings.ODOO_USERNAME
        self.password = settings.ODOO_PASSWORD
        self.uid = None
        self.models = None
        
    def authenticate(self):
        """Authenticate with Odoo and get user ID"""
        try:
            common = xmlrpc.client.ServerProxy(f'{self.url}/xmlrpc/2/common')
            self.uid = common.authenticate(self.db, self.username, self.password, {})
            
            if self.uid:
                self.models = xmlrpc.client.ServerProxy(f'{self.url}/xmlrpc/2/object')
                logger.info(f"Successfully authenticated with Odoo. User ID: {self.uid}")
                return True
            else:
                logger.error("Failed to authenticate with Odoo")
                return False
                
        except Exception as e:
            logger.error(f"Odoo authentication error: {str(e)}")
            return False
    
    def create_supplier(self, vendor_data):
        """Create a supplier in Odoo using XML-RPC"""
        try:
            if not self.authenticate():
                return False, "Authentication failed"
            
            # Prepare supplier data for Odoo
            supplier_vals = {
                'name': vendor_data['name'],
                'email': vendor_data['email'],
                'phone': vendor_data['phone'],
                'supplier_rank': 1,  # Mark as supplier
                'customer_rank': 0,  # Not a customer
                'is_company': vendor_data['business_type'] != 'individual',
                'category_id': [(6, 0, [])],  # Empty categories for now
            }
            
            # Add optional fields
            if vendor_data.get('address'):
                supplier_vals['street'] = vendor_data['address']
            
            if vendor_data.get('tax_id'):
                supplier_vals['vat'] = vendor_data['tax_id']
            
            if vendor_data.get('website'):
                supplier_vals['website'] = vendor_data['website']
            
            if vendor_data.get('description'):
                supplier_vals['comment'] = vendor_data['description']
            
            # Map business type to Odoo company type
            company_type_mapping = {
                'individual': 'person',
                'company': 'company',
                'partnership': 'company',
                'llc': 'company'
            }
            supplier_vals['company_type'] = company_type_mapping.get(
                vendor_data['business_type'], 'company'
            )
            
            # Create the supplier in Odoo
            supplier_id = self.models.execute_kw(
                self.db, self.uid, self.password,
                'res.partner', 'create',
                [supplier_vals]
            )
            
            if supplier_id:
                logger.info(f"Supplier created successfully in Odoo with ID: {supplier_id}")
                
                # Send admin notification email
                self.send_admin_notification(vendor_data, supplier_id)
                
                return True, f"Supplier registered successfully (Odoo ID: {supplier_id})"
            else:
                return False, "Failed to create supplier in Odoo"
                
        except xmlrpc.client.Fault as e:
            logger.error(f"Odoo XML-RPC Fault: {str(e)}")
            return False, f"Odoo error: {str(e)}"
        except Exception as e:
            logger.error(f"Unexpected error creating supplier: {str(e)}")
            return False, "An unexpected error occurred. Please try again."
    
    def send_admin_notification(self, vendor_data, supplier_id):
        """Send email notification to admin about new supplier registration"""
        try:
            subject = f"New Supplier Registration: {vendor_data['name']}"
            
            context = {
                'vendor_name': vendor_data['name'],
                'vendor_email': vendor_data['email'],
                'vendor_phone': vendor_data['phone'],
                'business_type': vendor_data['business_type'],
                'supplier_id': supplier_id,
                'odoo_url': settings.ODOO_URL
            }
            
            message = f"""
            New Supplier Registration
            
            Supplier Details:
            - Name: {vendor_data['name']}
            - Email: {vendor_data['email']}
            - Phone: {vendor_data['phone']}
            - Business Type: {vendor_data['business_type']}
            - Odoo ID: {supplier_id}
            
            View in Odoo: {settings.ODOO_URL}/web#id={supplier_id}&model=res.partner
            """
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.ADMIN_EMAIL],
                fail_silently=False,
            )
            
            logger.info(f"Admin notification sent for supplier {supplier_id}")
            
        except Exception as e:
            logger.error(f"Failed to send admin notification: {str(e)}")

# Create a global instance
odoo_service = OdooXMLRPCService()