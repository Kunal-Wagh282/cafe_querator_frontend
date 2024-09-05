from rest_framework import serializers
from .models import *


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

class CafeInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cafe_Info
        fields = ['Cafe_Name', 'Cafe_Address', 'Cafe_Contact', 'Owner_Name', 'Owner_Contact']
