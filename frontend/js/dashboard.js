const user = initSidebar();
const employee = getEmployee();
const isAdmin = user && user.role === 'admin';
if (!isAdmin) document.getElementById('taskFormSection')?.classList.add('hidden');

function animateCount(id, target) {
  const el = document.getElementById(id); if (!el) return;
  let cur = 0;
  const step = Math.ceil(target / 30);
  const t = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = cur;
    if (cur >= target) clearInterval(t);
  }, 30);
}

async function loadSummary() {
  try {
    const res = await fetch('/api/tasks/summary');
    const data = await res.json();
    animateCount('totalCount',     data.total     || 0);
    animateCount('completedCount', data.completed || 0);
    animateCount('pendingCount',   data.pending   || 0);
  } catch {}
}

async function loadEmployeeDropdown() {
  try {
    const res = await fetch('/api/employees');
    const list = await res.json();
    const sel = document.getElementById('fEmployee');
    list.forEach(emp => {
      const o = document.createElement('option');
      o.value = emp.employee_id;
      o.textContent = `${emp.full_name} — ${emp.department || 'N/A'}`;
      sel.appendChild(o);
    });
  } catch {}
}

let activeFilter = '';

async function loadTasks() {
  const container = document.getElementById('taskList');
  container.innerHTML = '<div class="empty-state"><span class="empty-icon">&#128225;</span>Loading...</div>';
  const params = new URLSearchParams();
  if (!isAdmin && employee) params.append('employee_id', employee.employee_id);
  if (activeFilter !== '') params.append('completed', activeFilter);
  try {
    const res = await fetch('/api/tasks' + (params.toString() ? '?' + params : ''));
    const tasks = await res.json();
    container.innerHTML = '';
    if (!tasks.length) {
      container.innerHTML = '<div class="empty-state"><span class="empty-icon">&#128225;</span>No tasks found.</div>';
      return;
    }
    tasks.forEach((task, i) => {
      const card = renderTaskCard(task, i, isAdmin);
      card.querySelector('.toggle-btn').addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        const done = btn.dataset.done === 'true';
        await fetch(`/api/tasks/${btn.dataset.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: !done })
        });
        showToast(done ? 'Task reopened' : 'Task marked complete!');
        loadTasks(); loadSummary();
      });
      card.querySelector('.del-btn')?.addEventListener('click', async (e) => {
        if (!confirm('Delete this task?')) return;
        await fetch(`/api/tasks/${e.currentTarget.dataset.id}`, { method: 'DELETE' });
        showToast('Task deleted', 'error');
        loadTasks(); loadSummary();
      });
      container.appendChild(card);
    });
  } catch {
    container.innerHTML = '<div class="empty-state">Could not load tasks.</div>';
  }
}

document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeFilter = chip.dataset.filter;
    loadTasks();
  });
});

document.getElementById('taskForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    title:       document.getElementById('fTitle').value.trim(),
    description: document.getElementById('fDesc').value.trim(),
    employee_id: document.getElementById('fEmployee').value,
    priority:    document.getElementById('fPriority').value,
    due_date:    document.getElementById('fDueDate').value || null,
    completed:   document.getElementById('fCompleted').value === 'true',
    assigned_by: user.login_id
  };
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) { showToast(data.error, 'error'); return; }
  const msg = document.getElementById('taskMsg');
  msg.textContent = 'Task launched successfully!';
  msg.classList.remove('hidden');
  e.target.reset();
  document.getElementById('fPriority').value = 'Medium';
  document.getElementById('fCompleted').value = 'false';
  showToast('Task assigned!');
  loadTasks(); loadSummary();
});

loadSummary();
loadEmployeeDropdown();
loadTasks();