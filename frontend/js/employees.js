const user = initSidebar();
const isAdmin = user && user.role === 'admin';
if (!isAdmin) document.getElementById('addEmpSection')?.classList.add('hidden');

async function loadEmployees() {
  const grid = document.getElementById('employeeGrid');
  grid.innerHTML = '<div class="empty-state">Loading...</div>';
  try {
    const res = await fetch('/api/employees');
    const list = await res.json();
    grid.innerHTML = '';
    if (!list.length) {
      grid.innerHTML = '<div class="empty-state">No employees found.</div>';
      return;
    }
    list.forEach((emp, i) => {
      const initials = emp.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const card = document.createElement('div');
      card.className = 'employee-card';
      card.style.animationDelay = `${i * 0.06}s`;
      card.innerHTML = `
        <div class="emp-avatar">${initials}</div>
        <div>
          <div class="emp-name">${escHtml(emp.full_name)}</div>
          <div class="emp-position">${escHtml(emp.position || 'N/A')}</div>
          <div class="emp-dept">Dept: ${escHtml(emp.department || 'N/A')}</div>
          <div class="emp-email">Email: ${escHtml(emp.email)}</div>
        </div>`;
      grid.appendChild(card);
    });
  } catch {
    grid.innerHTML = '<div class="empty-state">Could not load employees.</div>';
  }
}

document.getElementById('empForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    full_name:  document.getElementById('eName').value.trim(),
    email:      document.getElementById('eEmail').value.trim(),
    department: document.getElementById('eDept').value.trim(),
    position:   document.getElementById('ePosition').value.trim()
  };
  const res = await fetch('/api/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) { showToast('Failed to add employee', 'error'); return; }
  showToast('Employee added!');
  e.target.reset();
  loadEmployees();
});

loadEmployees();