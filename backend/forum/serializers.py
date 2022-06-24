from rest_framework import serializers

from accounts.serializers import UserSerializer

from .models import Message

# Create your serializers here.

class MessageSerializer(serializers.HyperlinkedModelSerializer):
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'userIP', 'owner', 'text', 'createdAt', 'isOffensiveInModelView', 'isOffensiveInUserView',)
