/* صفحه‌ها: داشبورد، تخته، تقویم، فهرست، آمار، تنظیمات */
(function (H) {
  const { esc, fa, ic, S } = Object.assign({}, H, { S: H.S });
  const V = H.views = {};
  const ST = H.STAGES, ABBR = { instagram: 'IG', facebook: 'FB', youtube: 'YT', telegram: 'TG', linkedin: 'LI', aparat: 'AP', bale: 'BL', rubika: 'RU', eitaa: 'EI' };
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
        ${p.insurance ? `<span class="pill ${p.legalApproved ? 'o' : 'w'}">${ic('shield', 12)}${p.legalApproved ? 'تأیید رئیس' : 'نیاز به تأیید رئیس'}</span>` : ''}${(p.attachments || []).length ? `<span class="pill" title="فایل‌های پیوست">${ic('file', 12)}${fa(p.attachments.length)}</span>` : ''}</div>
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
    P.filter(p => (p.reviews || []).some(r => r.status === 'open')).forEach(p => attn.push({ p, k: 'w', t: boss ? 'منتظر اصلاح نظر شما' : 'رئیس نظر گذاشته؛ اصلاح لازم است' }));
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
    return `<div class="hero"><div class="hx"><h2>${hello}${H.who() ? '، ' + esc(H.who()) : ''} 👋</h2><p>${week.length ? `${fa(week.length)} پست در ${fa(7)} روز آینده برنامه دارید.` : 'این هفته پستی برنامه‌ریزی نشده.'}${wait.length ? ` ${fa(wait.length)} مورد منتظر تأیید رئیس است.` : ''}</p>
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
    const t = today(); if (!U.cal || !U.cal.y) { const j = H.isoToJ(t); U.cal = { ...(U.cal || {}), y: j.y, m: j.m, wk: (U.cal && U.cal.wk) || t }; }
    const C = U.cal, mode = C.mode || 'month', { y, m } = C;
    const by = {}; S.posts.filter(match).forEach(p => { if (p.due) (by[p.due.slice(0, 10)] = by[p.due.slice(0, 10)] || []).push(p); });
    const tm = p => (p.due && p.due.length > 10 ? fa(p.due.slice(11, 16)) : '');
    const chip = p => `<span class="e" data-act="open" data-id="${esc(p.id)}" style="--c:${H.stage(p.stage).color}" title="${esc(p.title)} · ${esc(H.stage(p.stage).name)}"><i class="tm">${tm(p)}</i><span class="tt">${esc(p.title || 'بدون عنوان')}</span></span>`;
    const card = p => `<button class="wcard" data-act="open" data-id="${esc(p.id)}" style="--c:${H.stage(p.stage).color}"><b>${esc(p.title || 'بدون عنوان')}</b><small>${tm(p) || 'بدون ساعت'} · ${esc(H.stage(p.stage).name)}</small><span class="chs">${(p.channels || []).map(c => `<em>${esc(c)}</em>`).join('')}</span></button>`;
    const seg = `<div class="seg" style="margin:0">${[['month', 'ماه'], ['week', 'هفته'], ['agenda', 'برنامه']].map(([k, n]) => `<button class="${mode === k ? 'on' : ''}" data-act="cmode" data-m="${k}">${n}</button>`).join('')}</div>`;
    const legend = `<div class="clg">${H.STAGES.map(s => `<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>`;
    let label = H.MONTHS[m - 1] + ' ' + fa(y), body = '';
    if (mode === 'month') {
      const first = H.fromJ(y, m, 1), len = H.monthLen(y, m), off = H.dowIndex(first);
      let cells = ''; for (let i = 0; i < off; i++) cells += '<div class="day off"></div>';
      for (let d = 1; d <= len; d++) {
        const dt = H.fromJ(y, m, d), iso = H.isoDate(dt), ev = byDue(by[iso] || []), fri = H.dowIndex(dt) === 6;
        cells += `<div class="day ${iso === t ? 'today' : ''} ${fri ? 'fri' : ''} ${iso < t ? 'past' : ''}" data-act="day" data-day="${iso}"><span class="dh"><span class="n">${fa(d)}</span><span class="ad" aria-hidden="true">+</span></span>${ev.slice(0, 3).map(chip).join('')}${ev.length > 3 ? `<span class="cnt" data-act="cweek" data-day="${iso}">+${fa(ev.length - 3)} بیشتر</span>` : ''}</div>`;
      }
      body = `<div class="g7">${H.DOW_FULL.map(d => `<div class="dow">${d}</div>`).join('')}${cells}</div>`;
    }
    if (mode === 'week') {
      const base = new Date((C.wk || t) + 'T00:00:00Z'), st = new Date(base.getTime() - H.dowIndex(base) * 864e5), days = Array.from({ length: 7 }, (_, i) => new Date(st.getTime() + i * 864e5));
      const j0 = H.toJ(days[0]), j6 = H.toJ(days[6]); label = j0.m === j6.m ? `${fa(j0.d)} تا ${fa(j6.d)} ${H.MONTHS[j0.m - 1]} ${fa(j0.y)}` : `${fa(j0.d)} ${H.MONTHS[j0.m - 1]} تا ${fa(j6.d)} ${H.MONTHS[j6.m - 1]} ${fa(j6.y)}`;
      body = `<div class="wk">${days.map((dt, i) => { const iso = H.isoDate(dt), ev = byDue(by[iso] || []), j = H.toJ(dt); return `<div class="wcol ${iso === t ? 'today' : ''} ${i === 6 ? 'fri' : ''}"><div class="wh"><small>${H.DOW_FULL[i]}</small><b>${fa(j.d)}</b><small>${H.MONTHS[j.m - 1]}</small></div>${ev.map(card).join('') || '<div class="wempty">خالی</div>'}<button class="wadd" data-act="day" data-day="${iso}">${ic('plus', 14)}افزودن</button></div>`; }).join('')}</div>`;
    }
    let ag = '';
    for (let d = 1, len = H.monthLen(y, m); d <= len; d++) { const iso = H.isoDate(H.fromJ(y, m, d)), ev = byDue(by[iso] || []);
      if (ev.length || iso === t) ag += `<div class="panel" style="padding:12px"><h3 style="font-size:14px;margin-bottom:6px">${esc(H.fmtFull(iso))}${iso === t ? ' <span class="pill">امروز</span>' : ''}<button class="mini" style="margin-inline-start:auto" data-act="day" data-day="${iso}">${ic('plus', 14)}افزودن</button></h3>${ev.map(row).join('') || '<div class="empty" style="padding:8px">پستی نیست</div>'}</div>`; }
    return `<div class="cal calm-${mode}"><div class="ch2"><div class="nv"><button class="btn s sm" data-act="cnext" aria-label="بعد">${ic('chevL', 16)}</button><b>${label}</b><button class="btn s sm" data-act="cprev" aria-label="قبل">${ic('chevR', 16)}</button><button class="btn s sm" data-act="ctoday">امروز</button></div>${seg}</div>${legend}
      ${body}<div class="agenda ${mode === 'agenda' ? 'on' : ''}">${ag || '<div class="empty">در این ماه پستی نیست.</div>'}</div></div>`;
  };

  /* ---------- ایده‌ها و تقویم محتوا ---------- */
  const DEC = { go: ['کار کنیم', 'ok'], later: ['بعداً', 'a'], drop: ['حذف', 'w'] };
  H.IDEA_FILTER = H.IDEA_FILTER || { pillar: '', dec: '', month: '' };
  V.ideas = () => {
    const F = H.IDEA_FILTER, all = S.posts.filter(p => p.idea), site = (S.settings.siteUrl || '').replace(/\/+$/, '');
    const pillars = [...new Set(all.map(p => p.idea.pillar))].sort(), months = [...new Set(all.filter(p => p.due).map(p => H.monthKey(p.due)))].sort();
    const L = all.filter(p => (!F.pillar || p.idea.pillar === F.pillar) && (!F.month || String(H.monthKey(p.due || '')) === F.month) && (!F.dec || (F.dec === 'none' ? !p.idea.decision : p.idea.decision === F.dec)));
    const cnt = k => all.filter(p => p.idea.decision === k).length, none = all.filter(p => !p.idea.decision).length;
    const intro = `<details class="panel iintro" open><summary>دربارهٔ این صفحه: در جلسه دربارهٔ چه چیزی تصمیم می‌گیریم؟</summary>
      <p>اینجا <b>${fa(all.length)} پیشنهاد موضوع پست</b> برای هفته‌های پیش رو (تا مرداد ۱۴۰۶، هفته‌ای یکی) است. موضوع‌ها از خود سایت باجه آمده‌اند: ابزارها، مقاله‌ها، راهنماها و ماژول‌ها. این‌ها <b>پیشنهادند، نه تصمیم</b>.</p>
      <ol><li><b>کدام را بسازیم؟</b> برای هر ایده «کار کنیم»، «بعداً» یا «حذف» را بزنید. پیشنهاد من فقط راهنماست: ارزش بالا و تلاش کم اول.</li>
      <li><b>موضوع‌های قانونی و تاریخ‌دار</b> (برچسب «نیاز به تأیید رئیس») قبل از ساخت باید متن و منبع رسمی‌شان را رئیس ببیند.</li>
      <li><b>ادعاها</b> مثل «۳۵ سال تجربه» یا «لیست‌های بیش از ۳۰۰۰ نفر» با مالک و رئیس است.</li>
      <li><b>ساعت و روز انتشار</b> فرضیهٔ آزمون‌اند و بعد از چند پست با داده‌ی واقعی اصلاح می‌شوند.</li></ol>
      <p class="sub">بعد از جلسه: «کار کنیم»ها با «ساخت پیش‌نویس» وارد تولید می‌شوند. خروجی CSV برای مرور روی کاغذ یا اکسل است.</p></details>`;
    const sum = `<div class="isum"><div><b>${fa(all.length)}</b><small>ایده</small></div><div class="ok"><b>${fa(cnt('go'))}</b><small>کار می‌کنیم</small></div><div class="a"><b>${fa(cnt('later'))}</b><small>بعداً</small></div><div class="w"><b>${fa(cnt('drop'))}</b><small>حذف</small></div><div><b>${fa(none)}</b><small>بدون تصمیم</small></div></div>`;
    const sel = (k, opts, ph) => `<select class="in" data-ifl="${k}"><option value="">${ph}</option>${opts.map(([val, n]) => `<option value="${esc(val)}" ${F[k] === String(val) ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>`;
    const pname = k => (all.find(p => p.idea.pillar === k) || { idea: {} }).idea.pillarName || k;
    const filt = `<div class="filters">${sel('pillar', pillars.map(k => [k, pname(k)]), 'همهٔ ستون‌های محتوا')}${sel('month', months.map(m => [m, H.MONTHS[(m % 100) - 1] + ' ' + fa(Math.floor(m / 100))]), 'همهٔ ماه‌ها')}${sel('dec', [['none', 'بدون تصمیم'], ['go', 'کار کنیم'], ['later', 'بعداً'], ['drop', 'حذف']], 'همهٔ تصمیم‌ها')}<button class="btn s sm" data-act="ideaexport">${ic('download', 16)}خروجی برای جلسه (CSV)</button></div>`;
    if (!all.length) return H.empty('sparkle', 'هنوز ایده‌ای ثبت نشده.', '');
    const item = p => { const i = p.idea, d = i.decision, rec = DEC[i.rec], lv = { 'زیاد': 3, 'متوسط': 2, 'کم': 1 };
      return `<div class="idea ${d ? 'dec-' + d : ''}"><div class="ih"><div><b class="it">${esc(p.title)}</b><small>${esc(H.fmtDue(p.due))} · ${esc((p.formats || []).join('، '))} · ${esc(i.pillarName || i.pillar)}</small></div><span class="pill ${rec && rec[1]}" title="پیشنهاد من">پیشنهاد: ${rec ? rec[0] : '—'}</span></div>
        <p class="iw">${esc(i.why)}</p>
        <div class="im"><span class="pill" title="ارزش برای مخاطب">ارزش: ${esc(i.value)}</span><span class="pill" title="تلاش تولید">تلاش: ${esc(i.effort)}</span>${p.insurance ? `<span class="pill w">${ic('shield', 12)}نیاز به تأیید رئیس</span>` : ''}${i.source ? `<a class="pill" href="${esc(site + i.source)}" target="_blank" rel="noopener">منبع در سایت ↗</a>` : ''}</div>
        ${i.risk ? `<p class="ir">${ic('alert', 14)} ${esc(i.risk)}</p>` : ''}
        <div class="ia"><div class="seg" style="margin:0">${Object.entries(DEC).map(([k, [n]]) => `<button class="${d === k ? 'on' : ''}" data-act="idecide" data-id="${esc(p.id)}" data-d="${k}">${n}</button>`).join('')}</div>
        <input class="in" data-inote="${esc(p.id)}" value="${esc(i.note || '')}" placeholder="یادداشت جلسه (اختیاری)">
        ${d === 'go' && p.stage === 'idea' ? `<button class="btn p sm" data-act="idraft" data-id="${esc(p.id)}">ساخت پیش‌نویس</button>` : (p.stage !== 'idea' ? `<span class="pill ok">${esc(H.stage(p.stage).name)}</span>` : '')}</div></div>`; };
    let html = '', cur = '';
    byDue(L).forEach(p => { const mk = p.due ? H.monthKey(p.due) : 0; if (mk !== cur) { cur = mk; html += `<h3 class="imh">${mk ? H.MONTHS[(mk % 100) - 1] + ' ' + fa(Math.floor(mk / 100)) : 'بدون تاریخ'}</h3>`; } html += item(p); });
    return intro + sum + filt + (html || H.empty('search', 'با این فیلتر ایده‌ای نیست.', '')) ;
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

  /* نوار حجم مخزن: سقف توصیه‌شدهٔ GitHub حدود ۱ گیگابایت */
  V.sizeHtml = i => {
    const mb = i.kb / 1024, pct = Math.min(100, mb / 1024 * 100), lvl = pct >= 88 ? 'bad' : pct >= 68 ? 'mid' : 'ok';
    return `${i.private ? `<p class="pill o">${ic('shield', 13)}مخزن داده خصوصی است</p>` : `<div class="err" style="margin:0 0 10px">هشدار: مخزن داده عمومی است! همین حالا در Settings مخزن آن را Private کنید.</div>`}
      <p style="margin:10px 0 6px"><b>${fa(Math.round(mb))}</b> مگابایت از حدود ${fa(1024)} مگابایت توصیه‌شده${i.demo ? ' (نمونه)' : ''}</p>
      <div class="sz ${lvl}"><i style="width:${Math.max(1, pct)}%"></i></div>
      <p class="sub" style="margin-top:8px;font-size:12.5px">${lvl === 'bad' ? 'نزدیک سقف است؛ فایل‌های قدیمی را به Drive ببرید یا مخزن فایل جدا بسازید.' : lvl === 'mid' ? 'از ۷۰٪ گذشته؛ فایل‌های سنگین را در Drive نگه دارید.' : 'فضا کافی است.'} عدد را GitHub با تأخیر به‌روز می‌کند و حذف فایل از تاریخچه حجم را کم نمی‌کند.</p>`;
  };
  /* ---------- تنظیمات ---------- */
  V.settings = () => {
    const boss = H.isBoss(), set = S.settings;
    return `<div class="set">
    <div class="panel"><h3>${ic('users', 18)}حساب</h3><div class="me"><span class="av">${esc(H.initials(H.who()))}</span><div><b>${esc(H.who() || '—')}</b><small>${boss ? 'رئیس (می‌تواند تأیید کند)' : 'ادمین'}${S.mode === 'demo' ? ' · حالت نمونه' : ' · ' + esc(S.repo)}</small></div></div>
      <label class="f">نام نمایشی شما (فقط در همین مرورگر؛ برای تاریخچه)</label><div style="display:flex;gap:8px"><input class="in" id="s-name" value="${esc(S.display || '')}" placeholder="${esc(S.user || '')}"><button class="btn s sm" data-act="savename">ذخیره</button></div>
      <div style="margin-top:12px"><button class="btn d sm" data-act="logout">${ic('logout', 16)}خروج</button></div></div>
    <div class="panel"><h3>${ic('shield', 18)}فضا و امنیت مخزن</h3><div id="rs"><p class="sub">در حال بررسی…</p></div></div>
    <div class="panel"><h3>${ic('link', 18)}اتصال به سایت</h3><p>نشانی سایت برای ساخت لینک‌های رهگیری (UTM) و نقطهٔ آمار برای نمایش بازدید و ثبت‌نام هر پست.</p>
      <label class="f">نشانی سایت</label><input class="in" id="s-site" dir="ltr" value="${esc(set.siteUrl)}" placeholder="https://baje724.ir">
      <label class="f">نشانی JSON آمار سایت (اختیاری)</label><input class="in" id="s-stats" dir="ltr" value="${esc(set.statsUrl)}" placeholder="https://baje724.ir/api/social-stats">
      <div style="margin-top:12px;display:flex;gap:8px"><button class="btn p sm" data-act="savesite">ذخیره و آزمایش</button></div></div>
    <div class="panel"><h3>${ic('shield', 18)}نقش‌ها و رمز رئیس</h3>
      <p><b>ادمین:</b> ساخت و ویرایش پست، فایل‌ها، زمان‌بندی و ثبت نتیجه. <b>رئیس:</b> همهٔ کارهای ادمین، به‌علاوهٔ «تأیید رئیس» و عبور پست از مرحلهٔ «تأیید رئیس». اگر ادمین بعد از تأیید، متن یا تاریخ پست بیمه را عوض کند، تأیید باطل می‌شود.</p>
      ${!S.pinCfg ? '<div class="err" style="margin:0 0 10px">رمز رئیس هنوز تعیین نشده؛ فعلاً هر کس «رئیس» را انتخاب کند وارد می‌شود. یک رمز بگذارید و فقط به رئیس بدهید.</div>' : ''}
      ${boss || !S.pinCfg ? `${S.pinCfg ? '<label class="f">رمز فعلی</label><input class="in" id="s-pin-old" type="password" inputmode="numeric" autocomplete="off">' : ''}<label class="f">${S.pinCfg ? 'رمز جدید' : 'رمز رئیس'} (۴ تا ۱۲ رقم)</label><input class="in" id="s-pin-new" type="password" inputmode="numeric" autocomplete="off"><div style="margin-top:12px"><button class="btn p sm" data-act="savepin">ذخیره</button></div>` : '<p class="sub">فقط رئیس می‌تواند رمز را عوض کند.</p>'}
      <p style="margin-top:8px">توجه: این قفل‌ها فقط داخل برنامه هستند و جلوی اشتباه را می‌گیرند، نه جلوی کسی که توکن را دارد؛ هر کس توکن داشته باشد از نظر فنی می‌تواند فایل‌ها را مستقیم تغییر دهد. رمز به‌صورت درهم‌شده در مخزن خصوصی ذخیره می‌شود. بعد از تحویل به رئیس، او رمز را عوض کند.</p></div>
    <div class="panel"><h3>${ic('file', 18)}فوتر پیام</h3><p>متنی که می‌تواند آخر هر پست بیاید (مثلاً «لینک سایت»، «با ما در ارتباط باشید»). هر پست خودش تصمیم می‌گیرد فوتر داشته باشد یا نه. جانشین‌ها: <code>{link}</code> لینک رهگیری، <code>{title}</code>، <code>{site}</code>، <code>{channel}</code>.</p>
      <label class="f">قالب پیش‌فرض همهٔ شبکه‌ها</label><textarea class="in" id="t-all" placeholder="مثلاً: باجه، لیست بیمه آنلاین&#10;{link}">${esc(((S.tpl || {}).footers || {})['*'] || '')}</textarea>
      <details style="margin-top:8px"><summary class="help" style="cursor:pointer">قالب جدا برای هر شبکه (اختیاری؛ جای پیش‌فرض را می‌گیرد)</summary>${H.CHANNELS.map(c => `<label class="f">${esc(c.n)}</label><textarea class="in" data-tpl="${esc(c.n)}" rows="2">${esc(((S.tpl || {}).footers || {})[c.n] || '')}</textarea>`).join('')}</details>
      <div style="margin-top:12px"><button class="btn p sm" data-act="savetpl">ذخیرهٔ قالب</button></div></div>
    <div class="panel"><h3>${ic('moon', 18)}ظاهر</h3><div class="seg" style="margin:0"><button class="${set.theme === 'auto' ? 'on' : ''}" data-act="theme" data-t="auto">خودکار</button><button class="${set.theme === 'light' ? 'on' : ''}" data-act="theme" data-t="light">روشن</button><button class="${set.theme === 'dark' ? 'on' : ''}" data-act="theme" data-t="dark">تیره</button></div></div>
    <div class="panel"><h3>${ic('download', 18)}پشتیبان</h3><p>همهٔ پست‌ها را یک‌جا دانلود کنید.</p><button class="btn s sm" data-act="export">دانلود پشتیبان JSON</button></div></div>`;
  };

  /* ---------- صف دستی: اینستاگرام و فیسبوک (بدون ارسال خودکار) ---------- */
  const MANUAL = ['اینستاگرام', 'فیسبوک'];
  H.QUEUE = H.QUEUE || { days: 7 };
  /* نام فایل‌های هر شبکه، به همان ترتیبی که در پست تعیین شده؛ بدون تعیین، همهٔ تصویرها */
  H.chFiles = (p, ch) => {
    const all = (p.attachments || []).filter(H.isImg), sel = p.channelFiles && p.channelFiles[ch];
    return Array.isArray(sel) ? sel.map(n => all.find(a => a.name === n)).filter(Boolean) : all;
  };
  H.dlFiles = async files => {
    for (const a of files) {
      const b = a.pending ? a.blob : await H.store.fileBlob(a.path), u = URL.createObjectURL(b), l = document.createElement('a');
      l.href = u; l.download = a.name; l.click(); setTimeout(() => URL.revokeObjectURL(u), 3000); await new Promise(r => setTimeout(r, 450));
    }
  };
  H.copyText = async txt => {
    try { await navigator.clipboard.writeText(txt); } catch (x) { const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
  };
  H.queueItems = () => {
    const t = today(), lim = H.QUEUE.days, out = [];
    S.posts.filter(p => p.stage !== 'idea' && p.due).forEach(p => {
      const d = H.diffDays(p.due, t);
      if (d >= lim || d < -2) return;
      MANUAL.filter(c => p.channels.includes(c)).forEach(c => { const posted = !!(p.postUrls || {})[c]; if (!posted || d >= 0) out.push({ p, c, d, posted }); });
    });
    return out.sort((x, y) => x.p.due.localeCompare(y.p.due) || MANUAL.indexOf(x.c) - MANUAL.indexOf(y.c));
  };
  V.queue = () => {
    const items = H.queueItems(), pending = items.filter(i => !i.posted).length, days = {};
    items.forEach(i => (days[i.p.due.slice(0, 10)] = days[i.p.due.slice(0, 10)] || []).push(i));
    const stageNote = p => p.stage === 'boss' || (p.insurance && !p.legalApproved) ? '<span class="pill w">' + ic('shield', 12) + 'هنوز تأیید رئیس نگرفته؛ نگذارید</span>' : p.stage === 'ready' || p.stage === 'done' ? '<span class="pill o">' + ic('check', 12) + 'آمادهٔ انتشار</span>' : '<span class="pill">' + esc(H.stage(p.stage).name) + '</span>';
    const item = ({ p, c, d, posted }) => {
      const files = H.chFiles(p, c), cap = (p.captions && p.captions[c]) || p.caption || '', link = c === 'اینستاگرام' ? '' : H.utm(p, c), key = esc(p.id) + '|' + esc(c);
      return `<div class="qi ${posted ? 'posted' : ''}"><div class="qh"><b>${esc(c)}</b><span class="qt">${ic('clock', 13)} ${esc((p.due || '').slice(11, 16) ? H.fa(p.due.slice(11, 16)) : '')}${d < 0 ? ' · <span class="late">گذشته</span>' : ''}</span>${stageNote(p)}
        <button class="btn s sm" data-act="open" data-id="${esc(p.id)}">${esc(p.title || 'بدون عنوان')}</button></div>
        <div class="qb"><div class="qc"><textarea class="in" readonly>${esc(cap)}</textarea>
          <div class="qa"><button class="btn s sm" data-act="qcopy" data-k="${key}|cap">${ic('copy', 14)} کپی کپشن</button>${link ? `<button class="btn s sm" data-act="qcopy" data-k="${key}|utm">${ic('copy', 14)} کپی لینک</button>` : '<span class="help">لینک را در بایو بگذارید؛ در کپشن لینک کلیک‌پذیر نیست.</span>'}
          <button class="btn s sm" data-act="qdl" data-k="${key}" ${files.length ? '' : 'disabled'}>${ic('download', 14)} دانلود ${files.length ? fa(files.length) + ' تصویر' : '(تصویری نیست)'}</button></div></div>
        <div class="qu"><label class="f" style="margin-top:0">لینک پست بعد از انتشار ${posted ? '✓' : ''}</label><input class="in" dir="ltr" data-qurl="${key}" value="${esc((p.postUrls || {})[c] || '')}" placeholder="https://..."></div></div></div>`;
    };
    const ds = Object.keys(days).sort();
    return `<div class="qtop"><div><h2 style="font-size:20px;font-weight:900">صف انتشار دستی</h2><p class="sub">${fa(pending)} پست اینستاگرام/فیسبوک در ${fa(H.QUEUE.days)} روز آینده. همه را یک‌جا در Meta Business Suite زمان‌بندی کنید.</p></div>
      <div class="seg" style="margin:0">${[3, 7, 14].map(n => `<button class="${H.QUEUE.days === n ? 'on' : ''}" data-act="qrange" data-n="${n}">${fa(n)} روز</button>`).join('')}</div></div>
      ${ds.length ? ds.map(d => `<h3 class="qd">${H.relDay(d) ? esc(H.relDay(d)) + ' · ' : ''}${esc(H.fmtDay(d))}</h3>${days[d].map(item).join('')}`).join('') : H.empty('send', 'پست دستی در این بازه نیست.', '')}`;
  };
})(window.H);
