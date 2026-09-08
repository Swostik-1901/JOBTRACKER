from rest_framework import viewsets, filters, status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend

from .models import Application
from .serializers import ApplicationSerializer


class ApplicationViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for /api/applications/
    - list:    GET  /api/applications/
    - create:  POST /api/applications/
    - detail:  GET  /api/applications/<id>/
    - update:  PUT/PATCH /api/applications/<id>/
    - delete:  DELETE /api/applications/<id>/
    Plus a custom /api/applications/summary/ for the dashboard's status counts.
    """
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status"]
    search_fields = ["company_name", "role_title"]
    ordering_fields = ["date_applied", "next_action_date", "created_at"]
    ordering = ["-date_applied"]

    def get_queryset(self):
        # CRITICAL: users only ever see their own applications
        return Application.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        application = serializer.save(user=self.request.user)
        application.history.create(status=application.status, note="Application created")

    def perform_update(self, serializer):
        old_status = self.get_object().status
        application = serializer.save()
        if application.status != old_status:
            application.history.create(status=application.status, note="Status updated")

    @action(detail=False, methods=["get"])
    def summary(self, request):
        counts = self.get_queryset().values("status").annotate(count=Count("id"))
        return Response({item["status"]: item["count"] for item in counts})


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """POST { username, password } -> { token } for the frontend to store and send back."""
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(username=username, password=password)
    if user is None:
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "username": user.username})


@api_view(["POST"])
@permission_classes([AllowAny])
def signup_view(request):
    """POST { username, password } -> creates a user and returns a token, same shape as login."""
    from django.contrib.auth.models import User

    username = request.data.get("username")
    password = request.data.get("password")
    if not username or not password:
        return Response({"detail": "username and password are required"}, status=400)
    if User.objects.filter(username=username).exists():
        return Response({"detail": "That username is taken"}, status=400)

    user = User.objects.create_user(username=username, password=password)
    token = Token.objects.create(user=user)
    return Response({"token": token.key, "username": user.username})
