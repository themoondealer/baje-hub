/* ابزارهای پایه: DOM، رشته، آیکن، پیام، تاریخ امروز به وقت تهران */
window.H = window.H || {};
(function (H) {
  H.$ = (s, r = document) => r.querySelector(s);
  H.$$ = (s, r = document) => [...r.querySelectorAll(s)];
  H.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  H.fa = n => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
  H.en = s => String(s).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  H.num = n => (n === null || n === undefined || n === '' || isNaN(n)) ? '—' : H.fa(Number(n).toLocaleString('en-US'));
  H.debounce = (f, ms = 200) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => f(...a), ms); }; };
  H.initials = n => (String(n || '؟').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('') || '؟');
  H.download = (name, text) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };

  /* آیکن‌های خطی */
  const P = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    board: '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="10" rx="1.5"/><rect x="17" y="4" width="4" height="13" rx="1.5"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
    chart: '<path d="M4 20V4"/><path d="M4 20h17"/><path d="M8 16v-5M12 16V8M16 16v-3"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    left: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    right: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    chevL: '<path d="M15 6l-6 6 6 6"/>',
    chevR: '<path d="M9 6l6 6-6 6"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z"/><path d="M9 12l2 2 4-4"/>',
    alert: '<path d="M10.3 4.2 2.6 17.6A2 2 0 0 0 4.3 20.6h15.4a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z"/><path d="M12 9.5v4M12 17h.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.8"/><path d="M17 14.2a5.5 5.5 0 0 1 4.5 5.3"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    download: '<path d="M12 4v11M7 11l5 5 5-5"/><path d="M4 20h16"/>',
    trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5"/>',
    send: '<path d="M21 3L10 14"/><path d="M21 3l-7 18-4-8-8-4 19-6Z"/>',
    grip: '<circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/>',
    table: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 10h18M9 10v10"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>',
    bookmark: '<path d="M18 21l-6-4-6 4V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16Z"/>',
    cursor: '<path d="M5 3l14 8-6 2-2 6L5 3Z"/>'
  };
  H.ic = (n, s = 20, sw = 1.8) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;

  /* پیام موقت */
  H.toast = (m, ms = 2600, kind = '') => {
    const t = H.$('#toast'); t.textContent = m; t.className = 'toast ' + kind; t.hidden = false;
    clearTimeout(H.toast.h); H.toast.h = setTimeout(() => { t.hidden = true; }, ms);
  };

  /* امروز به وقت تهران و فاصلهٔ روز */
  H.todayISO = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran' }).format(new Date());
  const dayNum = iso => Math.round(Date.parse(iso.slice(0, 10) + 'T00:00:00Z') / 864e5);
  H.diffDays = (a, b) => dayNum(a) - dayNum(b);
  H.relDay = iso => {
    if (!iso) return '';
    const d = H.diffDays(iso, H.todayISO());
    if (d === 0) return 'امروز'; if (d === 1) return 'فردا'; if (d === -1) return 'دیروز';
    return d > 0 ? H.fa(d) + ' روز دیگر' : H.fa(-d) + ' روز پیش';
  };

  /* پیام با دکمهٔ عمل (مثلاً «برگردان») */
  H.toastAct = (m, label, fn, ms = 6500) => {
    const t = H.$('#toast'); t.className = 'toast act'; t.hidden = false; t.textContent = '';
    const s = document.createElement('span'); s.textContent = m; const b = document.createElement('button'); b.textContent = label;
    b.onclick = () => { t.hidden = true; fn(); }; t.append(s, b);
    clearTimeout(H.toast.h); H.toast.h = setTimeout(() => { t.hidden = true; }, ms);
  };
  /* آمادگی پست: چه چیزی هنوز کم است */
  /* شمارندهٔ متحرک اعداد داشبورد */
  H.animateCounts = (root) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    H.$$('[data-count]', root).forEach(el => {
      const to = +el.dataset.count; if (!to) return; const t0 = performance.now(), D = 650;
      const tick = now => { const k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 3); el.textContent = H.fa(Math.round(to * e)); if (k < 1) requestAnimationFrame(tick); };
      el.textContent = H.fa(0); requestAnimationFrame(tick);
    });
  };
  /* آتش‌بازی کوچک هنگام «منتشر شد» */
  H.confetti = (x, y) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = document.createElement('canvas'); c.width = innerWidth; c.height = innerHeight; c.style.cssText = 'position:fixed;inset:0;z-index:95;pointer-events:none';
    document.body.appendChild(c); const g = c.getContext('2d'), cols = ['#2F4FE0', '#7F95FF', '#1FA971', '#E8A100', '#FF4D5E', '#0E1020'];
    x = x ?? innerWidth / 2; y = y ?? innerHeight / 3;
    const P = Array.from({ length: 70 }, () => ({ x, y, vx: (Math.random() - .5) * 11, vy: -Math.random() * 11 - 3, r: Math.random() * 5 + 3, c: cols[Math.random() * cols.length | 0], a: Math.random() * 6, va: (Math.random() - .5) * .4 }));
    let f = 0; (function step() { g.clearRect(0, 0, c.width, c.height); P.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .35; p.vx *= .99; p.a += p.va; g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.c; g.globalAlpha = Math.max(0, 1 - f / 80); g.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); g.restore(); }); if (++f < 85) requestAnimationFrame(step); else c.remove(); })();
  };
  /* حالت خالی با آیکن بزرگ */
  H.empty = (icon, text, cta) => `<div class="empty"><span class="eb">${H.ic(icon, 30, 1.6)}</span><p>${text}</p>${cta || ''}</div>`;
})(window.H);
