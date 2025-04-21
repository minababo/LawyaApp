def profile_picture_path(instance, filename):
    return f"profile_pics/{instance.user.id}/{filename}"

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        extra_fields.setdefault('username', email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('username', email)

        if not extra_fields.get('is_staff'):
            raise ValueError('Superuser must have is_staff=True.')
        if not extra_fields.get('is_superuser'):
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('client', 'Client'),
        ('lawyer', 'Lawyer'),
        ('admin', 'Admin'),
    )

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email

class ClientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20)
    nic_number = models.CharField(max_length=20)
    profile_picture = models.ImageField(upload_to=profile_picture_path, blank=True, null=True)

    def __str__(self):
        return self.full_name

EXPERTISE_CHOICES = [
    ('criminal', 'Criminal Law'),
    ('civil', 'Civil Law'),
    ('family', 'Family Law'),
    ('property', 'Property Law'),
    ('corporate', 'Corporate Law'),
]

class LawyerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20)
    nic_number = models.CharField(max_length=20)
    qualifications = models.FileField(upload_to='qualifications/', null=True, blank=True)
    expertise = models.CharField(max_length=100, choices=EXPERTISE_CHOICES)
    location = models.CharField(max_length=100)
    approved = models.BooleanField(default=False)
    profile_picture = models.ImageField(upload_to=profile_picture_path, blank=True, null=True)

    def __str__(self):
        return self.full_name
    
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    status = models.CharField(max_length=20, choices=[('info', 'Info'), ('success', 'Success'), ('danger', 'Danger')])
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.status}] {self.message}"
