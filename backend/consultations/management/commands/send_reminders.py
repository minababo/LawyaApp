from django.core.management.base import BaseCommand
from django.utils.timezone import now, localtime
from datetime import timedelta
from consultations.models import ConsultationRequest
from chat.models import MeetingSchedule
from users.models import Notification

class Command(BaseCommand):
    help = 'Send 30-minute meeting reminders to clients and lawyers'

    def handle(self, *args, **kwargs):
        current_time = localtime(now())
        window_start = current_time + timedelta(minutes=10)
        window_end = current_time + timedelta(minutes=50)

        self.stdout.write(f"🔍 Now: {current_time}")
        self.stdout.write(f"🕓 Checking for meetings between {window_start} and {window_end}")

        upcoming = MeetingSchedule.objects.select_related('consultation').filter(
            scheduled_time__gte=window_start,
            scheduled_time__lt=window_end,
            consultation__status='accepted',
            reminder_sent=False
        )

        self.stdout.write(f"📅 Found {upcoming.count()} upcoming meeting(s)")

        for meeting in upcoming:
            consultation = meeting.consultation
            scheduled = localtime(meeting.scheduled_time)
            formatted = scheduled.strftime('%I:%M %p')

            self.stdout.write(f"🔔 Sending reminders for meeting at {formatted}")

            Notification.objects.create(
                user=consultation.client,
                message=f"Reminder: Your consultation with {consultation.lawyer.lawyerprofile.full_name} is at {formatted}.",
                status='info'
            )

            Notification.objects.create(
                user=consultation.lawyer,
                message=f"Reminder: You have a consultation with {consultation.client.clientprofile.full_name} at {formatted}.",
                status='info'
            )

            meeting.reminder_sent = True
            meeting.save()

        self.stdout.write(self.style.SUCCESS('✅ Meeting reminders sent'))