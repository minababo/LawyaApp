from rest_framework import serializers
from .models import User, ClientProfile, LawyerProfile

class ClientProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = ClientProfile
        fields = ['full_name', 'phone_number', 'nic_number', 'email', 'profile_picture']

        extra_kwargs = {
            'full_name': {'required': False},
            'phone_number': {'required': False},
            'nic_number': {'required': False},
            'email': {'required': False},
            'profile_picture': {'required': False}
        }        

class LawyerProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    profile_picture = serializers.ImageField(required=False)

    class Meta:
        model = LawyerProfile
        fields = [
            'id', 'full_name', 'phone_number', 'nic_number', 'qualifications',
            'expertise', 'location', 'approved', 'user_id', 'email', 'profile_picture'
        ]
        extra_kwargs = {
            'expertise': {'required': True},
            'full_name': {'required': False},
            'phone_number': {'required': False},
            'nic_number': {'required': False},
            'location': {'required': False},
            'approved': {'read_only': True},
            'profile_picture': {'required': False}
        }

class RegisterSerializer(serializers.ModelSerializer):
    client_profile = ClientProfileSerializer(required=False)

    class Meta:
        model = User
        fields = [
            'email', 'password', 'role', 'client_profile'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        request = self.context.get('request')
        role = validated_data.get('role')
        email = validated_data.get('email')
        password = validated_data.get('password')
        validated_data['username'] = email

        user = User.objects.create_user(
            email=email,
            password=password,
            username=email,
            role=role,
        )

        if role == 'client':
            client_data = validated_data.pop('client_profile', {})
            ClientProfile.objects.create(user=user, **client_data)

        elif role == 'lawyer':
            LawyerProfile.objects.create(
                user=user,
                full_name=request.data.get('full_name'),
                phone_number=request.data.get('phone_number'),
                nic_number=request.data.get('nic_number'),
                expertise=request.data.get('expertise'),
                location=request.data.get('location'),
                qualifications=request.FILES.get('qualifications'),
            )

        return user
