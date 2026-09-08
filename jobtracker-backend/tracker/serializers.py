from rest_framework import serializers
from .models import Application, StatusHistory


class StatusHistorySerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = StatusHistory
        fields = ["id", "status", "status_display", "note", "changed_at"]


class ApplicationSerializer(serializers.ModelSerializer):
    # nested read-only history, shown on detail requests
    history = StatusHistorySerializer(many=True, read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Application
        fields = [
            "id",
            "company_name",
            "role_title",
            "job_link",
            "location",
            "status",
            "status_display",
            "date_applied",
            "next_action_date",
            "resume_file",
            "notes",
            "created_at",
            "updated_at",
            "history",
        ]
        # user is set automatically from the logged-in request, never from client input
        read_only_fields = ["id", "created_at", "updated_at"]
