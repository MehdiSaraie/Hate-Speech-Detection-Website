from django.db import models

# Create your models here.
class Message(models.Model):
    userIP = models.CharField(max_length=16)
    text = models.TextField(blank=False)
    isOffensiveInModelView=models.BooleanField(null=True)
    isOffensiveInUserView=models.BooleanField(null=True)
    isHatefulInModelView=models.BooleanField(null=True)
    isHatefulInUserView=models.BooleanField(null=True)
    hateCategory=models.CharField(max_length=9, blank=True, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text
