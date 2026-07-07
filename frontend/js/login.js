if (localStorage.getItem('tms_user')) window.location.href = 'dashboard.html';

const messages = [
  'Authenticate to access the system...',
  'Manage tasks. Track progress. Lead teams.',
  'Mission Control is ready for you.'
];
let mIdx = 0, cIdx = 0, deleting = false;
const typingEl = document.getElementById('typingText');

function escT(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }

function typeLoop() {
  const msg = messages[mIdx];
  if (!deleting) {
    cIdx++;
    typingEl.innerHTML = escT(msg.slice(0, cIdx)) + '<span class="cursor-blink"></span>';
    if (cIdx === msg.length) { deleting = true; setTimeout(typeLoop, 1800); return; }
  } else {
    cIdx--;
    typingEl.innerHTML = escT(msg.slice(0, cIdx)) + '<span class="cursor-blink"></span>';
    if (cIdx === 0) { deleting = false; mIdx = (mIdx + 1) % messages.length; }
  }
  setTimeout(typeLoop, deleting ? 35 : 65);
}
typeLoop();

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('loginError');
  errEl.classList.add('hidden');
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const btn = document.getElementById('loginBtn');
  btn.innerHTML = '<span>AUTHENTICATING...</span>';
  btn.disabled = true;

  try {
    const res  = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      errEl.textContent = data.error || 'Authentication failed';
      errEl.classList.remove('hidden');
      btn.innerHTML = '<span>INITIATE LOGIN</span>';
      btn.disabled = false;
      return;
    }
    localStorage.setItem('tms_user', JSON.stringify(data.user));
    if (data.employee) localStorage.setItem('tms_employee', JSON.stringify(data.employee));
    btn.innerHTML = '<span>ACCESS GRANTED</span>';
    btn.style.background = 'linear-gradient(135deg,#00e676,#00c853)';
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 700);
  } catch {
    errEl.textContent = 'Cannot reach server. Is it running on port 8000?';
    errEl.classList.remove('hidden');
    btn.innerHTML = '<span>INITIATE LOGIN</span>';
    btn.disabled = false;
  }
});