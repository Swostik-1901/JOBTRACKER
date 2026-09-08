from django.contrib.auth.decorators import login_required
from django.contrib.auth import login
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.db.models import Q, Count
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse_lazy
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView

from .models import Application
from .forms import ApplicationForm


def signup(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect("dashboard")
    else:
        form = UserCreationForm()
    return render(request, "registration/signup.html", {"form": form})


class OwnerRequiredMixin(UserPassesTestMixin):
    """Make sure a user can only touch their own applications."""
    def test_func(self):
        obj = self.get_object()
        return obj.user == self.request.user


class DashboardView(LoginRequiredMixin, ListView):
    model = Application
    template_name = "tracker/dashboard.html"
    context_object_name = "applications"
    paginate_by = 10

    def get_queryset(self):
        qs = Application.objects.filter(user=self.request.user)

        query = self.request.GET.get("q")
        if query:
            qs = qs.filter(
                Q(company_name__icontains=query) | Q(role_title__icontains=query)
            )

        status = self.request.GET.get("status")
        if status:
            qs = qs.filter(status=status)

        return qs

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        base_qs = Application.objects.filter(user=self.request.user)

        # simple aggregation for the summary cards at the top of the dashboard
        ctx["status_counts"] = base_qs.values("status").annotate(count=Count("id"))
        ctx["total_count"] = base_qs.count()
        ctx["status_choices"] = Application.Status.choices
        ctx["current_query"] = self.request.GET.get("q", "")
        ctx["current_status"] = self.request.GET.get("status", "")
        return ctx


class ApplicationDetailView(LoginRequiredMixin, OwnerRequiredMixin, DetailView):
    model = Application
    template_name = "tracker/application_detail.html"
    context_object_name = "application"


class ApplicationCreateView(LoginRequiredMixin, CreateView):
    model = Application
    form_class = ApplicationForm
    template_name = "tracker/application_form.html"

    def form_valid(self, form):
        form.instance.user = self.request.user
        response = super().form_valid(form)
        self.object.history.create(status=self.object.status, note="Application created")
        return response


class ApplicationUpdateView(LoginRequiredMixin, OwnerRequiredMixin, UpdateView):
    model = Application
    form_class = ApplicationForm
    template_name = "tracker/application_form.html"

    def form_valid(self, form):
        old_status = Application.objects.get(pk=self.object.pk).status
        response = super().form_valid(form)
        if old_status != self.object.status:
            self.object.history.create(status=self.object.status, note="Status updated")
        return response


class ApplicationDeleteView(LoginRequiredMixin, OwnerRequiredMixin, DeleteView):
    model = Application
    template_name = "tracker/application_confirm_delete.html"
    success_url = reverse_lazy("dashboard")
