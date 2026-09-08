// ---------- Mobile nav ----------
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
}

// ---------- Mock data (stand-in until the Django API is wired up) ----------
let applications = [
  { role: 'SWE Intern', company: 'Northwind Labs', status: 'applied', dateApplied: '2026-08-20', nextAction: '2026-09-12' },
  { role: 'Backend Engineer', company: 'Vertex Systems', status: 'interview', dateApplied: '2026-08-14', nextAction: '2026-09-09' },
  { role: 'Data Analyst', company: 'Cobalt & Co', status: 'oa', dateApplied: '2026-08-22', nextAction: '2026-09-15' },
  { role: 'Full Stack Developer', company: 'Harbor Digital', status: 'offer', dateApplied: '2026-07-30', nextAction: '—' },
  { role: 'ML Intern', company: 'Fenwick AI', status: 'rejected', dateApplied: '2026-08-01', nextAction: '—' },
  { role: 'Platform Engineer', company: 'Ridgeline Cloud', status: 'applied', dateApplied: '2026-09-01', nextAction: '—' },
];

const statusLabels = {
  applied: 'Applied',
  oa: 'Online Assessment',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
};

let activeStatus = 'all';
let searchTerm = '';

const tableBody = document.getElementById('tableBody');
const emptyState = document.getElementById('emptyState');
const summaryRow = document.getElementById('summaryRow');
const chipRow = document.getElementById('chipRow');
const searchInput = document.getElementById('searchInput');

function renderSummary() {
  const counts = { applied: 0, oa: 0, interview: 0, offer: 0, rejected: 0 };
  applications.forEach(a => counts[a.status]++);

  summaryRow.innerHTML = Object.entries(counts).map(([status, count]) => `
    <div class="summary-card">
      <div class="summary-count">${count}</div>
      <div class="summary-label">${statusLabels[status]}</div>
    </div>
  `).join('');
}

function renderChips() {
  const statuses = ['all', 'applied', 'oa', 'interview', 'offer', 'rejected'];
  chipRow.innerHTML = statuses.map(s => `
    <button class="chip ${s === activeStatus ? 'active' : ''}" data-status="${s}">
      ${s === 'all' ? 'All' : statusLabels[s]}
    </button>
  `).join('');

  chipRow.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      activeStatus = chip.dataset.status;
      renderChips();
      renderTable();
    });
  });
}

function renderTable() {
  const filtered = applications.filter(a => {
    const matchesStatus = activeStatus === 'all' || a.status === activeStatus;
    const matchesSearch = !searchTerm ||
      a.company.toLowerCase().includes(searchTerm) ||
      a.role.toLowerCase().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  emptyState.hidden = filtered.length > 0;
  tableBody.innerHTML = filtered.map((a, i) => `
    <div class="row" style="animation-delay:${i * 0.04}s">
      <span class="row-role">${a.role}</span>
      <span class="row-company">${a.company}</span>
      <span class="badge badge-${a.status}">${statusLabels[a.status].toUpperCase()}</span>
      <span class="row-date">${a.dateApplied}</span>
      <span class="row-date">${a.nextAction}</span>
    </div>
  `).join('');
}

renderSummary();
renderChips();
renderTable();

searchInput.addEventListener('input', (e) => {
  searchTerm = e.target.value.toLowerCase();
  renderTable();
});

// ---------- Modal ----------
const modalOverlay = document.getElementById('modalOverlay');
const openModal = document.getElementById('openModal');
const closeModal = document.getElementById('closeModal');
const cancelModal = document.getElementById('cancelModal');
const appForm = document.getElementById('appForm');

function showModal() {
  modalOverlay.hidden = false;
  document.body.style.overflow = 'hidden';
}
function hideModal() {
  modalOverlay.hidden = true;
  document.body.style.overflow = '';
  appForm.reset();
}

openModal.addEventListener('click', showModal);
closeModal.addEventListener('click', hideModal);
cancelModal.addEventListener('click', hideModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) hideModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modalOverlay.hidden) hideModal();
});

appForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(appForm);

  applications.unshift({
    role: formData.get('role') || 'Untitled role',
    company: formData.get('company') || 'Unknown company',
    status: formData.get('status') || 'applied',
    dateApplied: formData.get('dateApplied') || new Date().toISOString().slice(0, 10),
    nextAction: formData.get('nextAction') || '—',
  });

  renderSummary();
  renderTable();
  hideModal();
  showToast('Application saved');
});

// ---------- Toast ----------
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}
