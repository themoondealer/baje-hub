/* صفحه‌ها: داشبورد، تخته، تقویم، فهرست، آمار، تنظیمات */
(function (H) {
  const { esc, fa, ic, S } = Object.assign({}, H, { S: H.S });
  const V = H.views = {};
  const ST = H.STAGES, ABBR = { instagram: 'IG', facebook: 'FB', youtube: 'YT', telegram: 'TG', linkedin: 'LI', aparat: 'AP' };
  const U = { tab: 'dash', mode: 'board', q: '', f: { stage: '', channel: '', assignee: '' }, cal: null };
  H.U = U;
  const match = p => {
    const q = U.q.trim();
    if (q && !(p.title + ' ' + p.assignee + ' ' + p.caption + ' ' + p.slug).includes(q)) return false;
    if (U.f.stage && p.stage !== U.f.stage) return false;
    if (U.f.channel && !p.channels.includes(U.f.channel)) return false;
    if (U.f.assignee && p.assignee !== U.f.assignee) return false;
    return true;
  };
  const byDue = a => [...a].sort((x, y) => (x.due || '9').localeCompare(y.due || '9'));
  const today = () => H.todayISO();
  const late = p => p.due && p.stage !== 'done' && H.diffDays(p.due, today()) < 0;
  const needsBoss = p => p.insurance && !p.legalApproved && p.stage !== 'done' && p.stage !== 'idea';
  H.needsBoss = needsBoss;

  const ring = p => {
    const r = H.ready(p), R = 11, C = 2 * Math.PI * R, off = C * (1 - r.pct / 100), ok = r.pct === 100;
    const tip = ok ? 'آمادهٔ انتشار از نظر محتوا' : 'کم است: ' + r.missing.map(x => x.n).join('، ');
    return `<span class="rg ${ok ? 'ok' : ''}" title="${esc(tip)}" aria-label="${esc(tip)}"><svg width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="${R}" class="rb"/><circle cx="15" cy="15" r="${R}" class="rf" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 15 15)"/></svg><b>${ok ? ic('check', 11, 3) : fa(r.done)}</b></span>`;
  };
  const chDots = p => `<span class="chs">${p.channels.map(c => `<span class="chd" title="${esc(c)}">${ABBR[H.chKey(c)] || esc(c[0])}</span>`).join('')}</span>`;
  const card = (p, drag) => {
    const st = H.stage(p.stage), idx = ST.findIndex(s => s.id === p.stage), nx = ST[idx + 1];
    return `<div class="card ${p.insurance ? 'ins' : ''}" ${drag ? 'draggable="true"' : ''} role="button" tabindex="0" data-act="open" data-id="${esc(p.id)}">
      <div class="t"><span>${esc(p.title || 'بدون عنوان')}</span>${p.stage !== 'done' ? ring(p) : ''}</div>
      <div class="m"><span class="${late(p) ? 'late' : ''}">${ic('clock', 13)} ${esc(H.fmtDue(p.due))}${p.due ? ' · ' + H.relDay(p.due) : ''}</span>
        ${p.insurance ? `<span class="pill ${p.legalApproved ? 'o' : 'w'}">${ic('shield', 12)}${p.legalApproved ? 'تأیید رئیس' : 'نیاز به تأیید رئیس'}</span>` : ''}</div>
      <div class="f">${chDots(p)}${p.formats.map(f => `<span class="pill">${esc(f)}</span>`).join('')}
        ${p.assignee ? `<span class="av" style="width:26px;height:26px;font-size:10px" title="${esc(p.assignee)}">${esc(H.initials(p.assignee))}</span>` : ''}
        ${nx && p.stage !== 'done' ? `<button class="go" data-act="next" data-id="${esc(p.id)}" title="برو به «${nx.name}»" aria-label="مرحلهٔ بعد">${ic('chevR', 16, 2.2)}</button>` : ''}</div></div>`;
  };
  const row = p => { const j = p.due ? H.isoToJ(p.due) : null; return `<button class="row" data-act="open" data-id="${esc(p.id)}"><span class="dt">${j ? `<b>${fa(j.d)}</b><small>${H.MONTHS[j.m - 1]}</small>` : '<b>—</b><small>بدون تاریخ</small>'}</span>
    <span class="tx"><b>${esc(p.title || 'بدون عنوان')}</b><small>${esc(H.fmtDue(p.due))}${p.due ? ' · ' + H.relDay(p.due) : ''} · ${esc(p.channels.join('، ') || 'بدون شبکه')}</small></span>
    <span class="pill" style="background:${H.stage(p.stage).color}22;color:${H.stage(p.stage).color === '#0E1020' ? 'var(--ink)' : H.stage(p.stage).color}"><i style="background:${H.stage(p.stage).color}"></i>${H.stage(p.stage).name}</span></button>`; };

  /* ---------- داشبورد ---------- */
  V.dash = () => {
    const P = S.posts, t = today(), boss = H.isBoss();
    const open = P.filter(p => p.stage !== 'done');
    const week = open.filter(p => p.due && H.diffDays(p.due, t) >= 0 && H.diffDays(p.due, t) < 7);
    const wait = P.filter(p => p.stage === 'boss'), ready = P.filter(p => p.stage === 'ready');
    const mk = H.monthKey(t), pubMonth = P.filter(p => p.stage === 'done' && p.due && H.monthKey(p.due) === mk);
    const upcoming = byDue(open.filter(p => p.due && H.diffDays(p.due, t) >= 0)).slice(0, 5);
    const attn = [];
    P.filter(late).forEach(p => attn.push({ p, k: 'w', t: 'از موعد گذشته: ' + H.relDay(p.due) }));
    P.filter(p => p.stage === 'boss').forEach(p => attn.push({ p, k: 'a', t: boss ? 'منتظر تأیید شماست' : 'منتظر تأیید رئیس' }));
    P.filter(p => p.stage === 'ready' && !p.caption.trim()).forEach(p => attn.push({ p, k: 'w', t: 'آماده انتشار ولی کپشن ندارد' }));
    P.filter(p => !p.due && p.stage !== 'done').forEach(p => attn.push({ p, k: 'a', t: 'تاریخ انتشار ندارد' }));
    const seqc = ['#C9D3FF', '#A5B6FF', '#7F95FF', '#5A78FF', '#2F4FE0', '#1B2E9E'];
    const hour = +new Intl.DateTimeFormat('en', { hour: 'numeric', hour12: false, timeZone: 'Asia/Tehran' }).format(new Date());
    const hello = hour < 12 ? 'صبح بخیر' : hour < 18 ? 'روز بخیر' : 'عصر بخیر';
    const tj = H.isoToJ(t), nextP = upcoming[0];
    /* نوار هفته: ۷ روز از امروز */
    const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(Date.parse(t + 'T00:00:00Z') + i * 864e5), iso = H.isoDate(d); return { iso, j: H.toJ(d), dow: H.DOW_FULL[H.dowIndex(d)], ev: byDue(P.filter(p => p.due && p.due.slice(0, 10) === iso)), fri: H.dowIndex(d) === 6 }; });
    const spark7 = days.map(d => d.ev.length);
    const spark8 = Array.from({ length: 8 }, (_, w) => P.filter(p => p.stage === 'done' && p.due && (() => { const dd = H.diffDays(t, p.due); return dd >= w * 7 && dd < (w + 1) * 7; })()).length).reverse();
    const kpi = (cls, act, attr, icon, label, val, spark) => `<button class="kpi ${cls}" data-act="${act}" ${attr}><span class="l">${ic(icon, 17)}${label}</span><span class="v" data-count="${val}">${fa(val)}</span>${spark ? `<span class="spk">${H.charts.spark(spark)}</span>` : ''}</button>`;
    return `<div class="hero"><div class="hx"><h2>${hello}${S.user ? '، ' + esc(S.user) : ''} 👋</h2><p>${week.length ? `${fa(week.length)} پست در ${fa(7)} روز آینده برنامه دارید.` : 'این هفته پستی برنامه‌ریزی نشده.'}${wait.length ? ` ${fa(wait.length)} مورد منتظر تأیید رئیس است.` : ''}</p>
      <div class="hb"><button class="btn" data-act="new">${ic('plus', 18, 2.2)} پست جدید</button><button class="btn ghost" data-act="palette">${ic('search', 16)} جستجوی سریع <kbd>${/Mac/.test(navigator.platform) ? '⌘K' : 'Ctrl K'}</kbd></button></div></div>
      <div class="hv" aria-hidden="true"><span class="hs s3"></span><span class="hs s2"></span><div class="hc"><i></i><i></i><b>${fa(tj.d)}</b><small>${H.MONTHS[tj.m - 1]}</small></div>${nextP ? `<div class="htag"><i></i>${esc(nextP.title.length > 22 ? nextP.title.slice(0, 22) + '…' : nextP.title)}<small>${H.relDay(nextP.due)}</small></div>` : ''}</div></div>
    <div class="kpis">
      ${kpi('', 'go', 'data-tab="cal"', 'cal', '۷ روز آینده', week.length, spark7)}
      ${kpi(wait.length ? 'w' : '', 'stage', 'data-stage="boss"', 'shield', 'منتظر تأیید رئیس', wait.length)}
      ${kpi('', 'stage', 'data-stage="ready"', 'send', 'آماده انتشار', ready.length)}
      ${kpi('', 'go', 'data-tab="stats"', 'check', 'منتشرشده در این ماه', pubMonth.length, spark8)}</div>
    <div class="week" role="list" aria-label="هفتهٔ پیش‌رو">${days.map((d, i) => `<button class="wd ${i === 0 ? 'today' : ''} ${d.fri ? 'fri' : ''}" role="listitem" data-act="${d.ev.length === 1 ? 'open' : 'day'}" ${d.ev.length === 1 ? `data-id="${esc(d.ev[0].id)}"` : `data-day="${d.iso}"`}><small>${i === 0 ? 'امروز' : d.dow}</small><b>${fa(d.j.d)}</b><span class="dots">${d.ev.slice(0, 4).map(p => `<i style="background:${H.stage(p.stage).color}" title="${esc(p.title)}"></i>`).join('') || '<i class="no"></i>'}</span></button>`).join('')}</div>
    <div class="grid2"><div class="panel"><h3>${ic('clock', 18)}پست‌های بعدی</h3>${upcoming.length ? upcoming.map(row).join('') : H.empty('cal', 'پستی در راه نیست.', '<button class="btn s sm" data-act="new">+ پست جدید</button>')}</div>
      <div class="panel"><h3>${ic('alert', 18)}نیاز به اقدام</h3>${attn.length ? attn.slice(0, 7).map(a => `<button class="row" data-act="open" data-id="${esc(a.p.id)}"><span class="tx"><b>${esc(a.p.title || 'بدون عنوان')}</b><small>${esc(a.t)}</small></span><span class="pill ${a.k}">${a.k === 'w' ? 'فوری' : 'پیگیری'}</span></button>`).join('') : H.empty('check', 'همه‌چیز مرتب است.')}</div></div>
    <div class="panel" style="margin-top:14px"><h3>${ic('board', 18)}وضعیت خط تولید</h3>${H.charts.stack(ST.map((s, i) => ({ label: s.name, value: P.filter(p => p.stage === s.id).length, color: seqc[i] })))}</div>`;
  };

  /* ---------- تخته و فهرست ---------- */
  const filters = () => {
    const as = [...new Set(S.posts.map(p => p.assignee).filter(Boolean))];
    const sel = (k, opts, ph) => `<select class="in" data-f="${k}" aria-label="${ph}"><option value="">${ph}</option>${opts.map(o => `<option value="${esc(o.v)}" ${U.f[k] === o.v ? 'selected' : ''}>${esc(o.n)}</option>`).join('')}</select>`;
    return `<div class="filters"><div class="seg"><button class="${U.mode === 'board' ? 'on' : ''}" data-act="mode" data-m="board">تخته</button><button class="${U.mode === 'list' ? 'on' : ''}" data-act="mode" data-m="list">فهرست</button></div>
      ${sel('stage', ST.map(s => ({ v: s.id, n: s.name })), 'همهٔ مرحله‌ها')}${sel('channel', H.CHANNELS.map(c => ({ v: c.n, n: c.n })), 'همهٔ شبکه‌ها')}${as.length ? sel('assignee', as.map(a => ({ v: a, n: a })), 'همهٔ مسئول‌ها') : ''}</div>`;
  };
  V.board = () => {
    const P = S.posts.filter(match);
    if (U.mode === 'list') { const l = byDue(P); return filters() + `<div class="lt">${l.length ? l.map(row).join('') : H.empty('list', 'پستی پیدا نشد.', '<button class="btn s sm" data-act="new">+ پست جدید</button>')}</div>`; }
    return filters() + `<div class="board">${ST.map(s => { const l = byDue(P.filter(p => p.stage === s.id)); return `<div class="col" data-stage="${s.id}"><h3><i style="background:${s.color}"></i>${s.name}<span>${fa(l.length)}</span><button class="cadd" data-act="newin" data-stage="${s.id}" aria-label="افزودن به ${s.name}" title="افزودن به ${s.name}">${ic('plus', 15, 2.4)}</button></h3>${l.length ? l.map(p => card(p, true)).join('') : '<div class="empty" style="padding:14px">خالی</div>'}</div>`; }).join('')}</div>`;
  };
  

  /* ---------- تقویم ---------- */
  V.cal = () => {
    if (!U.cal) { const j = H.isoToJ(today()); U.cal = { y: j.y, m: j.m }; }
    const { y, m } = U.cal, first = H.fromJ(y, m, 1), len = H.monthLen(y, m), off = H.dowIndex(first), t = today();
    const by = {}; S.posts.filter(match).forEach(p => { if (p.due) (by[p.due.slice(0, 10)] = by[p.due.slice(0, 10)] || []).push(p); });
    let cells = ''; for (let i = 0; i < off; i++) cells += '<div class="day off"></div>';
    let ag = '';
    for (let d = 1; d <= len; d++) {
      const dt = H.fromJ(y, m, d), iso = H.isoDate(dt), ev = byDue(by[iso] || []), fri = H.dowIndex(dt) === 6;
      cells += `<div class="day ${iso === t ? 'today' : ''} ${fri ? 'fri' : ''}" data-act="day" data-day="${iso}"><span class="n">${fa(d)}</span>${ev.slice(0, 3).map(p => `<span class="e" data-act="open" data-id="${esc(p.id)}" style="background:${H.stage(p.stage).color}">${esc(p.title)}</span>`).join('')}${ev.length > 3 ? `<span class="cnt">+${fa(ev.length - 3)}</span>` : ''}</div>`;
      if (ev.length || iso === t) ag += `<div class="panel" style="padding:12px"><h3 style="font-size:14px;margin-bottom:6px">${esc(H.fmtFull(iso))}${iso === t ? ' <span class="pill">امروز</span>' : ''}<button class="mini" style="margin-inline-start:auto" data-act="day" data-day="${iso}">${ic('plus', 14)}افزودن</button></h3>${ev.map(row).join('') || '<div class="empty" style="padding:8px">پستی نیست</div>'}</div>`;
    }
    return `<div class="cal"><div class="nv"><button class="btn s sm" data-act="cnext" aria-label="ماه بعد">${ic('chevL', 16)}</button><b>${H.MONTHS[m - 1]} ${fa(y)}</b><button class="btn s sm" data-act="cprev" aria-label="ماه قبل">${ic('chevR', 16)}</button><button class="btn s sm" data-act="ctoday">امروز</button></div>
      <div class="g7">${H.DOW.map(d => `<div class="dow">${d}</div>`).join('')}${cells}</div><div class="agenda">${ag}</div></div>`;
  };

  /* ---------- آمار ---------- */
  V.stats = () => {
    const P = S.posts, done = P.filter(p => p.stage === 'done'), t = today(), site = S.siteStats;
    const sum = k => done.reduce((a, p) => { const v = H.sumMetric(p, k); return v === null ? a : (a === null ? v : a + v); }, null);
    const siteV = p => { const s = H.siteFor(p); return s ? s.visits : null; };
    const clicksOf = p => { const s = siteV(p); return s !== null ? s : H.sumMetric(p, 'linkClicks'); };
    const totalSite = site ? done.reduce((a, p) => a + (siteV(p) || 0), 0) : null;
    const signups = site ? done.reduce((a, p) => a + ((H.siteFor(p) || {}).signups || 0), 0) : null;
    /* ماه‌های اخیر */
    const j = H.isoToJ(t), months = []; let y = j.y, m = j.m; for (let i = 0; i < 6; i++) { months.unshift({ y, m }); m--; if (m < 1) { m = 12; y--; } }
    const perMonth = months.map(x => ({ label: H.MONTHS[x.m - 1], value: done.filter(p => p.due && H.monthKey(p.due) === x.y * 100 + x.m).length }));
    const topPosts = [...done].map(p => ({ label: p.title, value: clicksOf(p) || 0, p })).sort((a, b) => b.value - a.value).slice(0, 8);
    const chViews = H.CHANNELS.map(c => ({ label: c.n, value: done.reduce((a, p) => a + (((p.metrics || {})[c.n] || {}).views || 0), 0) })).filter(x => x.value > 0).sort((a, b) => b.value - a.value);
    const palette = ['var(--s1)', 'var(--s2)', 'var(--s3)', 'var(--s4)'];
    let chData = chViews.slice(0, 4).map((x, i) => ({ ...x, color: palette[i] }));
    if (chViews.length > 4) chData.push({ label: 'سایر', value: chViews.slice(4).reduce((a, x) => a + x.value, 0), color: 'var(--muted)' });
    const seqc = ['#C9D3FF', '#A5B6FF', '#7F95FF', '#5A78FF', '#2F4FE0', '#1B2E9E'];
    const siteNote = !S.settings.statsUrl ? `<div class="note">آمار سایت هنوز وصل نیست. با تنظیم «نشانی آمار سایت» در بخش تنظیمات، بازدید و ثبت‌نام هر پست از خود baje724.ir اینجا نشان داده می‌شود. راهنما: SITE-INTEGRATION.md</div>` : (site ? '' : `<div class="note">آمار سایت بارگذاری نشد. نشانی و دسترسی CORS را در تنظیمات بررسی کنید.</div>`);
    const kp = (l, v, i, sub) => `<div class="kpi"><span class="l">${ic(i, 17)}${l}</span><span class="v">${v}</span>${sub ? `<small class="sub">${sub}</small>` : ''}</div>`;
    const tbl = H.charts.table(['پست', 'تاریخ', 'بازدید', 'پسند', 'ذخیره', 'کلیک لینک', 'بازدید سایت', 'ثبت‌نام'], done.map(p => [p.title, H.fmtDay(p.due), H.num(H.sumMetric(p, 'views')), H.num(H.sumMetric(p, 'likes')), H.num(H.sumMetric(p, 'saves')), H.num(H.sumMetric(p, 'linkClicks')), site ? H.num(siteV(p)) : '—', site ? H.num((H.siteFor(p) || {}).signups) : '—']));
    let siteLine = '';
    if (site && Array.isArray(site.daily) && site.daily.length) { const d = site.daily.slice(-30); siteLine = H.charts.card('بازدید سایت از شبکه‌ها', '۳۰ روز اخیر، طبق آمار خود سایت', H.charts.line(d.map(x => ({ label: H.fmtDay(x.date), value: x.visits })), { unit: 'بازدید', aria: 'بازدید روزانهٔ سایت' }), H.charts.table(['روز', 'بازدید'], d.map(x => [H.fmtDay(x.date), H.num(x.visits)])), 'wide'); }
    return `<div class="kpis" style="margin-top:6px">${kp('پست منتشرشده', fa(done.length), 'check')}${kp('بازدید (ثبت‌شده)', H.num(sum('views')), 'eye', 'مجموع عددهای واردشده')}${kp('بازدید سایت', site ? H.num(totalSite) : '—', 'cursor', site ? 'از آمار سایت' : 'سایت وصل نیست')}${kp(site ? 'ثبت‌نام از پست‌ها' : 'دنبال‌کنندهٔ جدید', site ? H.num(signups) : H.num(sum('followers')), site ? 'users' : 'trend')}</div>${siteNote}
    <div class="cgrid">${H.charts.card('انتشار در ۶ ماه اخیر', 'تعداد پست‌های «منتشر شد» به تفکیک ماه شمسی', H.charts.barV(perMonth, { unit: 'پست', aria: 'تعداد انتشار ماهانه' }), H.charts.table(['ماه', 'تعداد'], perMonth.map(x => [x.label, H.num(x.value)])))}
    ${H.charts.card('وضعیت خط تولید', 'همهٔ پست‌ها بر اساس مرحله', H.charts.stack(ST.map((s, i) => ({ label: s.name, value: P.filter(p => p.stage === s.id).length, color: seqc[i] }))), H.charts.table(['مرحله', 'تعداد'], ST.map(s => [s.name, H.num(P.filter(p => p.stage === s.id).length)])))}
    ${H.charts.card(site ? 'بازدید سایت به‌ازای هر پست' : 'کلیک لینک به‌ازای هر پست', site ? 'از طریق utm_campaign هر پست' : 'عددهای واردشدهٔ تب «نتیجه»', topPosts.some(x => x.value) ? H.charts.barH(topPosts, { unit: site ? 'بازدید' : 'کلیک' }) : `<div class="empty">${ic('chart', 28)}هنوز عددی ثبت نشده.</div>`, H.charts.table(['پست', 'مقدار'], topPosts.map(x => [x.label, H.num(x.value)])))}
    ${H.charts.card('بازدید هر شبکه', 'مجموع عددهای واردشده', chData.length ? H.charts.barH(chData, { unit: 'بازدید' }) : `<div class="empty">${ic('chart', 28)}بعد از انتشار، عددها را در تب «نتیجه» پست وارد کنید.</div>`, H.charts.table(['شبکه', 'بازدید'], chData.map(x => [x.label, H.num(x.value)])))}
    ${siteLine}</div>
    <div class="panel" style="margin-top:14px"><h3>${ic('table', 18)}جدول پست‌های منتشرشده</h3>${done.length ? tbl : `<div class="empty">پستی با وضعیت «منتشر شد» نیست.</div>`}</div>`;
  };

  /* ---------- تنظیمات ---------- */
  V.settings = () => {
    const boss = H.isBoss(), set = S.settings;
    return `<div class="set">
    <div class="panel"><h3>${ic('users', 18)}حساب</h3><div class="me"><span class="av">${esc(H.initials(S.user))}</span><div><b>${esc(S.user || '—')}</b><small>${boss ? 'رئیس (می‌تواند تأیید کند)' : 'عضو تیم'}${S.mode === 'demo' ? ' · حالت نمونه' : ' · ' + esc(S.repo)}</small></div></div>
      <div style="margin-top:12px"><button class="btn d sm" data-act="logout">${ic('logout', 16)}خروج</button></div></div>
    <div class="panel"><h3>${ic('link', 18)}اتصال به سایت</h3><p>نشانی سایت برای ساخت لینک‌های رهگیری (UTM) و نقطهٔ آمار برای نمایش بازدید و ثبت‌نام هر پست.</p>
      <label class="f">نشانی سایت</label><input class="in" id="s-site" dir="ltr" value="${esc(set.siteUrl)}" placeholder="https://baje724.ir">
      <label class="f">نشانی JSON آمار سایت (اختیاری)</label><input class="in" id="s-stats" dir="ltr" value="${esc(set.statsUrl)}" placeholder="https://baje724.ir/api/social-stats">
      <div style="margin-top:12px;display:flex;gap:8px"><button class="btn p sm" data-act="savesite">ذخیره و آزمایش</button></div></div>
    <div class="panel"><h3>${ic('shield', 18)}رئیس‌ها</h3><p>فقط این نام‌های کاربری GitHub می‌توانند «تأیید رئیس» را بزنند. در مخزن ذخیره می‌شود (team/config.json).</p>
      <input class="in" id="s-boss" dir="ltr" value="${esc(S.boss.join(', '))}" ${boss ? '' : 'disabled'}><div style="margin-top:12px"><button class="btn p sm" data-act="savebossn" ${boss ? '' : 'disabled'}>ذخیره</button></div>
      <p style="margin-top:8px">توجه: این قفل در خود برنامه است؛ هر همکاری که به مخزن دسترسی نوشتن دارد از نظر فنی می‌تواند فایل‌ها را مستقیم تغییر دهد.</p></div>
    <div class="panel"><h3>${ic('moon', 18)}ظاهر</h3><div class="seg" style="margin:0"><button class="${set.theme === 'auto' ? 'on' : ''}" data-act="theme" data-t="auto">خودکار</button><button class="${set.theme === 'light' ? 'on' : ''}" data-act="theme" data-t="light">روشن</button><button class="${set.theme === 'dark' ? 'on' : ''}" data-act="theme" data-t="dark">تیره</button></div></div>
    <div class="panel"><h3>${ic('download', 18)}پشتیبان</h3><p>همهٔ پست‌ها را یک‌جا دانلود کنید.</p><button class="btn s sm" data-act="export">دانلود پشتیبان JSON</button></div></div>`;
  };
})(window.H);
