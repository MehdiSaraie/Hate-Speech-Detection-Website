from django.contrib import admin
from django.contrib.auth.models import Group
from .models import Message

# Register your models here.

class messageAdmin(admin.ModelAdmin):
    list_display= ['userIP', 'text', 'isOffensiveInModelView','isOffensiveInUserView', 'createdAt']

admin.site.unregister(Group)
admin.site.register(Message, messageAdmin)