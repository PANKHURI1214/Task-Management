(function () {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, stars = [], mouse = { x: 0, y: 0 };
  const COUNT = 140;

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }

  function randomStar() {
    return { x: Math.random()*W, y: Math.random()*H, r: Math.random()*1.5+0.3,
      vx: (Math.random()-0.5)*0.18, vy: (Math.random()-0.5)*0.18,
      alpha: Math.random()*0.6+0.2, flicker: Math.random()*0.015+0.005, flickerDir: 1 };
  }

  function init() { resize(); stars = Array.from({ length: COUNT }, randomStar); }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      s.alpha += s.flicker * s.flickerDir;
      if (s.alpha > 0.85 || s.alpha < 0.1) s.flickerDir *= -1;
      const dx = mouse.x - s.x, dy = mouse.y - s.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 180) { s.vx += dx*0.00004; s.vy += dy*0.00004; }
      const speed = Math.sqrt(s.vx*s.vx + s.vy*s.vy);
      if (speed > 0.4) { s.vx *= 0.97; s.vy *= 0.97; }
      s.x += s.vx; s.y += s.vy;
      if (s.x < 0) s.x = W; if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H; if (s.y > H) s.y = 0;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(180,160,255,${s.alpha})`;
      ctx.fill();
    });
    for (let i = 0; i < stars.length; i++) {
      for (let j = i+1; j < stars.length; j++) {
        const dx = stars[i].x-stars[j].x, dy = stars[i].y-stars[j].y;
        const d = Math.sqrt(dx*dx+dy*dy);
        if (d < 90) {
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.strokeStyle = `rgba(124,58,237,${0.18*(1-d/90)})`;
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  init(); draw();
})();