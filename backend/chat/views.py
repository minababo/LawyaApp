from rest_framework import generics, permissions, status
from users.models import User
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Message
from .serializers import MessageSerializer
from consultations.models import ConsultationRequest
from rest_framework.permissions import IsAuthenticated
from .models import MeetingSchedule
from .serializers import MeetingScheduleSerializer
from rest_framework.decorators import api_view, permission_classes

class MessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        consultation_id = self.kwargs['consultation_id']
        return Message.objects.filter(consultation_id=consultation_id).order_by('timestamp')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

class MessageSendView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, consultation_id):
        content = request.data.get('content', '').strip()
        file = request.FILES.get('file')

        if not content and not file:
            return Response({'error': 'Message must contain text or a file.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            consultation = ConsultationRequest.objects.get(id=consultation_id)
        except ConsultationRequest.DoesNotExist:
            return Response({'error': 'Consultation not found'}, status=status.HTTP_404_NOT_FOUND)

        message = Message.objects.create(
            consultation=consultation,
            sender=request.user,
            content=content,
            file=file
        )

        serializer = MessageSerializer(message, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
class ChatPartnerNameView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, consultation_id):
        try:
            consultation = ConsultationRequest.objects.get(id=consultation_id)
            user = request.user
            if user == consultation.client:
                other = consultation.lawyer
                name = other.lawyerprofile.full_name if hasattr(other, 'lawyerprofile') else other.email
            elif user == consultation.lawyer:
                other = consultation.client
                name = other.clientprofile.full_name if hasattr(other, 'clientprofile') else other.email
            else:
                return Response({'error': 'Not authorized for this consultation'}, status=status.HTTP_403_FORBIDDEN)

            return Response({'name': name})

        except ConsultationRequest.DoesNotExist:
            return Response({'error': 'Consultation not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_partner(request, consultation_id):
    try:
        consultation = ConsultationRequest.objects.get(id=consultation_id)
    except ConsultationRequest.DoesNotExist:
        return Response({"error": "Consultation not found"}, status=404)

    user = request.user
    if user == consultation.client:
        try:
            return Response({"name": consultation.lawyer.lawyerprofile.full_name})
        except:
            return Response({"name": consultation.lawyer.email})
    elif user == consultation.lawyer:
        try:
            return Response({"name": consultation.client.clientprofile.full_name})
        except:
            return Response({"name": consultation.client.email})
    else:
        return Response({"error": "You are not part of this consultation"}, status=403)
    
class ScheduleMeetingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, consultation_id):
        datetime = request.data.get('meeting_time')
        if not datetime:
            return Response({'error': 'No meeting_time provided'}, status=400)
        
        try:
            consultation = ConsultationRequest.objects.get(id=consultation_id)
            consultation.scheduled_time = datetime
            consultation.save()
            return Response({'message': 'Meeting time scheduled'}, status=200)
        except ConsultationRequest.DoesNotExist:
            return Response({'error': 'Consultation not found'}, status=404)