from .views import *
from django.urls import path

urlpatterns = [
    path('register', SignupView.as_view()),
    path('csrf_cookie',GetCSRFToken.as_view()),
    path('login', LoginView.as_view()),
    path('authenticated', CheckAuthenticated.as_view()),
    path('logout', LogoutView.as_view()),
    path('cafe_info',CafeInfoView.as_view()),

]