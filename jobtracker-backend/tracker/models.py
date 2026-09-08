from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse


class Application(models.Model):
    class Status(models.TextChoices):
        APPLIED = "APPLIED", "Applied"
        OA = "OA", "Online Assessment"
        INTERVIEW = "INTERVIEW", "Interview"
        OFFER = "OFFER", "Offer"
        REJECTED = "REJECTED", "Rejected"
        WITHDRAWN = "WITHDRAWN", "Withdrawn"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="applications")
    company_name = models.CharField(max_length=150)
    role_title = models.CharField(max_length=150)
    job_link = models.URLField(blank=True)
    location = models.CharField(max_length=100, blank=True)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.APPLIED)
    date_applied = models.DateField()
    next_action_date = models.DateField(null=True, blank=True, help_text="Follow-up or interview date")

    resume_file = models.FileField(upload_to="resumes/", blank=True, null=True)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date_applied"]

    def __str__(self):
        return f"{self.role_title} @ {self.company_name}"

    def get_absolute_url(self):
        return reverse("application-detail", kwargs={"pk": self.pk})


class StatusHistory(models.Model):
    """Keeps a timeline every time an application's status changes."""
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="history")
    status = models.CharField(max_length=20, choices=Application.Status.choices)
    note = models.CharField(max_length=255, blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-changed_at"]

    def __str__(self):
        return f"{self.application} -> {self.status} on {self.changed_at:%Y-%m-%d}"
