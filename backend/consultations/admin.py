from django.contrib import admin
from .models import ConsultationRequest, ConsultationPoint

admin.site.register(ConsultationRequest)
admin.site.register(ConsultationPoint)