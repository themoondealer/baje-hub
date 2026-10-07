/* ویرایشگر پست: کشوی کناری (دسکتاپ) یا برگهٔ پایین (موبایل) */
(function (H) {
  const { esc, fa, ic, S } = Object.assign({}, H, { S: H.S });
  const E = H.editor = { w: null, orig: null, isNew: false, tab: 'main' };
  const ST = H.STAGES;
  const clone = p => JSON.parse(JSON.stringify(p));

  E.open = (p, isNew) => {
    E.orig = clone(p); E.w = clone(p); E.isNew = !!isNew; E.tab = 'main';
    E.w.attachments = E.w.attachments || []; E.removed = [];
    E.w.postUrls = E.w.postUrls || {}; E.w.metrics = E.w.metrics || {}; E.w.captions = E.w.captions || {};
    const di = H.dueToInput(E.w.due); E.w._d = di.d; E.w._t = di.t;
    E.render(true);
  };
  E.close = () => { H.$('#editor').innerHTML = ''; E.w = null; };
  const toggles = (arr, all, key) => `<div class="tg" data-k="${key}">${all.map(x => `<button type="button" class="tgl ${arr.includes(x.n) ? 'on' : ''}" data-v="${esc(x.n)}">${esc(x.n)}</button>`).join('')}</div>`;

  const rdy = w => { const r = H.ready(w); return `<div class="rdy"><div class="rb2"><i style="width:${r.pct}%"></i></div><p><b>${fa(r.done)} از ${fa(r.total)}</b> مورد آماده است${r.missing.length ? ' — کم است: ' : ' ✓'}${r.missing.map(x => `<button type="button" class="mchip" data-tab="${x.tab}">${esc(x.n)}</button>`).join('')}</p></div>`; };
  const hl = t => esc(t).replace(/(#[^\s#]+)/g, '<span class="hash">$1</span>').replace(/\n/g, '<br>');
  const LIM = { 'اینستاگرام': [2200, 'کپشن'], 'تلگرام': [1024, 'کپشن پست دارای تصویر'] };
  const pvHtml = w => {
    const chs = ['اینستاگرام', 'تلگرام'].filter(c => w.channels.includes(c)), all = chs.length ? chs : ['اینستاگرام'];
    const cur = all.includes(E.pv) ? E.pv : all[0], cap = (w.captions[cur] || w.caption || '').trim(), lim = LIM[cur][0], over = cap.length > lim;
    const short = cap.length > 125 && !E.pvFull ? cap.slice(0, 125).replace(/\s+\S*$/, '') : cap;
    const body = cur === 'اینستاگرام'
      ? `<div class="ig"><div class="igh"><span class="av" style="width:30px;height:30px;font-size:11px">B</span><b>baje724.ir</b></div>${E.firstImgURL(w) ? `<img class="igp" src="${E.firstImgURL(w)}" alt="">` : `<div class="igi"><small>${esc(w.formats[0] || 'پست')}</small><b>${esc(w.title || 'عنوان پست')}</b></div>`}<div class="igc">${cap ? `<b>baje724.ir</b> ${hl(short)}${short.length < cap.length ? ' <span class="more">… بیشتر</span>' : ''}` : '<span class="sub">کپشن را بنویسید تا اینجا دیده شود</span>'}</div></div>`
      : `<div class="tgm"><div class="bub">${cap ? hl(cap) : '<span class="sub">کپشن را بنویسید</span>'}<small>${fa(new Date().getHours())}:${fa(String(new Date().getMinutes()).padStart(2, '0'))}</small></div></div>`;
    return `<div class="pvh"><div class="tg">${all.map(c => `<button type="button" class="tgl ${c === cur ? 'on' : ''}" data-pv="${esc(c)}">${esc(c)}</button>`).join('')}</div><span class="pill ${over ? 'w' : cap.length > lim * .9 ? 'a' : ''}">${fa(cap.length)} / ${fa(lim)}</span></div>${body}
      <div class="pvf"><span class="sub">پیش‌نمایش تقریبی؛ ${esc(LIM[cur][1])} حدود ${fa(lim)} نویسه و ممکن است شبکه آن را تغییر دهد.</span>${cur === 'اینستاگرام' && cap.length > 125 ? `<button type="button" class="mini" data-pvfull="1">${E.pvFull ? 'نمایش کوتاه' : 'نمایش کامل'}</button>` : ''}</div>${over ? `<div class="err" style="margin-top:8px">کپشن از حد این شبکه بلندتر است؛ کوتاهش کنید.</div>` : ''}`;
  };
  E.updatePreview = () => { const el = H.$('#pv'); if (el && E.w) el.innerHTML = pvHtml(E.w); };
  const tabMain = w => {
    const boss = H.isBoss();
    return `${rdy(w)}<label class="f">عنوان / موضوع</label><input class="in" data-m="title" value="${esc(w.title)}" placeholder="مثلاً: معرفی ابزارهای رایگان">
    <div class="r2 keep"><div><label class="f">تاریخ انتشار (شمسی)</label><input class="in" data-m="_d" dir="ltr" placeholder="۱۴۰۵/۰۷/۲۰" value="${esc(w._d)}"></div>
    <div><label class="f">ساعت (وقت تهران)</label><input class="in" data-m="_t" dir="ltr" placeholder="۱۳:۰۰" value="${esc(w._t)}"></div></div>
    <div class="r2"><div><label class="f">مسئول</label><input class="in" data-m="assignee" value="${esc(w.assignee)}"></div>
    <div><label class="f">لینک مقصد در سایت</label><input class="in" data-m="landing" dir="ltr" value="${esc(w.landing || '/')}" placeholder="/abzar/"></div></div>
    <label class="f">قالب</label>${toggles(w.formats, H.FORMATS, 'formats')}
    <label class="f">شبکه‌ها</label>${toggles(w.channels, H.CHANNELS, 'channels')}
    <label class="chk w"><input type="checkbox" data-m="insurance" ${w.insurance ? 'checked' : ''}><span>پست دربارهٔ بیمه، قانون یا تاریخ مهلت است؛ باید رئیس تأیید کند.</span></label>
    <label class="chk"><input type="checkbox" data-m="legalApproved" ${w.legalApproved ? 'checked' : ''} ${boss ? '' : 'disabled'}><span>${boss ? 'تأیید رئیس: متن و تاریخ‌ها درست است' : 'تأیید رئیس (فقط رئیس می‌تواند بزند)'}</span></label>
    <label class="f">بریف و متن اصلی</label><textarea class="in" data-m="brief">${esc(w.brief)}</textarea>`;
  };
  const tabCap = w => `<div class="pv" id="pv">${pvHtml(w)}</div><div class="cr"><b>کپشن اصلی</b><span class="cnt" id="cnt-main">${fa((w.caption || '').length)} نویسه</span><button class="btn s sm" data-copy="caption">${ic('copy', 14)}کپی</button></div>
    <textarea class="in" data-m="caption" style="min-height:190px">${esc(w.caption)}</textarea>
    ${w.channels.map(c => `<div class="cr"><b>ویژهٔ ${esc(c)} <small class="sub">(اختیاری؛ خالی یعنی کپشن اصلی)</small></b><button class="btn s sm" data-copy="cap:${esc(c)}">${ic('copy', 14)}کپی</button></div><textarea class="in" data-cap="${esc(c)}">${esc(w.captions[c] || '')}</textarea>`).join('') || '<p class="help">ابتدا در تب «محتوا» شبکه‌ها را انتخاب کنید.</p>'}`;
  const MAXF = 20 * 1048576;
  const attHtml = w => `<div class="cr"><b>تصویر و فایل‌ها</b><button type="button" class="btn s sm" data-att="pick">${ic('plus', 14)} افزودن</button></div>
    <input type="file" id="att-in" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip" hidden>
    <div class="att" id="att">${(w.attachments || []).map((a, i) => `<div class="at"><div class="th">${H.isImg(a) ? `<img data-i="${i}" alt="${esc(a.name)}">` : ic('file', 26)}</div><div class="ti"><b title="${esc(a.name)}">${esc(a.name)}</b><small>${H.fmtSize(a.size || 0)}${a.pending ? ' · با «ذخیره» آپلود می‌شود' : ''}</small></div><button type="button" class="mini" data-att="dl" data-i="${i}">دانلود</button><button type="button" class="mini" data-att="rm" data-i="${i}" aria-label="حذف">${ic('x', 13, 2.2)}</button></div>`).join('') || `<div class="drop" data-att="pick">${ic('plus', 24)}<span>تصویر را اینجا بکشید یا بزنید</span></div>`}</div>
    <p class="help" style="margin-top:6px">تصویرهای بزرگ خودکار فشرده می‌شوند. فایل‌ها تا ${H.fa(20)} مگابایت. ویدیو و ریلز را با لینک (مثلاً Google Drive) بگذارید؛ ریپو برای فایل سنگین مناسب نیست.</p>`;
  E.addFiles = async list => {
    const w = E.w; if (!w) return;
    for (const f of [...list]) {
      try {
        if (/^video\//.test(f.type)) { H.toast('ویدیو را با لینک بگذارید، نه آپلود', 4200, 'bad'); continue; }
        const blob = await H.compressImage(f); if (blob.size > MAXF) { H.toast(`«${f.name}» بزرگ‌تر از ${H.fa(20)} مگابایت است`, 4200, 'bad'); continue; }
        const name = blob !== f && blob.type === 'image/jpeg' ? f.name.replace(/\.\w+$/, '') + '.jpg' : f.name;
        w.attachments.push({ name, stored: H.safeName(name), type: blob.type || f.type, size: blob.size, pending: true, blob, url: URL.createObjectURL(blob) });
      } catch (x) { H.toast(x.message, 4200, 'bad'); }
    }
    E.render();
  };
  E.hydrate = () => H.$$('#att img[data-i]').forEach(img => {
    const a = E.w.attachments[+img.dataset.i]; if (!a) return;
    if (a.pending) img.src = a.url; else if (H.fileCache[a.path]) img.src = H.fileCache[a.path];
    else H.store.fileURL(a.path).then(u => { img.src = u; E.updatePreview && E.updatePreview(); }, () => img.replaceWith(Object.assign(document.createElement('span'), { textContent: '؟' })));
  });
  E.flush = async () => {
    const out = [];
    for (const a of E.w.attachments) {
      if (a.pending) { const r = await H.store.putFile(E.w.id, a); out.push({ name: a.name, path: r.path, sha: r.sha, size: a.size, type: a.type }); }
      else out.push(a);
    }
    for (const r of E.removed) { try { await H.store.delFile(r); } catch (e) {} }
    return out;
  };
  E.firstImgURL = w => { const a = (w.attachments || []).find(H.isImg); return a ? (a.pending ? a.url : H.fileCache[a.path]) : ''; };
  const tabLinks = w => `${attHtml(w)}<label class="f">لینک فایل‌های دیگر (ویدیو، Drive، ...) یا مسیر پوشه، هر مورد یک خط</label><textarea class="in" data-m="files">${esc(w.files)}</textarea>
    <div class="links">${(w.files || '').split('\n').filter(x => /^https?:\/\//.test(x.trim())).map(x => `<a href="${esc(x.trim())}" target="_blank" rel="noopener">${esc(x.trim())}</a>`).join('')}</div>
    <div class="cr"><b>لینک رهگیری هر شبکه (UTM)</b></div><p class="help" style="margin:0 0 4px">این لینک‌ها را در بیو، کامنت یا استیکر استوری بگذارید تا بازدید سایت به همین پست برگردد.</p>
    <div class="r2" style="margin-bottom:6px"><div><label class="f">کد کمپین (انگلیسی)</label><input class="in" data-m="slug" dir="ltr" value="${esc(w.slug)}" placeholder="خودکار"></div><div></div></div>
    ${w.channels.map(c => `<div class="utm"><b>${esc(c)}</b><code>${esc(H.utm(w, c))}</code><button class="btn s sm" data-copy="utm:${esc(c)}" aria-label="کپی">${ic('copy', 14)}</button></div>`).join('') || '<p class="help">برای ساخت لینک، شبکه انتخاب کنید.</p>'}`;
  const tabRes = w => `<p class="help" style="margin-top:12px">بعد از انتشار، لینک پست و عددهای هر شبکه را وارد کنید. عددی را که ندارید خالی بگذارید؛ خالی با صفر فرق دارد.</p>
    ${w.channels.map(c => { const m = w.metrics[c] || {}; return `<div class="chm"><h4>${esc(c)}</h4><label class="f" style="margin-top:0">لینک پست</label><input class="in" dir="ltr" data-url="${esc(c)}" value="${esc(w.postUrls[c] || '')}" placeholder="https://...">
      <div class="mg" style="margin-top:10px">${H.METRICS.map(x => `<div><label>${x.n}</label><input class="in" inputmode="numeric" data-met="${esc(c)}|${x.k}" value="${m[x.k] === undefined || m[x.k] === null ? '' : esc(fa(m[x.k]))}"></div>`).join('')}</div></div>`; }).join('') || '<p class="help">شبکه‌ای انتخاب نشده.</p>'}`;
  const tabHist = w => `<ul class="hist" style="padding:0;margin-top:10px">${(w.history || []).slice().reverse().map(h => `<li>${esc(h)}</li>`).join('') || '<li>هنوز تغییر مرحله‌ای ثبت نشده.</li>'}</ul>`;

  E.render = (full) => {
    const w = E.w, host = H.$('#editor'), idx = ST.findIndex(s => s.id === w.stage);
    const prev = H.$('.db', host), sc = prev ? prev.scrollTop : 0;
    const tabs = [['main', 'محتوا'], ['cap', 'کپشن‌ها'], ['links', 'فایل و لینک'], ['res', 'نتیجه'], ['hist', 'تاریخچه']];
    host.innerHTML = `<div class="scrim" data-e="close"></div><aside class="drawer" role="dialog" aria-modal="true" aria-label="ویرایش پست">
      <div class="dh"><h2>${E.isNew ? 'پست جدید' : esc(w.title || 'ویرایش پست')}</h2><button class="xb" data-e="close" aria-label="بستن">${ic('x', 18)}</button></div>
      <div class="steps">${ST.map((s, i) => `<button class="step ${i === idx ? 'on' : i < idx ? 'past' : ''}" data-stage="${s.id}">${i < idx ? ic('check', 13, 2.4) : ''}${s.name}</button>`).join('')}</div>
      <div class="dtabs" role="tablist">${tabs.map(([k, n]) => `<button class="dtab ${E.tab === k ? 'on' : ''}" role="tab" data-tab="${k}">${n}</button>`).join('')}</div>
      <div id="eerr" class="err hide" hidden style="margin:10px 22px 0"></div>
      <div class="db">${({ main: tabMain, cap: tabCap, links: tabLinks, res: tabRes, hist: tabHist })[E.tab](w)}</div>
      <div class="df"><button class="btn p" data-e="save">${ic('check', 17, 2.2)} ذخیره</button>${!E.isNew ? `<button class="btn s" data-e="dup">${ic('copy', 16)} کپی پست</button><button class="btn d" data-e="del">${ic('trash', 16)} حذف</button>` : ''}<button class="btn g" data-e="close" style="margin-inline-start:auto">بستن</button></div></aside>`;
    const nb = H.$('.db', host); if (nb && !full) nb.scrollTop = sc;
    E.hydrate();
    if (full) setTimeout(() => { const t = H.$('[data-m=title]', host); if (t && E.isNew) t.focus(); }, 60);
  };
  const err = m => { const x = H.$('#eerr'); if (!x) return H.toast(m, 4000, 'bad'); x.textContent = m; x.hidden = false; x.scrollIntoView({ block: 'nearest' }); };
  E.err = err;

  const canEnter = (w, id) => !(w.insurance && !w.legalApproved && (id === 'ready' || id === 'done'));
  const nextSlug = () => { const used = new Set(S.posts.map(p => p.slug)); let n = S.posts.length; let s; do { s = 'post-' + String(n++).padStart(2, '0'); } while (used.has(s)); return s; };

  E.collect = () => {
    const w = E.w; w.title = (w.title || '').trim();
    if (!w.title) throw new Error('عنوان را بنویسید');
    w.due = H.inputToDue(w._d || '', w._t || '');
    if (!canEnter(w, w.stage)) throw new Error('این پست باید اول رئیس تأیید کند؛ بعد به «آماده انتشار» یا «منتشر شد» برود');
    w.slug = (w.slug || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || nextSlug();
    if (S.posts.some(p => p.id !== w.id && p.slug === w.slug)) throw new Error('این کد کمپین قبلاً برای پست دیگری استفاده شده');
    Object.keys(w.captions).forEach(k => { if (!w.channels.includes(k) || !String(w.captions[k]).trim()) delete w.captions[k]; });
    if (w.stage !== E.orig.stage) w.history = [...(w.history || []), `${new Date().toLocaleString('fa-IR')} — ${H.who() || 'ناشناس'}: ${H.stage(E.orig.stage).name} ← ${H.stage(w.stage).name}`];
    const out = clone({ ...w, attachments: [] }); delete out._d; delete out._t; return out;
  };

  /* رویدادها */
  const host = () => H.$('#editor');
  document.addEventListener('input', e => {
    const w = E.w; if (!w) return; const t = e.target;
    if (t.dataset.m) { const k = t.dataset.m; w[k] = t.type === 'checkbox' ? t.checked : t.value; if (k === 'caption') { const c = H.$('#cnt-main'); if (c) c.textContent = fa(t.value.length) + ' نویسه'; E.updatePreview(); } if (k === 'insurance' || k === 'legalApproved') {} }
    else if (t.dataset.cap) { w.captions[t.dataset.cap] = t.value; E.updatePreview(); }
    else if (t.dataset.url) w.postUrls[t.dataset.url] = t.value.trim();
    else if (t.dataset.met) { const [c, k] = t.dataset.met.split('|'); w.metrics[c] = w.metrics[c] || {}; const v = H.en(t.value).replace(/[^\d.]/g, ''); if (v === '') delete w.metrics[c][k]; else w.metrics[c][k] = Number(v); }
  });
  document.addEventListener('change', e => { if (e.target.id === 'att-in') { E.addFiles(e.target.files); e.target.value = ''; return; } const t = e.target; if (E.w && t.dataset.m && (t.dataset.m === 'insurance' || t.dataset.m === 'legalApproved')) E.render(); });
  document.addEventListener('click', async e => {
    const w = E.w; if (!w) return; const el = e.target.closest('[data-e],[data-tab],[data-stage],.tgl,[data-copy],[data-pv],[data-pvfull],[data-att]'); if (!el || !el.closest('#editor')) return;
    if (el.dataset.att) {
      const k = el.dataset.att, i = +el.dataset.i;
      if (k === 'pick') return H.$('#att-in').click();
      if (k === 'rm') { const a = w.attachments[i]; if (!a.pending) E.removed.push(a); else URL.revokeObjectURL(a.url); w.attachments.splice(i, 1); return E.render(); }
      if (k === 'dl') { const a = w.attachments[i]; try { const b = a.pending ? a.blob : await H.store.fileBlob(a.path), u = URL.createObjectURL(b), l = document.createElement('a'); l.href = u; l.download = a.name; l.click(); setTimeout(() => URL.revokeObjectURL(u), 3000); } catch (x) { err(x.message); } return; }
    }
    if (el.dataset.pv) { E.pv = el.dataset.pv; E.updatePreview(); return; }
    if (el.dataset.pvfull) { E.pvFull = !E.pvFull; E.updatePreview(); return; }
    if (el.classList.contains('tgl')) { const k = el.parentElement.dataset.k, v = el.dataset.v, a = w[k], i = a.indexOf(v); if (i < 0) a.push(v); else a.splice(i, 1); E.render(); return; }
    if (el.dataset.tab) { E.tab = el.dataset.tab; E.render(true); return; }
    if (el.dataset.stage) { if (!canEnter(w, el.dataset.stage)) return err('این پست باید اول رئیس تأیید کند'); w.stage = el.dataset.stage; E.render(); return; }
    if (el.dataset.copy) {
      const [k, c] = el.dataset.copy.split(':'); let txt = '';
      if (k === 'caption') txt = w.caption; else if (k === 'cap') txt = w.captions[c] || w.caption; else if (k === 'utm') txt = H.utm(w, c);
      try { await navigator.clipboard.writeText(txt); } catch (x) { const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
      return H.toast('کپی شد');
    }
    const a = el.dataset.e;
    if (a === 'close') return E.close();
    if (a === 'save') { const sb = el; sb.disabled = true; try { const out = E.collect(), toDone = out.stage === 'done' && E.orig.stage !== 'done'; if (E.w.attachments.some(x => x.pending) || E.removed.length) { sb.textContent = 'در حال آپلود فایل…'; } out.attachments = await E.flush(); await H.app.saveFrom(out); E.close(); if (toDone) H.confetti(); } catch (x) { if (x.conflict) E.close(); else { err(x.message); sb.disabled = false; } } }
    if (a === 'dup') { try { const c = E.collect(); c.id = H.newId(); c.slug = ''; c.title += ' (کپی)'; c.stage = 'idea'; c.legalApproved = false; c.history = []; c.metrics = {}; c.postUrls = {}; c.attachments = []; delete c._sha; E.open(c, true); } catch (x) { err(x.message); } }
    if (a === 'del') { if (confirm('این پست حذف شود؟')) { try { await H.app.remove(E.orig); E.close(); } catch (x) { err(x.message); } } }
  });
  document.addEventListener('dragover', e => { if (E.w && e.target.closest && e.target.closest('#att,.drop') && e.dataTransfer && [...e.dataTransfer.types].includes('Files')) { e.preventDefault(); } });
  document.addEventListener('drop', e => { if (E.w && e.target.closest && e.target.closest('#att,.drop') && e.dataTransfer && e.dataTransfer.files.length) { e.preventDefault(); e.stopPropagation(); E.addFiles(e.dataTransfer.files); } }, true);
  document.addEventListener('keydown', e => {
    if (!E.w) return;
    if (e.key === 'Escape') E.close();
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); H.$('[data-e=save]') && H.$('[data-e=save]').click(); }
  });
})(window.H);
