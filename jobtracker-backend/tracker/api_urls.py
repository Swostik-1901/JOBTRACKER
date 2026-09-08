from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api_views

router = DefaultRouter()
router.register(r"applications", api_views.ApplicationViewSet, basename="application")

urlpatterns = [
    path("login/", api_views.login_view, name="api-login"),
    path("signup/", api_views.signup_view, name="api-signup"),
    path("", include(router.urls)),
]
