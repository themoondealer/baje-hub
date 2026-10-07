/* هستهٔ برنامه: ورود، ناوبری، ذخیره، کشیدن و رها کردن */
(function (H) {
  const { $, $$, esc, fa, ic, S, U } = Object.assign({}, H, { S: H.S, U: H.U });
  const app = H.app = {};
  const NAV = [['dash', 'داشبورد', 'home'], ['board', 'تخته', 'board'], ['cal', 'تقویم', 'cal'], ['list', 'فهرست', 'list'], ['stats', 'آمار', 'chart'], ['settings', 'تنظیمات', 'settings']];
  const TITLES = { dash: 'داشبورد', board: 'تخته محتوا', cal: 'تقویم انتشار', list: 'فهرست پست‌ها', stats: 'آمار و نتیجه', settings: 'تنظیمات' };
  const MOBILE = [['dash', 'خانه', 'home'], ['board', 'تخته', 'board'], ['cal', 'تقویم', 'cal'], ['stats', 'آمار', 'chart'], ['settings', 'بیشتر', 'settings']];

  const applyTheme = () => { const t = S.settings.theme; if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t); };
  const setSync = (k, txt) => { const s = $('#sync'); if (!s) return; s.className = 'sync ' + k; s.innerHTML = `<i></i><span>${txt}</span>`; };

  app.render = () => {
    const pend = H.isBoss() ? S.posts.filter(p => p.stage === 'boss').length : 0;
    const on = k => k === 'list' ? (U.tab === 'board' && U.mode === 'list') : k === 'board' ? (U.tab === 'board' && U.mode !== 'list') : U.tab === k;
    $('#side-nav').innerHTML = NAV.map(([k, n, i]) => `<button class="nav ${on(k) ? 'on' : ''}" data-act="go" data-tab="${k}">${ic(i, 20)}${n}${k === 'board' && pend ? `<span class="bd">${fa(pend)}</span>` : ''}</button>`).join('');
    $('#tabbar').innerHTML = MOBILE.map(([k, n, i]) => `<button class="${on(k) ? 'on' : ''}" data-act="go" data-tab="${k}">${ic(i, 22)}${n}</button>`).join('');
    $('#title').textContent = U.tab === 'board' && U.mode === 'list' ? TITLES.list : TITLES[U.tab];
    $('#me').innerHTML = `<span class="av">${esc(H.initials(S.user))}</span><div><b>${esc(S.user || '—')}</b><small>${H.isBoss() ? 'رئیس' : 'عضو تیم'}</small></div>`;
    $('#demobar').hidden = S.mode !== 'demo';
    const q = $('#q'); if (q && q.value !== U.q) q.value = U.q;
    const keep = $('.page').scrollTop;
    $('#page').innerHTML = (H.views[U.tab] || H.views.dash)();
    $('.page').scrollTop = keep;
    if (U.tab === 'settings') { if (S.info && $('#rs')) $('#rs').innerHTML = H.views.sizeHtml(S.info); else app.loadInfo(); }
  };
  app.enter = () => {
    const p = $('#page'); p.classList.remove('enter'); void p.offsetWidth; p.classList.add('enter');
    $$('.hero,.kpi,.week,.panel,.cc,.col,.row,.day,.seg,.filters', p).forEach((el, i) => el.style.setProperty('--i', Math.min(i, 14)));
    H.animateCounts(p); clearTimeout(app.enter.h); app.enter.h = setTimeout(() => p.classList.remove('enter'), 1000);
  };
  app.go = (tab, keepMode) => {
    if (tab === 'list') { U.tab = 'board'; U.mode = 'list'; } else { U.tab = tab; if (tab === 'board' && !keepMode) U.mode = 'board'; }
    history.replaceState(null, '', '#' + (U.tab === 'board' && U.mode === 'list' ? 'list' : U.tab)); app.render(); app.enter(); if (tab === 'stats') app.loadSite();
  };
  app.load = async (quiet) => {
    setSync('busy', 'در حال بارگذاری'); if (!quiet && !S.posts.length) $('#page').innerHTML = '<div class="sk"></div><div class="sk"></div><div class="sk"></div>';
    try { S.posts = await H.store.list(); setSync('', 'همگام'); app.render(); } catch (e) { setSync('bad', 'خطا'); H.toast(e.message, 5000, 'bad'); if (e.auth) app.logout(); else app.render(); }
  };
  app.loadInfo = async (warn) => {
    try {
      const i = await H.store.repoInfo(); S.info = i; const el = $('#rs'); if (el) el.innerHTML = H.views.sizeHtml(i);
      if (warn) { if (!i.private) H.toast('هشدار: مخزن داده عمومی است!', 9000, 'bad'); else if (i.kb > 716800) H.toast('حجم مخزن از ۷۰۰ مگابایت گذشته؛ تنظیمات را ببینید', 7000, 'bad'); }
    } catch (e) { const el = $('#rs'); if (el) el.innerHTML = '<p class="sub">اندازهٔ مخزن خوانده نشد.</p>'; }
  };
  app.loadSite = async () => { if (!S.settings.statsUrl) return; try { S.siteStats = await H.store.siteStats(); } catch (e) { S.siteStats = null; H.toast(e.message, 4000, 'bad'); } if (U.tab === 'stats') app.render(); };
  app.saveFrom = async (p) => {
    setSync('busy', 'در حال ذخیره');
    try { await H.store.save(p); const i = S.posts.findIndex(x => x.id === p.id); if (i >= 0) S.posts[i] = { ...S.posts[i], ...p }; else S.posts.push(p); H.toast('ذخیره شد ✓'); await app.load(true); }
    catch (e) { setSync('bad', 'خطا'); if (e.conflict) { H.toast(e.message, 5000, 'bad'); await app.load(true); } throw e; }
  };
  app.remove = async (p) => { for (const f of (p.attachments || [])) { try { await H.store.delFile(f); } catch (e) {} } await H.store.del(p); H.toast('حذف شد'); await app.load(true); };
  app.move = async (id, stage) => {
    const p = S.posts.find(x => x.id === id); if (!p || p.stage === stage) return;
    if (p.insurance && !p.legalApproved && (stage === 'ready' || stage === 'done')) return H.toast('این پست باید اول رئیس تأیید کند', 3500, 'bad');
    const old = p.stage; const np = { ...p, stage, history: [...(p.history || []), `${new Date().toLocaleString('fa-IR')} — ${S.user || 'ناشناس'}: ${H.stage(old).name} ← ${H.stage(stage).name}`] };
    p.stage = stage; app.render();
    try { await H.store.save(np); await app.load(true); H.toastAct('به «' + H.stage(stage).name + '» رفت', 'برگردان', () => app.move(id, old)); if (stage === 'done') H.confetti(); } catch (e) { p.stage = old; H.toast(e.message, 4500, 'bad'); await app.load(true); }
  };
  app.newPost = (due, stage) => { const p = H.blank(); if (due) p.due = due; if (stage) p.stage = stage; H.editor.open(p, true); };
  app.open = id => { const p = S.posts.find(x => x.id === id); if (p) H.editor.open(p, false); };

  /* ورود / خروج */
  const showApp = () => { $('#login').hidden = true; $('#shell').hidden = false; applyTheme(); const t = (location.hash || '').slice(1); if (TITLES[t]) { if (t === 'list') { U.tab = 'board'; U.mode = 'list'; } else U.tab = t; } app.render(); app.enter(); app.load(); app.loadSite(); app.loadInfo(true); };
  app.logout = () => { localStorage.removeItem('baje-hub-auth'); S.mode = null; S.posts = []; $('#shell').hidden = true; $('#login').hidden = false; };
  app.enterGithub = async (token, repo) => {
    S.mode = 'github'; S.token = token; S.repo = repo; S.user = await H.ghUser(); const cfg = await H.store.config(); S.boss = cfg.boss; S.bossUnset = !!cfg.unset;
    localStorage.setItem('baje-hub-auth', JSON.stringify({ token, repo })); showApp();
  };


  /* پالت دستور: Ctrl/⌘ + K */
  app.palette = () => {
    const host = $('#palette'); const closeP = () => { host.hidden = true; host.innerHTML = ''; }; if (!host.hidden) return closeP();
    host.hidden = false; let idx = 0, items = [];
    const acts = () => [
      { n: 'پست جدید', i: 'plus', k: 'n', run: () => app.newPost() },
      ...[['dash', 'داشبورد', 'home'], ['board', 'تخته', 'board'], ['cal', 'تقویم', 'cal'], ['list', 'فهرست', 'list'], ['stats', 'آمار', 'chart'], ['settings', 'تنظیمات', 'settings']].map(([t, n, i]) => ({ n: 'رفتن به ' + n, i, run: () => app.go(t) })),
      { n: 'تغییر پوسته (روشن/تیره)', i: 'moon', run: () => { S.settings.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; H.saveSettings(); applyTheme(); app.render(); } },
      { n: 'به‌روزرسانی داده‌ها', i: 'refresh', run: () => app.load() },
      { n: 'دانلود پشتیبان', i: 'download', run: () => $('[data-act=export]') ? $('[data-act=export]').click() : H.download('baje-posts-' + H.todayISO() + '.json', JSON.stringify(S.posts.map(p => { const c = { ...p }; delete c._sha; return c; }), null, 2)) }];
    const draw = () => {
      const q = $('#pq').value.trim();
      const a = acts().filter(x => !q || x.n.includes(q));
      const ps = S.posts.filter(p => !q || (p.title + ' ' + p.slug + ' ' + p.assignee).includes(q)).slice(0, 8).map(p => ({ n: p.title || 'بدون عنوان', i: 'file', sub: H.stage(p.stage).name + ' · ' + H.fmtDue(p.due), run: () => app.open(p.id) }));
      items = [...(q ? ps : []), ...a, ...(q ? [] : ps)];
      idx = Math.min(idx, Math.max(0, items.length - 1));
      $('#plist').innerHTML = items.length ? items.map((x, k) => `<button class="pi ${k === idx ? 'on' : ''}" data-k="${k}">${ic(x.i, 18)}<span>${esc(x.n)}${x.sub ? `<small>${esc(x.sub)}</small>` : ''}</span></button>`).join('') : '<div class="empty" style="padding:18px">چیزی پیدا نشد</div>';
    };
    host.innerHTML = '<div class="pscrim" data-p="close"></div><div class="pbox" role="dialog" aria-label="جستجوی سریع"><div class="pin">' + ic('search', 20) + '<input id="pq" placeholder="پست یا دستور را بنویسید…" autocomplete="off"><kbd>Esc</kbd></div><div id="plist"></div></div>';
    host.onclick = e => { const b = e.target.closest('.pi'); if (b) { const it = items[+b.dataset.k]; closeP(); it.run(); } else if (e.target.dataset.p === 'close') closeP(); };
    host.oninput = () => { idx = 0; draw(); };
    host.onkeydown = e => {
      if (e.key === 'Escape') closeP();
      else if (e.key === 'ArrowDown') { e.preventDefault(); idx = (idx + 1) % Math.max(1, items.length); draw(); $('.pi.on') && $('.pi.on').scrollIntoView({ block: 'nearest' }); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); idx = (idx - 1 + items.length) % Math.max(1, items.length); draw(); $('.pi.on') && $('.pi.on').scrollIntoView({ block: 'nearest' }); }
      else if (e.key === 'Enter' && items[idx]) { e.preventDefault(); const it = items[idx]; closeP(); it.run(); }
    };
    draw(); $('#pq').focus();
  };
  document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && S.mode) { e.preventDefault(); if (!H.editor.w) app.palette(); } });

  /* رویدادها */
  document.addEventListener('click', async e => {
    const el = e.target.closest('[data-act]'); if (!el || !S.mode) return; const a = el.dataset.act;
    if (a === 'open') { e.stopPropagation(); return app.open(el.dataset.id); }
    if (a === 'next') { e.stopPropagation(); const p = S.posts.find(x => x.id === el.dataset.id); const i = H.STAGES.findIndex(s => s.id === p.stage); return app.move(p.id, H.STAGES[i + 1].id); }
    if (a === 'go') return app.go(el.dataset.tab);
    if (a === 'stage') { U.f.stage = el.dataset.stage; U.mode = 'list'; return app.go('board', true); }
    if (a === 'new') return app.newPost();
    if (a === 'newin') { e.stopPropagation(); return app.newPost(null, el.dataset.stage); }
    if (a === 'palette') return app.palette();
    if (a === 'day') return app.newPost(el.dataset.day + 'T13:00');
    if (a === 'mode') { U.mode = el.dataset.m; return app.render(); }
    if (a === 'cprev' || a === 'cnext') { const d = a === 'cnext' ? 1 : -1; let { y, m } = U.cal; m += d; if (m > 12) { m = 1; y++; } if (m < 1) { m = 12; y--; } U.cal = { y, m }; return app.render(); }
    if (a === 'ctoday') { U.cal = null; return app.render(); }
    if (a === 'tbl') { const c = el.closest('.cc'); const t = $('.ct', c), v = $('.cv', c); t.hidden = !t.hidden; v.hidden = !t.hidden; return; }
    if (a === 'theme') { S.settings.theme = el.dataset.t; H.saveSettings(); applyTheme(); return app.render(); }
    if (a === 'logout') return app.logout();
    if (a === 'export') return H.download('baje-posts-' + H.todayISO() + '.json', JSON.stringify(S.posts.map(p => { const c = { ...p }; delete c._sha; return c; }), null, 2));
    if (a === 'savesite') { S.settings.siteUrl = $('#s-site').value.trim() || 'https://baje724.ir'; S.settings.statsUrl = $('#s-stats').value.trim(); H.saveSettings(); S.siteStats = null; if (!S.settings.statsUrl) return H.toast('نشانی سایت ذخیره شد'); try { S.siteStats = await H.store.siteStats(); H.toast('اتصال برقرار شد ✓'); } catch (x) { H.toast(x.message, 5000, 'bad'); } return; }
    if (a === 'savebossn') { const l = $('#s-boss').value.split(/[,،\s]+/).map(x => x.trim()).filter(Boolean); if (!l.length) return H.toast('حداقل یک نام کاربری لازم است', 3500, 'bad'); try { await H.store.saveConfig({ boss: l }); S.boss = l; S.bossUnset = false; H.toast('ذخیره شد ✓'); app.render(); } catch (x) { H.toast(x.message, 5000, 'bad'); } return; }
  });
  document.addEventListener('keydown', e => { const el = e.target; if ((e.key === 'Enter' || e.key === ' ') && el.matches && el.matches('.card[data-act=open]')) { e.preventDefault(); app.open(el.dataset.id); } });
  document.addEventListener('input', e => { if (e.target.id === 'q') { U.q = e.target.value; const pos = e.target.selectionStart; if (U.tab === 'dash' || U.tab === 'settings' || U.tab === 'stats') { U.tab = 'board'; U.mode = 'list'; } app.render(); const q = $('#q'); q.focus(); q.setSelectionRange(pos, pos); } });
  document.addEventListener('change', e => { const f = e.target.dataset.f; if (f !== undefined) { U.f[f] = e.target.value; app.render(); } });
  /* کشیدن و رها کردن */
  document.addEventListener('dragstart', e => { const c = e.target.closest && e.target.closest('.card[draggable]'); if (!c) return; e.dataTransfer.setData('text/plain', c.dataset.id); e.dataTransfer.effectAllowed = 'move'; c.classList.add('drag'); });
  document.addEventListener('dragend', e => { document.querySelectorAll('.drag,.over').forEach(x => x.classList.remove('drag', 'over')); });
  document.addEventListener('dragover', e => { const c = e.target.closest && e.target.closest('.col'); if (c) { e.preventDefault(); document.querySelectorAll('.col.over').forEach(x => x !== c && x.classList.remove('over')); c.classList.add('over'); } });
  document.addEventListener('drop', e => { const c = e.target.closest && e.target.closest('.col'); if (!c) return; e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); c.classList.remove('over'); app.move(id, c.dataset.stage); });
  document.addEventListener('keydown', e => { if (H.editor.w || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; if (e.key === 'n' && S.mode) { e.preventDefault(); app.newPost(); } if (e.key === '/' && S.mode) { e.preventDefault(); $('#q').focus(); } });
  window.addEventListener('hashchange', () => { const t = location.hash.slice(1); if (S.mode && TITLES[t]) app.go(t); });
  $('#refresh').onclick = () => app.load().then(() => app.loadSite());
  $('#newbtn').onclick = () => app.newPost();
  $('#fab').onclick = () => app.newPost();
  $('#lgo').onclick = async () => {
    const x = $('#lerr'); x.hidden = true; const repo = $('#lrepo').value.trim(), tok = $('#ltok').value.trim();
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo) || !tok) { x.textContent = 'مخزن را مثل owner/repo و توکن را وارد کنید'; x.hidden = false; return; }
    $('#lgo').disabled = true; try { await app.enterGithub(tok, repo); } catch (e) { x.textContent = e.message; x.hidden = false; } $('#lgo').disabled = false;
  };
  $('#ldemo').onclick = () => { S.mode = 'demo'; S.user = 'نمونه'; showApp(); };
  applyTheme();
  (async () => {
    const p = new URLSearchParams(location.search);
    if (p.has('demo')) { S.mode = 'demo'; S.user = 'نمونه'; return showApp(); }
    try { const a = JSON.parse(localStorage.getItem('baje-hub-auth') || 'null'); if (a) { await app.enterGithub(a.token, a.repo); return; } } catch (e) {}
    $('#login').hidden = false;
  })();
})(window.H);
