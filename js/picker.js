/* انتخابگر تاریخ (شمسی) و ساعت: روی هر ورودی با data-pick="date" یا "time" باز می‌شود؛ تایپ دستی هم کار می‌کند.
   مقدار را در ورودی می‌نویسد و رویداد input می‌فرستد تا برنامه مثل تایپ دستی رفتار کند. روی گوشی به‌صورت برگهٔ پایین باز می‌شود. */
(function (H) {
  const fa = H.fa, p2 = n => String(n).padStart(2, '0');
  let el = null, host = null, st = null;
  const close = () => { if (el) { el.remove(); el = null; } const bd = document.getElementById('pkbd'); if (bd) bd.remove(); host = null; };
  const push = v => { if (!host) return; host.value = v; host.dispatchEvent(new Event('input', { bubbles: true })); host.dispatchEvent(new Event('change', { bubbles: true })); };
  const parseD = v => { const m = H.en(v || '').trim().match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/); return m ? { y: +m[1], m: +m[2], d: +m[3] } : null; };
  const fmtD = (y, m, d) => fa(y + '/' + p2(m) + '/' + p2(d));
  const shiftDay = n => { const t = new Date(H.todayISO() + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t; };
  const nextSat = () => { const t = new Date(H.todayISO() + 'T00:00:00Z'); do t.setUTCDate(t.getUTCDate() + 1); while (H.dowIndex(t) !== 0); return t; };

  function dateHtml() {
    const { y, m } = st, sel = parseD(host.value), td = H.toJ(new Date(H.todayISO() + 'T00:00:00Z'));
    const len = H.monthLen(y, m), off = H.dowIndex(H.fromJ(y, m, 1));
    let cells = ''; for (let i = 0; i < off; i++) cells += '<i></i>';
    for (let d = 1; d <= len; d++) {
      const isSel = sel && sel.y === y && sel.m === m && sel.d === d, isTd = td.y === y && td.m === m && td.d === d, fri = (off + d - 1) % 7 === 6;
      cells += `<button type="button" class="pkd ${isSel ? 'sel' : ''} ${isTd ? 'td' : ''} ${fri ? 'fri' : ''}" data-pd="${d}">${fa(d)}</button>`;
    }
    const years = []; for (let k = td.y - 1; k <= td.y + 3; k++) years.push(k);
    return `<div class="pkh"><button type="button" class="pkn" data-pm="1" aria-label="ماه بعد">${H.ic('chevL', 16)}</button>
      <select class="pks" data-pms>${H.MONTHS.map((n, i) => `<option value="${i + 1}" ${i + 1 === m ? 'selected' : ''}>${n}</option>`).join('')}</select>
      <select class="pks" data-pys>${years.map(k => `<option value="${k}" ${k === y ? 'selected' : ''}>${fa(k)}</option>`).join('')}</select>
      <button type="button" class="pkn" data-pm="-1" aria-label="ماه قبل">${H.ic('chevR', 16)}</button></div>
      <div class="pkg">${H.DOW.map(x => `<b>${x}</b>`).join('')}${cells}</div>
      <div class="pkf"><button type="button" class="pkq" data-pq="0">امروز</button><button type="button" class="pkq" data-pq="1">فردا</button><button type="button" class="pkq" data-pq="sat">شنبهٔ آینده</button><button type="button" class="pkq x" data-pq="clear">پاک کردن</button></div>`;
  }
  const PRESETS = ['09:30', '12:30', '13:00', '13:30', '20:30'];
  function timeHtml() {
    const cur = (H.en(host.value || '').match(/^(\d{1,2}):(\d{2})$/) || []), h = cur[1] !== undefined ? +cur[1] : null, mi = cur[2] !== undefined ? +cur[2] : null;
    return `<div class="pkf" style="margin:0 0 10px"><span class="pkl">پیشنهادهای آزمایشی</span>${PRESETS.map(t => `<button type="button" class="pkq ${host.value && H.en(host.value) === t ? 'sel' : ''}" data-pt="${t}">${fa(t)}</button>`).join('')}</div>
      <span class="pkl">ساعت</span><div class="pkt">${Array.from({ length: 24 }, (_, i) => `<button type="button" class="pkd ${h === i ? 'sel' : ''}" data-ph="${i}">${fa(p2(i))}</button>`).join('')}</div>
      <span class="pkl">دقیقه</span><div class="pkt m">${[0, 10, 15, 20, 30, 40, 45, 50].map(i => `<button type="button" class="pkd ${mi === i ? 'sel' : ''}" data-pn="${i}">${fa(p2(i))}</button>`).join('')}</div>
      <div class="pkf"><button type="button" class="pkq" data-pq="now">اکنون (وقت تهران)</button><button type="button" class="pkq x" data-pq="clear">پاک کردن</button><button type="button" class="pkq ok" data-pq="close">تأیید</button></div>`;
  }
  function render() { if (!el) return; el.innerHTML = st.kind === 'date' ? dateHtml() : timeHtml(); }
  function place() {
    if (window.innerWidth < 640) { el.classList.add('sheet'); return; }
    const r = host.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight;
    let left = Math.min(Math.max(8, r.right - w), window.innerWidth - w - 8), top = r.bottom + 6; if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 6);
    el.style.left = left + 'px'; el.style.top = top + 'px';
  }
  function open(input) {
    if (host === input && el) return; close(); host = input;
    const kind = input.dataset.pick, d = parseD(input.value), td = H.toJ(new Date(H.todayISO() + 'T00:00:00Z'));
    st = { kind, y: d ? d.y : td.y, m: d ? d.m : td.m };
    el = document.createElement('div'); el.id = 'pk'; el.className = 'pk'; el.setAttribute('role', 'dialog'); el.dir = 'rtl';
    if (window.innerWidth < 640) { const bd = document.createElement('div'); bd.id = 'pkbd'; bd.className = 'pkbd'; document.body.appendChild(bd); }
    document.body.appendChild(el); render(); place();
  }
  document.addEventListener('focusin', e => { const t = e.target; if (t.dataset && t.dataset.pick) open(t); });
  document.addEventListener('click', e => { const t = e.target; if (t.dataset && t.dataset.pick) open(t); });
  document.addEventListener('mousedown', e => { if (el && !el.contains(e.target) && e.target !== host) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && el) { e.stopImmediatePropagation(); const h = host; close(); if (h) h.focus(); } });
  window.addEventListener('resize', () => { if (el && host) place(); });
  document.addEventListener('click', e => {
    if (!el || !el.contains(e.target)) return; const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
    if (d.pm) { st.m += +d.pm; if (st.m > 12) { st.m = 1; st.y++; } if (st.m < 1) { st.m = 12; st.y--; } return render(); }
    if (d.pd) { push(fmtD(st.y, st.m, +d.pd)); close(); return; }
    if (d.pq) {
      if (d.pq === 'clear') { push(''); close(); return; } if (d.pq === 'close') { close(); return; }
      if (d.pq === 'now') { const n = new Date(Date.now() + 3.5 * 3600e3); push(fa(p2(n.getUTCHours()) + ':' + p2(n.getUTCMinutes()))); return render(); }
      const dt = d.pq === 'sat' ? nextSat() : shiftDay(+d.pq), j = H.toJ(dt); push(fmtD(j.y, j.m, j.d)); close(); return;
    }
    if (d.pt) { push(fa(d.pt)); return render(); }
    if (d.ph !== undefined || d.pn !== undefined) { const c = H.en(host.value || '').match(/^(\d{1,2}):(\d{2})$/); let h = c ? +c[1] : 13, mi = c ? +c[2] : 0; if (d.ph !== undefined) h = +d.ph; else mi = +d.pn; push(fa(p2(h) + ':' + p2(mi))); render(); }
  });
  document.addEventListener('change', e => { if (!el || !el.contains(e.target)) return; if (e.target.dataset.pms !== undefined) { st.m = +e.target.value; render(); } if (e.target.dataset.pys !== undefined) { st.y = +e.target.value; render(); } });
})(window.H);
