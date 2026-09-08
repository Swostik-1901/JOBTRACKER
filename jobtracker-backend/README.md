# Job Application Tracker (Django)

A personal dashboard to track job/internship applications — status, deadlines,
resume version used, and a timeline of status changes.

## Features
- User accounts (each user only sees their own applications)
- Add/edit/delete applications with resume file upload
- Search by company/role, filter by status
- Dashboard summary cards (counts per status)
- Status change history/timeline per application
- Django admin panel for quick data browsing

## Setup

```bash
# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run migrations
python manage.py makemigrations
python manage.py migrate

# 4. Create an admin user (optional, for /admin/)
python manage.py createsuperuser

# 5. Run the dev server
python manage.py runserver
```

Visit http://127.0.0.1:8000/ — sign up, log in, and start adding applications.
Visit http://127.0.0.1:8000/admin/ to browse data via Django admin.

## REST API (for the standalone frontend)

Base URL: `http://127.0.0.1:8000/api/`

| Endpoint | Method | Auth? | Description |
|---|---|---|---|
| `/api/signup/` | POST | No | `{username, password}` → creates user, returns `{token, username}` |
| `/api/login/` | POST | No | `{username, password}` → returns `{token, username}` |
| `/api/applications/` | GET | Yes | List your applications (paginated, filterable via `?status=OFFER`, searchable via `?search=northwind`) |
| `/api/applications/` | POST | Yes | Create an application (`multipart/form-data` if uploading a resume) |
| `/api/applications/<id>/` | GET/PATCH/DELETE | Yes | Retrieve, update, or delete one application |
| `/api/applications/summary/` | GET | Yes | `{"APPLIED": 3, "INTERVIEW": 1, ...}` — powers the dashboard's summary cards |

**Auth header format:** `Authorization: Token <the_token_you_got_back>`

### Quick test with curl
```bash
# sign up
curl -X POST http://127.0.0.1:8000/api/signup/ -H "Content-Type: application/json" \
  -d '{"username":"you","password":"yourpassword"}'

# use the returned token
curl http://127.0.0.1:8000/api/applications/ -H "Authorization: Token YOUR_TOKEN_HERE"
```

### Connecting your existing frontend
In `dashboard.js`, replace the mock `applications` array with real calls, e.g.:
```javascript
const API_BASE = "http://127.0.0.1:8000/api";
let authToken = null; // set this after login, keep it in memory (not localStorage)

async function fetchApplications() {
  const res = await fetch(`${API_BASE}/applications/`, {
    headers: { Authorization: `Token ${authToken}` }
  });
  const data = await res.json();
  applications = data.results;
  renderSummary();
  renderTable();
}
```
For the "Log application" form submit, swap the local `applications.unshift(...)` for a `fetch(POST)` using `FormData` (the browser sets the right `multipart/form-data` headers automatically when you pass a `FormData` object as the `body`).

If your frontend is opened from a different port than `:8000` (e.g. Live Server on `:5500`), make sure that origin is listed in `CORS_ALLOWED_ORIGINS` in `config/settings.py`.


## Project structure
```
jobtracker/
  config/          # project settings, root urls
  tracker/         # the app: models, views, forms, templates
  static/css/      # styling
  media/resumes/   # uploaded resume files (created at runtime)
```

## Where to take this next (good resume talking points)
- Add a REST API with Django REST Framework (`/api/applications/`)
- Add email/SMS reminders for `next_action_date` using Celery + a scheduler
- Deploy to Render/Railway with a Postgres database instead of SQLite
- Add tests (`tracker/tests.py`) for model behavior and view permissions
- Extend toward a two-sided marketplace (recruiter + student roles) later
