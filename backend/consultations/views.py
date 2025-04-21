from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import UpdateAPIView, RetrieveAPIView
from rest_framework.exceptions import ValidationError
from users.models import Notification
from .serializers import NotificationSerializer
from rest_framework.generics import ListAPIView
from .models import ConsultationRequest, ConsultationPoint
from .serializers import ConsultationRequestSerializer, ConsultationPointSerializer
from users.models import LawyerProfile
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model

User = get_user_model()

class ConsultationRequestCreateView(generics.CreateAPIView):
    serializer_class = ConsultationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        client_user = self.request.user
        lawyer_id = self.request.data.get('lawyer')

        try:
            lawyer_profile = LawyerProfile.objects.get(id=lawyer_id)
            lawyer_user = lawyer_profile.user
        except LawyerProfile.DoesNotExist:
            raise serializers.ValidationError({"lawyer": "Invalid lawyer ID"})

        cp, _ = ConsultationPoint.objects.get_or_create(user=client_user)
        if cp.balance < 1:
            raise ValidationError({"cp": "Not enough Consultation Points to book"})
        
        cp.balance -= 1
        cp.save()

        serializer.save(client=client_user, lawyer=lawyer_user)

class LawyerConsultationListView(generics.ListAPIView):
    serializer_class = ConsultationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ConsultationRequest.objects.filter(lawyer=self.request.user).select_related('client')

class ClientConsultationListView(generics.ListAPIView):
    serializer_class = ConsultationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ConsultationRequest.objects.filter(client=self.request.user)

class ConsultationPointView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cp, _ = ConsultationPoint.objects.get_or_create(user=request.user)
        serializer = ConsultationPointSerializer(cp)
        return Response(serializer.data)

    def post(self, request):
        cp, _ = ConsultationPoint.objects.get_or_create(user=request.user)
        cp.balance += 10
        cp.save()
        return Response({'message': 'CP added', 'balance': cp.balance})

class ConsultationUpdateView(UpdateAPIView):
    queryset = ConsultationRequest.objects.all()
    serializer_class = ConsultationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        new_status = request.data.get('status')

        if new_status == 'rejected' and instance.status != 'rejected':
            # Refund CP to the client
            cp, _ = ConsultationPoint.objects.get_or_create(user=instance.client)
            cp.balance += 1
            cp.save()

        return super().patch(request, *args, **kwargs)

class ConsultationDetailView(RetrieveAPIView):
    queryset = ConsultationRequest.objects.all()
    serializer_class = ConsultationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

# class NotificationListView(ListAPIView):
#     serializer_class = NotificationSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def get_queryset(self):
#         return Notification.objects.filter(user=self.request.user).order_by('-created_at')
    
class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user).order_by('-timestamp')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)