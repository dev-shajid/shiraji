from django.db import models

class Service(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.ImageField(upload_to='services/', blank=True, null=True)
    order = models.IntegerField(default=0)
    
    def __str__(self):
        return self.title

class Project(models.Model):
    CATEGORY_CHOICES = (
        ('commercial', 'Commercial'),
        ('residential', 'Residential'),
        ('industrial', 'Industrial'),
        ('other', 'Other'),
    )
    
    title = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    image = models.ImageField(upload_to='projects/')
    completed_date = models.DateField()
    featured = models.BooleanField(default=False)
    
    def __str__(self):
        return self.title

class ContactSubmission(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.created_at.strftime('%Y-%m-%d')}"

class Testimonial(models.Model):
    name = models.CharField(max_length=100)
    position = models.CharField(max_length=100, blank=True)
    company = models.CharField(max_length=100, blank=True)
    quote = models.TextField()
    image = models.ImageField(upload_to='testimonials/', blank=True, null=True)
    
    def __str__(self):
        return self.name

class Job(models.Model):
    JOB_TYPE_CHOICES = (
        ('full-time', 'Full-time'),
        ('part-time', 'Part-time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
    )
    
    title = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    location = models.CharField(max_length=100, default='Abu Dhabi, UAE')
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='full-time')
    description = models.TextField()
    requirements = models.TextField(help_text='Enter each requirement on a new line')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.department}"
    
    def get_requirements_list(self):
        """Convert requirements text to list for template"""
        return [req.strip() for req in self.requirements.split('\n') if req.strip()]
