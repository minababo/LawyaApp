from rest_framework import generics, permissions, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import LawyerProfile
from .serializers import LawyerProfileSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ClientProfile, LawyerProfile
from .serializers import LawyerProfileSerializer, ClientProfileSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import (
    ClientProfileSerializer,
    LawyerProfileSerializer,
    RegisterSerializer
)
from users.serializers import LawyerProfileSerializer

from .serializers import RegisterSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        print("Incoming registration data:", request.data)
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "User registered successfully",
                "user": RegisterSerializer(user, context={"request": request}).data
            }, status=status.HTTP_201_CREATED)

        print("Registration error:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email and password required'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=email, password=password)

        if user is None:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key}, status=status.HTTP_200_OK)
    

class ClientProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ClientProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user.clientprofile

class LawyerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = LawyerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user.lawyerprofile


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    return Response({
        'email': request.user.email,
        'role': request.user.role,
    })

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_unapproved_lawyers(request):
    if request.user.role != 'admin':
        return Response({'error': 'Unauthorized'}, status=403)
    lawyers = LawyerProfile.objects.filter(approved=False)
    serializer = LawyerProfileSerializer(lawyers, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_approved_lawyers(request):
    if request.user.role != 'admin':
        return Response({'error': 'Unauthorized'}, status=403)
    lawyers = LawyerProfile.objects.filter(approved=True)
    serializer = LawyerProfileSerializer(lawyers, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def approve_lawyer(request, user_id):
    if request.user.role != 'admin':
        return Response({'error': 'Unauthorized'}, status=403)
    try:
        lawyer = LawyerProfile.objects.get(user_id=user_id)
        lawyer.approved = True
        lawyer.save()
        return Response({'message': 'Lawyer approved'})
    except LawyerProfile.DoesNotExist:
        return Response({'error': 'Lawyer not found'}, status=404)
    

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def list_lawyers(request):
    if request.user.role != 'client':
        return Response({'error': 'Unauthorized'}, status=403)

    queryset = LawyerProfile.objects.filter(approved=True)

    search = request.query_params.get('search')
    expertise = request.query_params.get('expertise')

    if search:
        queryset = queryset.filter(full_name__icontains=search)
    if expertise:
        queryset = queryset.filter(expertise__iexact=expertise)

    serializer = LawyerProfileSerializer(queryset, many=True)
    return Response(serializer.data)