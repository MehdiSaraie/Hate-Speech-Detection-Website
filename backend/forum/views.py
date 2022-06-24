from rest_framework import viewsets
from rest_framework import filters
from huggingface_hub.inference_api import InferenceApi
from django.views import View

from django_filters.rest_framework import DjangoFilterBackend

from .models import Message
from .serializers import MessageSerializer


# Create your views here.

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    filter_backends = (filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend)
    search_fields = ('text',)
    ordering_fields = ('createdAt', 'text',)
    ordering = ('-createdAt', 'text',)
    filter_fields = ['owner',]
    inference = InferenceApi(repo_id="UT/BMW", token='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')

    def perform_create(self, serializer):
        text = self.request.data['text']
        result = self.inference(inputs=text)
        print(result)
        isOffensive = result[0][0]['score'] > 0.5
        serializer.save(owner=self.request.user, isOffensiveInModelView=isOffensive, isOffensiveInUserView=isOffensive)
