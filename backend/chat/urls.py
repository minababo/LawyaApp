from django.urls import path
from .views import MessageListView, MessageSendView, get_chat_partner, ScheduleMeetingView, ChatPartnerNameView

urlpatterns = [
    path('messages/<int:consultation_id>/', MessageListView.as_view(), name='message-list'),
    path('messages/<int:consultation_id>/send/', MessageSendView.as_view(), name='message-send'),
    path('<int:consultation_id>/participant/', get_chat_partner),
    path('schedule/<int:consultation_id>/', ScheduleMeetingView.as_view()),
    path('partner-name/<int:consultation_id>/', ChatPartnerNameView.as_view(), name='partner-name'),
]