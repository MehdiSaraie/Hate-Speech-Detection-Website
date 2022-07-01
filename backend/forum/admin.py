from django.contrib import admin
from django.contrib.auth.models import Group, User
from import_export.admin import ImportExportModelAdmin
from .models import Message

# Register your models here.

class messageAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    list_display= ['userIP', 'text', 'isOffensiveInModelView','isOffensiveInUserView', 'createdAt']
    list_filter = ('isOffensiveInModelView','isOffensiveInUserView', 'createdAt')
    search_fields = ('text', 'userIP')

admin.site.unregister(User)
admin.site.unregister(Group)
admin.site.register(Message, messageAdmin)