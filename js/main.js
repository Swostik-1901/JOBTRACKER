// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// Sample data for the hero split-flap board
const sampleRows = [
  { role: 'SWE Intern', company: 'Northwind Labs', status: 'APPLIED', next: 'Sep 12' },
  { role: 'Backend Eng', company: 'Vertex Systems', status: 'INTERVIEW', next: 'Sep 09' },
  { role: 'Data Analyst', company: 'Cobalt & Co', status: 'OA', next: 'Sep 15' },
  { role: 'Full Stack', company: 'Harbor Digital', status: 'OFFER', next: '—' },
  { role: 'ML Intern', company: 'Fenwick AI', status: 'REJECTED', next: '—' },
];

const boardRows = document.getElementById('boardRows');

if (boardRows) {
  sampleRows.forEach((row, i) => {
    const el = document.createElement('div');
    el.className = 'board-row';
    el.style.animationDelay = `${i * 0.12 + 0.15}s`;
    el.innerHTML = `
      <span class="flap">${row.role}</span>
      <span class="flap">${row.company}</span>
      <span class="flap status status-${row.status.toLowerCase()}">${row.status}</span>
      <span class="flap">${row.next}</span>
    `;
    boardRows.appendChild(el);
  });

  // trigger the flap-in animation on load
  requestAnimationFrame(() => {
    document.querySelectorAll('.board-row').forEach(r => r.classList.add('in'));
  });
}
