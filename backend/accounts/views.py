"""Accounts views for JWT authentication."""
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )


from rest_framework.parsers import MultiPartParser, FormParser
from .models import UserProfile
from django.contrib.auth import update_session_auth_hash

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, *APIView.parser_classes]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        user = request.user
        
        # Update User Name (first_name and last_name mapping based on full name if you wish, or just set username)
        # Using first_name to store the requested name for simplicity as 'name'
        if 'name' in request.data:
            name_parts = request.data['name'].split(' ', 1)
            user.first_name = name_parts[0]
            if len(name_parts) > 1:
                user.last_name = name_parts[1]
            else:
                user.last_name = ""
            user.save()

        # Update Password
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if current_password and new_password:
            if not user.check_password(current_password):
                return Response({'error': 'Incorrect current password'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(new_password)
            user.save()
            # keep the user logged in after password change
            # However JWT handles this differently usually, but we don't need update_session_auth_hash for simple JWT.
            
        # Update Avatar
        if 'avatar' in request.FILES:
            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.avatar = request.FILES['avatar']
            profile.save()

        return Response(UserSerializer(user).data)
