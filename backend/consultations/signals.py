from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ConsultationRequest
from users.models import Notification

@receiver(post_save, sender=ConsultationRequest)
def create_consultation_notification(sender, instance, created, **kwargs):
    print("🚨 SIGNAL TRIGGERED:", instance.status)

    if not created:
        if instance.status == 'accepted':
            Notification.objects.create(
                user=instance.client,
                message=f"Your consultation with {instance.lawyer.lawyerprofile.full_name} was accepted.",
                status='success'
            )
        elif instance.status == 'rejected':
            Notification.objects.create(
                user=instance.client,
                message=f"Your consultation with {instance.lawyer.lawyerprofile.full_name} was rejected.",
                status='danger'
            )
