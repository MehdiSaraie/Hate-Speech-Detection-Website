# Generated by Django 4.0.4 on 2022-05-12 19:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('forum', '0007_rename_created_at_message_createdat_message_userip'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='userIP',
            field=models.CharField(max_length=16),
        ),
    ]