# Generated by Django 4.0.3 on 2022-07-18 11:37

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('userIP', models.CharField(max_length=16)),
                ('text', models.TextField()),
                ('isOffensiveInModelView', models.BooleanField(null=True)),
                ('isOffensiveInUserView', models.BooleanField(null=True)),
                ('isHatefulInModelView', models.BooleanField(null=True)),
                ('isHatefulInUserView', models.BooleanField(null=True)),
                ('hateCategory', models.CharField(max_length=9, null=True)),
                ('createdAt', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
