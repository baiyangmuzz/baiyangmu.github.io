/* baiyangmu.ccwu.cc — 交互脚本
   改了文案只需要动 index.html，这里不用动 */

(() => {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- 粒子星座背景 ---------- */

  const canvas = document.getElementById('fx');
  if (canvas) {
    const ctx = canvas.getContext('2d', { alpha: true });
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let w = 0, h = 0, nodes = [], raf = 0;

    const mouse = { x: -9999, y: -9999 };

    function size() {
      w = innerWidth;
      h = innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 屏幕越大粒子越多，但控制在 ~90 以内保证帧率
      const count = Math.round(clamp((w * h) / 20000, 34, 90));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - .5) * .28,
        vy: (Math.random() - .5) * .28,
        r: Math.random() * 1.5 + .5
      }));
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        // 鼠标附近的点会被轻轻推开
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 22500 && d2 > 0.01) {
          const f = (150 - Math.sqrt(d2)) / 150 * .6;
          n.x += dx / Math.sqrt(d2) * f;
          n.y += dy / Math.sqrt(d2) * f;
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, 6.2832);
        ctx.fillStyle = 'rgba(0,229,255,.65)';
        ctx.fill();
      }

      // 近距离连线
      const LINK = 132;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist > LINK) continue;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(0,229,255,${(1 - dist / LINK) * .22})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(frame);
    }

    size();
    addEventListener('resize', () => {
      size();
      if (reduce) { cancelAnimationFrame(raf); ctx.clearRect(0, 0, w, h); }
    }, { passive: true });

    addEventListener('pointermove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    addEventListener('pointerleave', () => {
      mouse.x = mouse.y = -9999;
    });

    if (reduce) {
      // 关闭动画时也画一帧静态的，避免画布空白
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, 6.2832);
        ctx.fillStyle = 'rgba(0,229,255,.5)';
        ctx.fill();
      }
    } else {
      frame();
    }
  }

  /* ---------- 自定义光标 ---------- */

  const dot = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');

  if (dot && ring && matchMedia('(hover: hover)').matches && !reduce) {
    let tx = innerWidth / 2, ty = innerHeight / 2, rx = tx, ry = ty;

    addEventListener('pointermove', e => {
      tx = e.clientX;
      ty = e.clientY;
      dot.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%)`;

      const hot = e.target.closest('a, .card, .totop');
      ring.classList.toggle('hot', !!hot);
    }, { passive: true });

    (function follow() {
      rx += (tx - rx) * .16;
      ry += (ty - ry) * .16;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(follow);
    })();
  }

  /* ---------- 滚动进场 ---------- */

  const revealTargets = document.querySelectorAll('[data-rv]');

  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        setTimeout(() => entry.target.classList.add('in'), i * 70);
        obs.unobserve(entry.target);
      });
    }, { threshold: .15, rootMargin: '0px 0px -8% 0px' });

    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('in'));
  }

  /* ---------- 卡片 3D 倾斜 ---------- */

  if (!reduce && matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.tilt').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;

        card.style.setProperty('--mx', px * 100 + '%');
        card.style.setProperty('--my', py * 100 + '%');
        card.style.transform =
          `perspective(900px) rotateX(${(0.5 - py) * 9}deg) rotateY(${(px - 0.5) * 11}deg) translateY(-3px)`;
      });

      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- 打字机 ---------- */

  const typed = document.getElementById('typed');

  if (typed) {
    // ↓↓↓ 想改这里显示的文案 ↓↓↓
    const LINES = [
      '把想法变成能跑起来的东西。',
      '写代码，也写点没用的浪漫。',
      'Currently building something.'
    ];

    if (reduce) {
      typed.textContent = LINES[0];
    } else {
      let li = 0, ci = 0, back = false;

      (function type() {
        const full = LINES[li];

        if (back) {
          ci--;
          if (ci <= 0) { back = false; li = (li + 1) % LINES.length; }
        } else {
          ci++;
          if (ci > full.length) { back = true; }
        }

        typed.textContent = full.slice(0, ci);

        let wait = back ? 32 : 58 + Math.random() * 70;
        if (!back && ci === full.length) wait = 1700;
        setTimeout(type, wait);
      })();
    }
  }

  /* ---------- 时钟 / 上线时长 ---------- */

  const clock = document.getElementById('clock');
  const uptime = document.getElementById('uptime');
  const BOOT = new Date('2026-10-17T05:49:00Z').getTime();

  (function tick() {
    const now = Date.now();

    if (clock) {
      clock.textContent = new Date(now).toLocaleTimeString('zh-CN', { hour12: false });
    }

    if (uptime) {
      const d = Math.floor((now - BOOT) / 86400000);
      const h = Math.floor((now - BOOT) / 3600000) % 24;
      const m = Math.floor((now - BOOT) / 60000) % 60;
      uptime.textContent = d > 0 ? `${d}天 ${h}时` : `${h}时 ${m}分`;
    }
  })();

  setInterval(() => {
    if (clock) {
      clock.textContent = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    }
  }, 1000);

  /* ---------- 滚动进度 + 回到顶部 ---------- */

  const bar = document.getElementById('progressBar');
  const toTop = document.querySelector('.totop');

  function onScroll() {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;

    if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    if (toTop) toTop.classList.toggle('show', y > 420);
  }

  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 年份 ---------- */

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
