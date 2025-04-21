from rest_framework import serializers
from .models import ConsultationRequest, ConsultationPoint
from users.models import ClientProfile
from users.models import Notification

class ConsultationRequestSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    client_email = serializers.SerializerMethodField()
    lawyer_name = serializers.SerializerMethodField()

    class Meta:
        model = ConsultationRequest
        exclude = ['client', 'accepted_time', 'created_at', 'updated_at']

    def get_client_name(self, obj):
       if hasattr(obj.client, 'clientprofile'):
        return obj.client.clientprofile.full_name
        return ''

    def get_client_email(self, obj):
        return obj.client.email
    
    def get_lawyer_name(self, obj):
        if hasattr(obj.lawyer, 'lawyerprofile'):
            return obj.lawyer.lawyerprofile.full_name
        return obj.lawyer.email

class ConsultationPointSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = ConsultationPoint
        fields = ['id', 'email', 'balance']
        
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
