from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.SerializerMethodField()
    sender_name = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'sender_email', 'sender_name', 'content', 'file_url', 'timestamp']

    def get_sender_email(self, obj):
        return obj.sender.email

    def get_sender_name(self, obj):
        if hasattr(obj.sender, 'clientprofile'):
            return obj.sender.clientprofile.full_name
        elif hasattr(obj.sender, 'lawyerprofile'):
            return obj.sender.lawyerprofile.full_name
        return obj.sender.email

    def get_file_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.file.url) if obj.file else None

from .models import MeetingSchedule

class MeetingScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeetingSchedule
        fields = ['scheduled_time', 'created_by']
