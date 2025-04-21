from django.urls import path
from .views import (
    ConsultationRequestCreateView,
    LawyerConsultationListView,
    ClientConsultationListView,
    ConsultationPointView,
    ConsultationUpdateView,
    ConsultationDetailView,
    NotificationListView,
)

urlpatterns = [
    path('create/', ConsultationRequestCreateView.as_view(), name='create-consultation'),
    path('lawyer/', LawyerConsultationListView.as_view(), name='lawyer-consultations'),
    path('client/', ClientConsultationListView.as_view(), name='client-consultations'),
    path('points/', ConsultationPointView.as_view(), name='consultation-points'),
    path('update/<int:pk>/', ConsultationUpdateView.as_view(), name='update-consultation'),
    path('details/<int:pk>/', ConsultationDetailView.as_view(), name='consultation-detail'),
    path('notifications/', NotificationListView.as_view()),
]
