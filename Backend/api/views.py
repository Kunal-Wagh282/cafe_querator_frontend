from rest_framework.views import APIView, status
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from .serializers import *
from .models import User
import jwt, datetime



class SignupView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
            
class LoginView(APIView):
    def post(self, request):
        email = request.data['email']
        password = request.data['password']

        user = User.objects.filter(email=email).first()

        if user is None:
            return Response({"error":"User Not Found"},status=status.HTTP_400_BAD_REQUEST)
        if not user.check_password(password):
            return Response({"error":"Incorrect Password"},status=status.HTTP_400_BAD_REQUEST)
        payload = {
            'id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
            'iat': datetime.datetime.utcnow()
        }

        token = jwt.encode(payload, 'secret', algorithm='HS256')

        response = Response()

        response.set_cookie(key='jwt', value=token, httponly=True)
        response.data = {
            'message': "token set"
        }

        response.status_code = 200
        return response
    

   

class LogoutView(APIView):
    def post(self, request):
        response = Response()
        response.delete_cookie('jwt')
        response.data = {
            'message': 'success'
        }
        response.status_code = 200
        return response
    


class CafeInfoView(APIView):
    serializer_class = CafeInfoSerializer
    def post(self, request, foramt = None):
            
        token = request.COOKIES.get('jwt')

        if not token:
            return Response({"error":"Unauthenticated User"},status=status.HTTP_400_BAD_REQUEST)
        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])

        except jwt.ExpiredSignatureError:
            return Response({"error":f"{e}"},status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(id=payload['id']).first()
        serializer = self.serializer_class(data = request.data)
        if serializer.is_valid():
            Cafe_Name = serializer.validated_data['Cafe_Name']
            Cafe_Address = serializer.validated_data['Cafe_Address']
            Cafe_Contact = serializer.validated_data['Cafe_Contact']
            Owner_Name = serializer.validated_data['Owner_Name']
            Owner_Contact = serializer.validated_data['Owner_Contact']
            No_of_Tables = serializer.validated_data['No_of_Tables']

            try:
                user = User.objects.get(id=user.id)
                cafe_info = Cafe_Info(user=user, Cafe_Address = Cafe_Address, Cafe_Name = Cafe_Name, Cafe_Contact = Cafe_Contact, Owner_Name = Owner_Name, Owner_Contact = Owner_Contact, No_of_Tables=No_of_Tables)
                cafe_info.save()
                return Response({"success":"User Info saved"},status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error":f"{e}"},status=status.HTTP_400_BAD_REQUEST)
        return Response({"error":"Bad body parameters"},status=status.HTTP_424_FAILED_DEPENDENCY)