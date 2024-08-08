from django.contrib.auth.models import User
from rest_framework.views import APIView,Response,status
from rest_framework import permissions
from .models import *
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.utils.decorators import method_decorator
from django.contrib import auth
from .serializers import *

@method_decorator(csrf_protect, name='dispatch')
class CheckAuthenticated(APIView):
    def get(self, request, format=None):
        user = self.request.user
        try:
            isAuthenticated = user.is_authenticated

            if User is not None:
                return Response({'isAuthenticated':'success'},status=status.HTTP_202_ACCEPTED)
            else:
                return Response({'isAuthenticated':'error'},status=status.HTTP_404_NOT_FOUND)
        except:
             return Response({ 'error': 'Something went wrong when checking authentication status' },status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_protect, name='dispatch')
class SignupView(APIView):
    permission_classes = (permissions.AllowAny,)
    def post(self, request, format = None):
        data = self.request.data
        username = data['username']
        password = data['password']
        try:
            if User.objects.filter(username=username).exists():
                return Response({'error': 'User already exists'}, status =status.HTTP_226_IM_USED)
            else:
                User.objects.create_user(username=username, password=password)
                return Response({ 'success': 'User created successfully' }, status =status.HTTP_201_CREATED)
        except:
            return Response({ 'error': 'Something went wrong when registering account' },status=status.HTTP_400_BAD_REQUEST)
        


@method_decorator(csrf_protect, name='dispatch')          
class CafeInfoView(APIView):
    serializer_class = CafeInfoSerializer
    def post(self, request, foramt = None):
            user = self.request.user
            username = user.username
            serializer = self.serializer_class(data = request.data)
            if serializer.is_valid():
                Cafe_Name = serializer.validated_data['Cafe_Name']
                Cafe_Address = serializer.validated_data['Cafe_Address']
                Cafe_Contact = serializer.validated_data['Cafe_Contact']
                Owner_Name = serializer.validated_data['Owner_Name']
                Owner_Contact = serializer.validated_data['Owner_Contact']

                try:
                    user = User.objects.get(id=user.id)
                    cafe_info = Cafe_Info(user=user, Cafe_Address = Cafe_Address, Cafe_Name = Cafe_Name, Cafe_Contact = Cafe_Contact, Owner_Name = Owner_Name, Owner_Contact = Owner_Contact)
                    cafe_info.save()
                    return Response({"success":"User Info saved"},status=status.HTTP_200_OK)
                except Exception as e:
                    return Response({"error":f"{e}"},status=status.HTTP_400_BAD_REQUEST)
            return Response({"error":"Bad body parameters"},status=status.HTTP_424_FAILED_DEPENDENCY)


@method_decorator(csrf_protect, name='dispatch')           
class LoginView(APIView):
    permission_classes = (permissions.AllowAny, )

    def post(self, request, format=None):
        data = self.request.data

        username = data['username']
        password = data['password']

        try:
            user = auth.authenticate(username=username, password=password)
            if user is not None:
                auth.login(request, user)
                return Response({ 'success': 'User authenticated' },status=status.HTTP_200_OK)
            else:
                return Response({ 'error': 'Error Authenticating' },status=status.HTTP_406_NOT_ACCEPTABLE)
        except:
            return Response({ 'error': 'Something went wrong when logging in' },status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    def post(self, request, format=None):
        try:
            auth.logout(request)
            return Response({ 'success': 'Loggout Out' },status=status.HTTP_200_OK)
        except:
            return Response({ 'error': 'Something went wrong when logging out' },status=status.HTTP_400_BAD_REQUEST)

@method_decorator(ensure_csrf_cookie,name="dispatch")
class GetCSRFToken(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self,request ,format =None):
        return Response({"success":"CSRFToken",},status=status.HTTP_200_OK)