function getUser() {
  const u = localStorage.getItem('tms_user');
  if (!u) { window.location.href = 'login.html'; return null; }
  return JSON.parse(u);
}

function getEmployee() {
  const e = localStorage.getItem('tms_employee');
  return e ? JSON.parse(e) : null;
}

function initSidebar() {
  const user = getUser(); if (!user) return;
  const a = document.getElementById('sidebarAvatar');
  const n = document.getElementById('sidebarName');
  const r = document.getElementById('sidebarRole');
  if (a) a.textContent = user.username[0].toUpperCase();
  if (n) n.textContent = user.username;
  if (r) r.textContent = user.role;
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('tms_user');
    localStorage.removeItem('tms_employee');
    window.location.href = 'login.html';
  });
  if (user.role !== 'admin') {
    document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
  }
  return user;
}

function showToast(message, type = 'success') {
  const t = document.getElementById('toast'); if (!t) return;
  t.textContent = message; t.className = `show ${type}`;
  setTimeout(() => { t.className = ''; }, 3000);
}

document.addEventListener('click', e => {
  const btn = e.target.closest('.btn-primary'); if (!btn) return;
  const ripple = document.createElement('span');
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.className = 'ripple';
  ripple.style.cssText = `width:${size}px;height:${size}px;top:${e.clientY-rect.top-size/2}px;left:${e.clientX-rect.left-size/2}px;`;
  btn.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
});

function escHtml(str) {
  const d = document.createElement('div'); d.textContent = str ?? ''; return d.innerHTML;
}

function fmtDate(dateStr) {
  if (!dateStr) return 'No due date';
  return new Date(dateStr).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}

function renderTaskCard(task, i, isAdmin) {
  const card = document.createElement('div');
  card.className = 'task-card' + (task.completed ? ' done' : '');
  card.style.animationDelay = `${i * 0.05}s`;
  card.innerHTML = `
    <div class="status-dot ${task.completed ? 'done' : 'pending'}"></div>
    <div class="task-main">
      <div class="task-title">${escHtml(task.title)}</div>
      <div class="task-meta">
        <span class="badge ${task.priority}">${task.priority}</span>
        <span>Employee: ${escHtml(task.employee_name)}</span>
        <span>Due: ${fmtDate(task.due_date)}</span>
        <span style="color:${task.completed ? 'var(--success)' : 'var(--warning)'}">
          ${task.completed ? 'Completed: True' : 'Completed: False'}
        </span>
      </div>
    </div>
    <div class="task-actions">
      <button class="toggle-btn ${task.completed ? 'mark-pending' : 'mark-done'}"
              data-id="${task.task_id}" data-done="${task.completed}">
        ${task.completed ? 'Reopen' : 'Mark Done'}
      </button>
      ${isAdmin ? `<button class="btn-icon del-btn" data-id="${task.task_id}">X</button>` : ''}
    </div>`;
  return card;
}