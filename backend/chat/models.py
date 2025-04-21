from django.db import models
from django.utils import timezone
from users.models import User
from consultations.models import ConsultationRequest

class Message(models.Model):
    consultation = models.ForeignKey(ConsultationRequest, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField(blank=True)
    file = models.FileField(upload_to='chat_files/', blank=True, null=True)
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"From {self.sender.email} at {self.timestamp}"
    
class MeetingSchedule(models.Model):
    consultation = models.OneToOneField(ConsultationRequest, on_delete=models.CASCADE, related_name='schedule')
    scheduled_time = models.DateTimeField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scheduled_meetings')
    created_at = models.DateTimeField(auto_now_add=True)
    reminder_sent = models.BooleanField(default=False)

    def __str__(self):
        return f"Meeting for {self.consultation.id} at {self.scheduled_time}"
