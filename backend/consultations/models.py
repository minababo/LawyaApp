from django.db import models
from users.models import User

class ConsultationRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]

    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='consultation_requests')
    lawyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_requests')
    title = models.CharField(max_length=255)
    case_type = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    requested_time = models.DateTimeField()
    accepted_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.status})"

class ConsultationPoint(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='consultation_points')
    balance = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.email} - {self.balance} CP"