const user = initSidebar();
const isAdmin = user && user.role === 'admin';
const employee = getEmployee();
let activeFilter = '';

async function loadTasks() {
  const container = document.getElementById('taskList');
  container.innerHTML = '<div class="empty-state">Loading...</div>';
  const params = new URLSearchParams();
  if (!isAdmin && employee) params.append('employee_id', employee.employee_id);
  if (activeFilter !== '') params.append('completed', activeFilter);
  try {
    const res = await fetch('/api/tasks' + (params.toString() ? '?' + params : ''));
    const tasks = await res.json();
    container.innerHTML = '';
    if (!tasks.length) {
      container.innerHTML = '<div class="empty-state">No tasks found.</div>';
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
        showToast(done ? 'Task reopened' : 'Task complete!');
        loadTasks();
      });
      card.querySelector('.del-btn')?.addEventListener('click', async (e) => {
        if (!confirm('Delete?')) return;
        await fetch(`/api/tasks/${e.currentTarget.dataset.id}`, { method: 'DELETE' });
        showToast('Deleted', 'error');
        loadTasks();
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

loadTasks();