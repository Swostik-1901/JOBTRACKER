from django.contrib import admin
from .models import Application, StatusHistory


class StatusHistoryInline(admin.TabularInline):
    model = StatusHistory
    extra = 0
    readonly_fields = ["changed_at"]


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ["role_title", "company_name", "user", "status", "date_applied", "next_action_date"]
    list_filter = ["status", "date_applied"]
    search_fields = ["company_name", "role_title", "user__username"]
    inlines = [StatusHistoryInline]
