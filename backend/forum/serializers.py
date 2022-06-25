from rest_framework import serializers

from .models import Message

# Create your serializers here.

class MessageSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Message
        fields = ('id', 'userIP', 'text', 'isOffensiveInModelView', 'isOffensiveInUserView', 'createdAt',)
