from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import (
    LoginView,
    RegisterView,
    get_user_profile,
    get_unapproved_lawyers,
    get_approved_lawyers,
    approve_lawyer,
    list_lawyers,
    LawyerProfileView,
    ClientProfileView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', get_user_profile, name='me'),
    path('unapproved-lawyers/', get_unapproved_lawyers, name='unapproved-lawyers'),
    path('approved-lawyers/', get_approved_lawyers, name='approved-lawyers'),
    path('approve-lawyer/<int:user_id>/', approve_lawyer, name='approve-lawyer'),
    path('lawyers/', list_lawyers, name='list-lawyers'),
    path('lawyer-profile/', LawyerProfileView.as_view(), name='lawyer-profile'),
    path('client-profile/', ClientProfileView.as_view(), name='client-profile'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)