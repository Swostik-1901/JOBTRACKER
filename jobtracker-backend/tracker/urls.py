from django.urls import path
from . import views

urlpatterns = [
    path("", views.DashboardView.as_view(), name="dashboard"),
    path("signup/", views.signup, name="signup"),
    path("applications/new/", views.ApplicationCreateView.as_view(), name="application-create"),
    path("applications/<int:pk>/", views.ApplicationDetailView.as_view(), name="application-detail"),
    path("applications/<int:pk>/edit/", views.ApplicationUpdateView.as_view(), name="application-update"),
    path("applications/<int:pk>/delete/", views.ApplicationDeleteView.as_view(), name="application-delete"),
]
