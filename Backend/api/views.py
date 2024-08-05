from django.contrib.auth.models import User
from rest_framework.views import APIView,Response,status
from rest_framework import permissions
from .models import *
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.utils.decorators import method_decorator
from django.contrib import auth

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
             return Response({ 'error': 'Something went wrong when checking authentication status' })


@method_decorator(csrf_protect, name='dispatch')
class SignupView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format = None):
        data = request.data

        username = data['username']
        password = data['password']
        Cafe_Name = data['Cafe_Name']
        Cafe_Address = data['Cafe_Address']
        Cafe_Contact = data['Cafe_Contact']
        Owner_Name = data['Owner_Name']
        Owner_Contact = data['Owner_Contact']

        try:
            if User.objects.filter(username=username).exists():
                return Response({'error': 'User already exists'}, status =status.HTTP_226_IM_USED)
            else:
                user = User.objects.create_user(username=username, password=password)

                user = User.objects.get(id=user.id)

                cafe_info = Cafe_Info.objects.create(user=user, Cafe_Address = Cafe_Address, Cafe_Name = Cafe_Name, Cafe_Contact = Cafe_Contact, Owner_Name = Owner_Name, Owner_Contact = Owner_Contact)

                return Response({ 'success': 'User created successfully' })
        except:
            return Response({ 'error': 'Something went wrong when registering account' })
        
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
                return Response({ 'success': 'User authenticated' })
            else:
                return Response({ 'error': 'Error Authenticating' })
        except:
            return Response({ 'error': 'Something went wrong when logging in' })

class LogoutView(APIView):
    def post(self, request, format=None):
        try:
            auth.logout(request)
            return Response({ 'success': 'Loggout Out' })
        except:
            return Response({ 'error': 'Something went wrong when logging out' })

@method_decorator(ensure_csrf_cookie,name="dispatch")
class GetCSRFToken(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self,request ,format =None):
        return Response({"success":"CSRFToken",})