from rest_framework import viewsets
from rest_framework import filters
from huggingface_hub.inference_api import InferenceApi
from django_filters.rest_framework import DjangoFilterBackend

from .models import Message
from .serializers import MessageSerializer


# Create your views here.
OFFESNSIVE_CLASS_LABEL = 'LABEL_0'

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    filter_backends = (filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend)
    search_fields = ('text', 'userIP', 'createdAt')
    ordering_fields = ('createdAt', 'text',)
    ordering = ('-createdAt', 'text',)
    filter_fields = ('text', 'userIP', 'createdAt')
    inference = InferenceApi(repo_id="UT/BMW", token='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')

    def perform_create(self, serializer):
        text = self.request.data['text']
        result = self.inference(inputs=text)
        for res_class in result[0]:
            if res_class['label'] == OFFESNSIVE_CLASS_LABEL:
                isOffensive = res_class['score'] > 0.5
        serializer.save(isOffensiveInModelView=isOffensive, isOffensiveInUserView=isOffensive)
