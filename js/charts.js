/* نمودارهای سبک بدون کتابخانه (HTML/SVG) — رنگ‌ها از متغیرهای CSS؛ هر نمودار tooltip و نمای جدول دارد */
(function (H) {
  const esc = H.esc, fa = H.fa;
  const C = H.charts = {};
  /* tooltip واحد: متن فقط با textContent */
  let tip;
  C.tip = (ev, title, value) => {
    if (!tip) { tip = document.createElement('div'); tip.className = 'tip'; tip.innerHTML = '<b></b><span></span>'; document.body.appendChild(tip); }
    tip.children[0].textContent = value; tip.children[1].textContent = title; tip.hidden = false;
    const w = tip.offsetWidth, h = tip.offsetHeight; let x = ev.clientX + 14, y = ev.clientY - h - 12;
    if (x + w > innerWidth - 8) x = ev.clientX - w - 14; if (y < 8) y = ev.clientY + 16;
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  };
  C.hide = () => { if (tip) tip.hidden = true; };
  document.addEventListener('pointermove', e => { const t = e.target.closest('[data-tt]'); if (t) C.tip(e, t.dataset.tt, t.dataset.tv); else C.hide(); });
  document.addEventListener('focusin', e => { const t = e.target.closest('[data-tt]'); if (t) { const r = t.getBoundingClientRect(); C.tip({ clientX: r.left + r.width / 2, clientY: r.top }, t.dataset.tt, t.dataset.tv); } });
  document.addEventListener('focusout', C.hide);

  /* ردیف‌های افقی: برچسب، میله، عدد */
  C.barH = (items, o = {}) => {
    const max = Math.max(1, ...items.map(i => i.value || 0));
    return `<div class="bh" role="list">${items.map(i => `<div class="bh-r" role="listitem" tabindex="0" data-tt="${esc(i.label)}" data-tv="${esc(o.unit ? H.num(i.value) + ' ' + o.unit : H.num(i.value))}">
      <span class="bh-l" title="${esc(i.label)}">${esc(i.label)}</span>
      <span class="bh-t"><i style="width:${Math.max(i.value ? 2 : 0, (i.value || 0) / max * 100)}%;background:${i.color || 'var(--s1)'}"></i></span>
      <span class="bh-v">${H.num(i.value)}</span></div>`).join('')}</div>`;
  };
  /* ستونی عمودی با خط‌های راهنمای کم‌رنگ */
  C.barV = (items, o = {}) => {
    const W = 560, Hh = o.h || 200, pl = 8, pr = 8, pt = 22, pb = 30, n = items.length || 1;
    const max = Math.max(1, ...items.map(i => i.value || 0)), step = (W - pl - pr) / n, bw = Math.min(46, step * .56);
    const ticks = [0, .5, 1].map(f => { const y = pt + (Hh - pt - pb) * (1 - f); return `<line x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}" class="gl"/>`; }).join('');
    const bars = items.map((i, k) => {
      const h = (Hh - pt - pb) * ((i.value || 0) / max), x = pl + step * k + (step - bw) / 2, y = Hh - pb - h;
      return `<g tabindex="0" data-tt="${esc(i.label)}" data-tv="${esc(H.num(i.value) + (o.unit ? ' ' + o.unit : ''))}">
        <rect x="${pl + step * k}" y="${pt}" width="${step}" height="${Hh - pt - pb}" fill="transparent"/>
        <path d="${h > 4 ? `M${x} ${Hh - pb}V${y + 4}Q${x} ${y} ${x + 4} ${y}H${x + bw - 4}Q${x + bw} ${y} ${x + bw} ${y + 4}V${Hh - pb}Z` : `M${x} ${Hh - pb}h${bw}v-2h-${bw}z`}" fill="${i.color || 'var(--s1)'}" class="mk"/>
        ${items.length <= 8 && i.value ? `<text x="${x + bw / 2}" y="${y - 6}" class="vl" text-anchor="middle">${H.num(i.value)}</text>` : ''}
        <text x="${x + bw / 2}" y="${Hh - 10}" class="xl" text-anchor="middle">${esc(i.label)}</text></g>`;
    }).join('');
    return `<svg class="bv" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${esc(o.aria || 'نمودار ستونی')}">${ticks}${bars}</svg>`;
  };
  /* خط/ناحیه با crosshair */
  C.line = (pts, o = {}) => {
    const W = 560, Hh = o.h || 190, pl = 8, pr = 8, pt = 18, pb = 28, n = pts.length;
    const max = Math.max(1, ...pts.map(p => p.value || 0)), sx = i => pl + (n === 1 ? (W - pl - pr) / 2 : (W - pl - pr) * i / (n - 1)), sy = v => pt + (Hh - pt - pb) * (1 - v / max);
    const d = pts.map((p, i) => (i ? 'L' : 'M') + sx(i).toFixed(1) + ' ' + sy(p.value || 0).toFixed(1)).join('');
    const area = d + `L${sx(n - 1)} ${Hh - pb}L${sx(0)} ${Hh - pb}Z`;
    const gl = [0, .5, 1].map(f => { const y = pt + (Hh - pt - pb) * (1 - f); return `<line x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}" class="gl"/>`; }).join('');
    const xl = pts.map((p, i) => (n <= 8 || i % Math.ceil(n / 8) === 0) ? `<text x="${sx(i)}" y="${Hh - 8}" class="xl" text-anchor="middle">${esc(p.label)}</text>` : '').join('');
    const hits = pts.map((p, i) => `<rect x="${sx(i) - (W - pl - pr) / Math.max(1, n - 1) / 2}" y="${pt}" width="${(W - pl - pr) / Math.max(1, n - 1)}" height="${Hh - pt - pb}" fill="transparent" tabindex="0" data-i="${i}" data-tt="${esc(p.label)}" data-tv="${esc(H.num(p.value) + (o.unit ? ' ' + o.unit : ''))}"/>`).join('');
    const dots = pts.map((p, i) => `<circle cx="${sx(i)}" cy="${sy(p.value || 0)}" r="4" class="dot"/>`).join('');
    return `<svg class="ln" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${esc(o.aria || 'نمودار خطی')}">${gl}<path d="${area}" class="ar"/><path d="${d}" class="lp"/>${dots}${xl}${hits}</svg>`;
  };
  /* یک میلهٔ انباشته با شکاف ۲px */
  C.stack = (items) => {
    const tot = items.reduce((a, i) => a + i.value, 0) || 1;
    return `<div class="stk" role="list">${items.map(i => i.value ? `<i role="listitem" tabindex="0" style="flex:${i.value};background:${i.color}" data-tt="${esc(i.label)}" data-tv="${esc(H.num(i.value) + ' پست · ' + fa(Math.round(i.value / tot * 100)) + '٪')}"></i>` : '').join('')}</div>
      <div class="lgd">${items.map(i => `<span><i style="background:${i.color}"></i>${esc(i.label)} <b>${fa(i.value)}</b></span>`).join('')}</div>`;
  };
  C.table = (head, rows) => `<div class="tbl"><table><thead><tr>${head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  /* کارت نمودار با دکمهٔ «جدول» */
  C.card = (title, sub, chart, table, cls = '') => `<section class="cc ${cls}"><header><div><h3>${esc(title)}</h3>${sub ? `<p>${esc(sub)}</p>` : ''}</div>${table ? `<button class="mini" data-act="tbl" aria-label="نمای جدول">${H.ic('table', 16)}جدول</button>` : ''}</header><div class="cv">${chart}</div>${table ? `<div class="ct" hidden>${table}</div>` : ''}</section>`;
  /* sparkline کوچک */
  C.spark = vals => { const W = 90, Hh = 28, m = Math.max(1, ...vals), n = vals.length; return `<svg class="sp" viewBox="0 0 ${W} ${Hh}" aria-hidden="true"><path d="${vals.map((v, i) => (i ? 'L' : 'M') + (n === 1 ? W / 2 : W * i / (n - 1)).toFixed(1) + ' ' + (Hh - 3 - (Hh - 6) * v / m).toFixed(1)).join('')}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`; };
})(window.H);
