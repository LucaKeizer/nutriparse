# Generated by Django 5.2.1 on 2025-05-23 09:26

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('nutrition', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Recipe',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('instructions', models.TextField(blank=True)),
                ('servings', models.PositiveIntegerField(default=1)),
                ('prep_time', models.PositiveIntegerField(blank=True, help_text='Preparation time in minutes', null=True)),
                ('cook_time', models.PositiveIntegerField(blank=True, help_text='Cooking time in minutes', null=True)),
                ('original_text', models.TextField(blank=True)),
                ('image', models.ImageField(blank=True, null=True, upload_to='recipe_images/')),
                ('source_url', models.URLField(blank=True)),
                ('source_name', models.CharField(blank=True, max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('total_calories', models.FloatField(blank=True, null=True)),
                ('total_protein', models.FloatField(blank=True, null=True)),
                ('total_carbs', models.FloatField(blank=True, null=True)),
                ('total_fat', models.FloatField(blank=True, null=True)),
                ('total_fiber', models.FloatField(blank=True, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='recipes', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='RecipeIngredient',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.FloatField(blank=True, null=True)),
                ('preparation', models.CharField(blank=True, help_text='E.g., chopped, diced, minced', max_length=100)),
                ('original_text', models.TextField()),
                ('is_parsed', models.BooleanField(default=False)),
                ('food', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='recipe_usages', to='nutrition.nutritiondata')),
                ('recipe', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ingredients', to='recipes.recipe')),
                ('unit', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='nutrition.measurementunit')),
            ],
            options={
                'ordering': ['id'],
            },
        ),
        migrations.CreateModel(
            name='RecipeTag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('recipe', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='recipe_tags', to='recipes.recipe')),
                ('tag', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tagged_recipes', to='recipes.tag')),
            ],
            options={
                'unique_together': {('recipe', 'tag')},
            },
        ),
    ]
