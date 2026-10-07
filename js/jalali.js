/* تقویم شمسی بر پایهٔ Intl؛ ذخیره‌سازی همیشه با تاریخ میلادی ISO و ساعت تهران است */
(function (H) {
  H.MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
  H.DOW = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
  H.DOW_FULL = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
  const pf = new Intl.DateTimeFormat('en-u-ca-persian-nu-latn', { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' });
  H.toJ = d => { const p = pf.formatToParts(d), g = t => +(p.find(x => x.type === t) || {}).value; return { y: g('year') || g('relatedYear'), m: g('month'), d: g('day') }; };
  const cmp = (a, b) => (a.y - b.y) || (a.m - b.m) || (a.d - b.d);
  H.fromJ = (y, m, d) => {
    let dt = new Date(Date.UTC(y + 621, 2, 21) + Math.floor((m - 1) * 30.5 + d - 1) * 864e5); const tg = { y, m, d };
    for (let i = 0; i < 40; i++) { const c = cmp(H.toJ(dt), tg); if (c === 0) return dt; dt = new Date(dt.getTime() + (c < 0 ? 1 : -1) * 864e5); }
    return dt;
  };
  H.isoDate = d => d.toISOString().slice(0, 10);
  H.isoToJ = iso => H.toJ(new Date(iso.slice(0, 10) + 'T00:00:00Z'));
  H.monthLen = (y, m) => Math.round((m === 12 ? H.fromJ(y + 1, 1, 1) : H.fromJ(y, m + 1, 1)) - H.fromJ(y, m, 1)) / 864e5 | 0;
  H.dowIndex = d => (d.getUTCDay() + 1) % 7; /* شنبه = ۰ */
  H.fmtDay = iso => { if (!iso) return ''; const j = H.isoToJ(iso); return H.fa(j.d) + ' ' + H.MONTHS[j.m - 1]; };
  H.fmtDue = due => { if (!due) return 'بدون تاریخ'; return H.fmtDay(due) + (due.length > 10 ? ' · ' + H.fa(due.slice(11, 16)) : ''); };
  H.fmtFull = iso => { if (!iso) return ''; const d = new Date(iso.slice(0, 10) + 'T00:00:00Z'); return H.DOW_FULL[H.dowIndex(d)] + ' ' + H.fmtDay(iso) + ' ' + H.fa(H.toJ(d).y); };
  H.dueToInput = due => {
    if (!due) return { d: '', t: '' };
    const j = H.isoToJ(due);
    return { d: H.fa(j.y + '/' + String(j.m).padStart(2, '0') + '/' + String(j.d).padStart(2, '0')), t: due.slice(11, 16) };
  };
  H.inputToDue = (d, t) => {
    d = H.en(d).trim(); t = H.en(t).trim(); if (!d) return '';
    const m = d.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (!m) throw new Error('تاریخ را مثل ۱۴۰۵/۰۷/۱۵ بنویسید');
    const y = +m[1], mo = +m[2], da = +m[3];
    if (mo < 1 || mo > 12 || da < 1 || da > H.monthLen(y, mo)) throw new Error('این تاریخ وجود ندارد');
    let out = H.isoDate(H.fromJ(y, mo, da));
    if (t) { if (!/^\d{1,2}:\d{2}$/.test(t)) throw new Error('ساعت را مثل ۱۳:۰۰ بنویسید'); out += 'T' + t.padStart(5, '0'); }
    return out;
  };
  /* کلید ماه شمسی برای نمودارها */
  H.monthKey = iso => { const j = H.isoToJ(iso); return j.y * 100 + j.m; };
})(window.H);
