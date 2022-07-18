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
    inference = InferenceApi(repo_id="UT/BRTW_MULICLASS", token='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')

    def perform_create(self, serializer):
        text = self.request.data['text']
        result = self.inference(inputs=text)
        pred_classes = result[0]
        labels = {'LABEL_0': 'فقط توهین' , 'LABEL_1': 'خنثی', 'LABEL_2': 'مذهب', 'LABEL_3': 'ملیت', 'LABEL_4': 'نژاد و قومیت'}
        max_index = max(range(len(pred_classes)), key=lambda x : pred_classes[x]['score'])
        max_label = pred_classes[max_index]['label']
        hate_category = labels[max_label]
        is_offensive = hate_category != 'خنثی'
        is_hateful = hate_category != 'فقط توهین' and hate_category != 'خنثی'
        if hate_category == 'فقط توهین' or hate_category == 'خنثی':
            hate_category = None
        serializer.save(isOffensiveInModelView=is_offensive, isOffensiveInUserView=is_offensive, isHatefulInModelView=is_hateful, isHatefulInUserView=is_hateful, hateCategory=hate_category)
