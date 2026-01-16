"""
WSGI config for backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os
from django.core.wsgi import get_wsgi_application
from django.core.management import call_command
from django.contrib.auth import get_user_model

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

# Run startup commands
try:
    application = get_wsgi_application()
    
    # Run migrations
    call_command('migrate', interactive=False)

    # Create superuser if it does not exist
    User = get_user_model()
    username = 'admin'
    password = 'admin123'
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username, '', password)
        print(f"Superuser '{username}' created.")
    else:
        print(f"Superuser '{username}' already exists.")

except Exception as e:
    print(f"Error during startup: {e}")
    # Ensure application is defined even if startup fails
    application = get_wsgi_application()

