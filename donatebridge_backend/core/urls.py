"""
URL routing configuration for core project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin-django/', admin.site.urls),
    path('api/', include('authentication.urls')),
    path('api/', include('ngo.urls')),
    path('api/', include('donation.urls')),
    path('api/', include('logistics.urls')),
    path('api/', include('chat.urls')),
    path('api/', include('moderation.urls')),
    path('api/', include('notification.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
