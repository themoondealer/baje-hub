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
  /* حد نویسه: اینستاگرام ۲۲۰۰ و تلگرام ۱۰۲۴ شناخته‌شده؛ بله/روبیکا/ایتا را مثل تلگرام تقریبی می‌گیریم (تأییدنشده)؛ فیسبوک عدد قطعی ندارد */
  const LIM = { 'اینستاگرام': [2200, 'کپشن'], 'تلگرام': [1024, 'کپشن پست دارای تصویر'], 'بله': [1024, 'کپشن تصویر؛ حد بله تأییدنشده و تقریبی'], 'روبیکا': [1024, 'کپشن تصویر؛ حد روبیکا تأییدنشده و تقریبی'], 'ایتا': [1024, 'کپشن تصویر؛ حد ایتا تأییدنشده و تقریبی'], 'فیسبوک': [0, 'متن پست'] };
  const SKIN = { 'تلگرام': 'tg', 'بله': 'bale', 'روبیکا': 'rub', 'ایتا': 'eit' };
  const MAIN6 = ['اینستاگرام', 'فیسبوک', 'تلگرام', 'بله', 'روبیکا', 'ایتا'];
  /* متن نهایی هر شبکه: همان کاری که ناشر می‌کند (کپشن + فوتر + لینک رهگیری) */
  const finalText = (w, c) => H.finalText(w, c);
  /* تصویرهای ذخیره‌شده فقط در تب «فایل و لینک» بارگذاری می‌شدند؛ پیش‌نمایش خودش هم آن‌ها را می‌گیرد (هر مسیر یک‌بار) */
  const loading = {};
  const imgs = (w, c) => (w.attachments || []).filter(H.isImg).filter(a => !c || chosen(w, c).includes(a.name)).map(a => {
    if (a.pending) return a.url;
    if (!H.fileCache[a.path] && a.path && !loading[a.path]) { loading[a.path] = 1; H.store.fileURL(a.path).then(() => E.updatePreview && E.updatePreview(), () => { loading[a.path] = 2; }); }
    return H.fileCache[a.path];
  }).filter(Boolean);
  const media = (w, cls, c) => { const u = imgs(w, c); const n = (w.attachments || []).filter(H.isImg).filter(a => chosen(w, c).includes(a.name)).length;
    if (!u.length) return `<div class="igi"><small>${esc(w.formats[0] || 'پست')}</small><b>${esc(w.title || 'عنوان پست')}</b></div>`;
    return `<div class="slides ${cls}">${u.map(s => `<img src="${s}" alt="">`).join('')}</div>${n > 1 ? `<div class="slc">${fa(n)} تصویر؛ برای دیدن بقیه بکشید${u.length < n ? ' (در حال بارگذاری…)' : ''}</div>` : ''}`; };
  const one = (w, c) => {
    const cap = finalText(w, c), skin = SKIN[c], user = esc(S_name());
    if (c === 'اینستاگرام') { const short = cap.length > 125 && !E.pvFull ? cap.slice(0, 125).replace(/\s+\S*$/, '') : cap;
      return `<div class="ig"><div class="igh"><span class="av" style="width:30px;height:30px;font-size:11px">B</span><b>baje724.ir</b></div>${media(w, 'sq', c)}<div class="igc">${cap ? `<b>baje724.ir</b> ${hl(short)}${short.length < cap.length ? ' <span class="more">… بیشتر</span>' : ''}` : '<span class="sub">کپشن را بنویسید تا اینجا دیده شود</span>'}</div></div>`; }
    if (c === 'فیسبوک') return `<div class="ig fb"><div class="igh"><span class="av" style="width:34px;height:34px;font-size:12px">B</span><span><b>باجه</b><br><small class="sub">اکنون · 🌐</small></span></div><div class="igc">${cap ? hl(cap) : '<span class="sub">متن را بنویسید</span>'}</div>${media(w, 'wide', c)}<div class="fbb"><span>👍 پسندیدن</span><span>💬 نظر</span><span>↗ اشتراک‌گذاری</span></div></div>`;
    if (skin) return `<div class="tgm ${skin}"><div class="chh">${esc(c)} · کانال baje724</div><div class="bub">${media(w, 'wide', c)}${cap ? hl(cap) : '<span class="sub">کپشن را بنویسید</span>'}<small>${fa(new Date().getHours())}:${fa(String(new Date().getMinutes()).padStart(2, '0'))}</small></div></div>`;
    return `<div class="tgm"><div class="bub">${cap ? hl(cap) : '<span class="sub">متن را بنویسید</span>'}<small>${esc(c)}</small></div></div>`;
  };
  const S_name = () => 'باجه';
  const pvHtml = w => {
    const chs = w.channels.length ? w.channels : MAIN6, cur = chs.includes(E.pv) ? E.pv : chs[0], all = !!E.pvAll;
    const info = c => { const cap = finalText(w, c), l = (LIM[c] || [0, 'متن'])[0], over = l && cap.length > l; return { cap, l, over }; };
    const head = `<div class="pvh"><div class="tg">${chs.map(c => `<button type="button" class="tgl ${!all && c === cur ? 'on' : ''}" data-pv="${esc(c)}">${esc(c)}</button>`).join('')}<button type="button" class="tgl ${all ? 'on' : ''}" data-pvall="1">همه شبکه‌ها</button></div></div>`;
    const block = c => { const { cap, l, over } = info(c); return `<div class="pvb">${all ? `<div class="pvt"><b>${esc(c)}</b>` : '<div class="pvt">'}<span class="pill ${over ? 'w' : l && cap.length > l * .9 ? 'a' : ''}">${fa(cap.length)}${l ? ' / ' + fa(l) : ' نویسه'}</span></div>${one(w, c)}${over ? `<div class="err" style="margin-top:8px">متن ${esc(c)} از حد این شبکه بلندتر است؛ کوتاهش کنید.</div>` : ''}${LIM[c] ? `<div class="pvf"><span class="sub">${esc(LIM[c][1])}${l ? ' حدود ' + fa(l) + ' نویسه' : ''}</span></div>` : ''}</div>`; };
    return head + (all ? chs.map(block).join('') : block(cur)) + `<div class="pvf"><span class="sub">پیش‌نمایش تقریبی: ظاهر و حد هر شبکه ممکن است فرق کند. لینک رهگیری آخر متن، همان است که ناشر اضافه می‌کند${w.autoPublish ? '' : ' (انتشار خودکار این پست خاموش است)'}.</span>${cur === 'اینستاگرام' && !all ? `<button type="button" class="mini" data-pvfull="1">${E.pvFull ? 'نمایش کوتاه' : 'نمایش کامل'}</button>` : ''}</div>`;
  };
  E.updatePreview = () => { const el = H.$('#pv'); if (el && E.w) el.innerHTML = pvHtml(E.w); };
  const tabMain = w => {
    const boss = H.isBoss();
    return `${rdy(w)}<label class="f">عنوان / موضوع</label><input class="in" data-m="title" value="${esc(w.title)}" placeholder="مثلاً: معرفی ابزارهای رایگان">
    <div class="r2 keep"><div><label class="f">تاریخ انتشار (شمسی)</label><input class="in pickin" data-pick="date" autocomplete="off" data-m="_d" dir="ltr" placeholder="۱۴۰۵/۰۷/۲۰" value="${esc(w._d)}"></div>
    <div><label class="f">ساعت (وقت تهران)</label><input class="in pickin" data-pick="time" autocomplete="off" data-m="_t" dir="ltr" placeholder="۱۳:۰۰" value="${esc(w._t)}"></div></div>
    <div class="r2"><div><label class="f">مسئول</label><input class="in" data-m="assignee" value="${esc(w.assignee)}"></div>
    <div><label class="f">لینک مقصد در سایت</label><input class="in" data-m="landing" dir="ltr" value="${esc(w.landing || '/')}" placeholder="/abzar/"></div></div>
    <label class="f">قالب</label>${toggles(w.formats, H.FORMATS, 'formats')}
    <label class="f">شبکه‌ها</label>${toggles(w.channels, H.CHANNELS, 'channels')}
    <label class="chk w"><input type="checkbox" data-m="insurance" ${w.insurance ? 'checked' : ''}><span>پست دربارهٔ بیمه، قانون یا تاریخ مهلت است؛ باید رئیس تأیید کند.</span></label>
    <label class="chk"><input type="checkbox" data-m="legalApproved" ${w.legalApproved ? 'checked' : ''} ${boss ? '' : 'disabled'}><span>${boss ? 'تأیید رئیس: متن و تاریخ‌ها درست است' : 'تأیید رئیس (فقط رئیس می‌تواند بزند)'}</span></label>
    <label class="chk"><input type="checkbox" data-m="autoPublish" ${w.autoPublish ? 'checked' : ''}><span>ارسال خودکار: وقتی مرحله «آماده» شد و زمانش رسید، خودش در شبکه‌های متصل (تلگرام، بله، روبیکا، ایتا، فیسبوک، اینستاگرام) منتشر شود. بقیه دستی‌اند.</span></label>
    <label class="f">بریف و متن اصلی</label><textarea class="in" data-m="brief">${esc(w.brief)}</textarea>`;
  };
  const tabCap = w => `<div class="pv" id="pv">${pvHtml(w)}</div><div class="cr"><b>کپشن اصلی</b><span class="cnt" id="cnt-main">${fa((w.caption || '').length)} نویسه</span><button class="btn s sm" data-copy="caption">${ic('copy', 14)}کپی</button></div>
    <textarea class="in" data-m="caption" style="min-height:190px">${esc(w.caption)}</textarea>
    ${w.channels.map(c => `<div class="cr"><b>ویژهٔ ${esc(c)} <small class="sub">(اختیاری؛ خالی یعنی کپشن اصلی)</small></b><button class="btn s sm" data-copy="cap:${esc(c)}">${ic('copy', 14)}کپی</button></div><textarea class="in" data-cap="${esc(c)}">${esc(w.captions[c] || '')}</textarea>`).join('') || '<p class="help">ابتدا در تب «محتوا» شبکه‌ها را انتخاب کنید.</p>'}`;
  /* لینک رهگیری و فوتر پیام: هر دو اختیاری و قابل تنظیم برای هر پست */
  const utmHtml = w => { const u = w.utm || {}, on = u.on !== false;
    return `<div class="cr"><b>لینک رهگیری (UTM)</b></div>
    <label class="chk"><input type="checkbox" data-ux="on" ${on ? 'checked' : ''}><span>لینک رهگیری به انتهای متن اضافه شود (اینستاگرام لینک کلیک‌پذیر ندارد و همیشه بدون لینک می‌رود).</span></label>
    ${on ? `<div class="r2"><div><label class="f">medium (نوع کانال)</label><input class="in" dir="ltr" data-ux="medium" value="${esc(u.medium || '')}" placeholder="social"></div><div><label class="f">campaign (کمپین)</label><input class="in" dir="ltr" data-ux="campaign" value="${esc(u.campaign || '')}" placeholder="${esc(w.slug || w.id)}"></div></div>
    <div class="r2"><div><label class="f">content (شناسهٔ قالب/نسخه)</label><input class="in" dir="ltr" data-ux="content" value="${esc(u.content || '')}" placeholder="${esc(w.formats[0] ? H.fmKey(w.formats[0]) : 'post')}"></div><div><label class="f">term (اختیاری)</label><input class="in" dir="ltr" data-ux="term" value="${esc(u.term || '')}" placeholder=""></div></div>
    <p class="help">خالی بگذارید تا مقدار پیش‌فرض (خاکستری) استفاده شود. برای هر شبکه می‌توانید source را عوض کنید یا یک لینک کامل دلخواه بگذارید؛ لینک کامل بر همه چیز مقدم است.</p>
    ${w.channels.map(c => `<div class="cfr utr"><b>${esc(c)}</b><input class="in" dir="ltr" data-us="${esc(c)}" value="${esc((u.sources || {})[c] || '')}" placeholder="source: ${esc(H.chKey(c))}"><input class="in" dir="ltr" data-ul="${esc(c)}" value="${esc((u.links || {})[c] || '')}" placeholder="لینک کامل دلخواه (اختیاری)"><code class="utres" data-uc="${esc(c)}">${esc(c === 'اینستاگرام' ? 'بدون لینک در کپشن' : H.utm(w, c))}</code></div>`).join('') || '<p class="help">اول شبکه‌ها را در تب «محتوا» انتخاب کنید.</p>'}` : ''}`; };
  const footHtml = w => { const f = w.footer || {}, F = (H.S.tpl && H.S.tpl.footers) || {};
    return `<div class="cr" style="margin-top:14px"><b>فوتر پیام</b></div>
    <label class="chk"><input type="checkbox" data-fx="on" ${f.on ? 'checked' : ''}><span>فوتر در انتهای متن اضافه شود (قالبش در تنظیمات ← «فوتر پیام» است؛ جانشین‌ها: {link} {title} {site} {channel}).</span></label>
    ${f.on ? `<label class="f">متن اختصاصی این پست (اختیاری؛ جای قالب را می‌گیرد)</label><textarea class="in" data-fx="text" placeholder="${esc(F['*'] || 'قالبی تعریف نشده؛ از تنظیمات بسازید.')}">${esc(f.text || '')}</textarea>
    <div class="cfr">${w.channels.map(c => `<b style="flex:0 0 100%;font-size:12px">${esc(c)}</b><div class="fres">${esc(H.footerText(w, c) || 'فوتری ندارد')}</div>`).join('') || '<span class="help">شبکه‌ای انتخاب نشده.</span>'}</div>` : ''}`; };
  const MAXF = 20 * 1048576;
  /* فایل هر شبکه: w.channelFiles[شبکه] = نام پیوست‌های همان شبکه؛ نبودن کلید یعنی همهٔ تصویرها (همان منطق ناشر) */
  const imgNames = w => (w.attachments || []).filter(H.isImg).map(a => a.name);
  const chosen = (w, c) => { const sel = w.channelFiles && w.channelFiles[c]; return Array.isArray(sel) ? sel : imgNames(w); };
  const cfHtml = w => { const names = imgNames(w); if (!names.length || !w.channels.length) return '';
    return `<div class="cr" style="margin-top:14px"><b>تصویرهای هر شبکه</b></div><p class="help">هر شبکه چیدمان خودش را دارد: تلگرام و فیسبوک آلبوم/چندتصویری می‌گیرند؛ بله، روبیکا و ایتا آلبوم ندارند و هر تصویر یک پیام جدا می‌شود، پس برایشان یک تصویر کافی است. فقط تیک‌دارها ارسال می‌شوند.</p>`
      + w.channels.map(c => `<div class="cfr"><b>${esc(c)}</b>${names.map(n => `<label class="chk"><input type="checkbox" data-cf="${esc(c)}|${esc(n)}" ${chosen(w, c).includes(n) ? 'checked' : ''}><span>${esc(n)}</span></label>`).join('')}</div>`).join(''); };
  const attHtml = w => `<div class="cr"><b>تصویر و فایل‌ها</b><button type="button" class="btn s sm" data-att="pick">${ic('plus', 14)} افزودن</button></div>
    <input type="file" id="att-in" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip" hidden>
    <div class="att" id="att">${(w.attachments || []).map((a, i) => `<div class="at"><div class="th">${H.isImg(a) ? `<img data-i="${i}" alt="${esc(a.name)}">` : ic('file', 26)}</div><div class="ti"><b title="${esc(a.name)}">${esc(a.name)}</b><small>${H.fmtSize(a.size || 0)}${a.pending ? ' · با «ذخیره» آپلود می‌شود' : ''}</small></div><button type="button" class="mini" data-att="dl" data-i="${i}">دانلود</button><button type="button" class="mini" data-att="rm" data-i="${i}" aria-label="حذف">${ic('x', 13, 2.2)}</button></div>`).join('') || `<div class="drop" data-att="pick">${ic('plus', 24)}<span>تصویر را اینجا بکشید یا بزنید</span></div>`}</div>
    <p class="help" style="margin-top:6px">تصویرهای بزرگ خودکار فشرده می‌شوند. فایل‌ها تا ${H.fa(20)} مگابایت. ویدیو و ریلز را با لینک (مثلاً Google Drive) بگذارید؛ ریپو برای فایل سنگین مناسب نیست.</p>${cfHtml(w)}`;
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
  const tabLinks = w => `${utmHtml(w)}${footHtml(w)}<hr class="sp">${attHtml(w)}<label class="f">لینک فایل‌های دیگر (ویدیو، Drive، ...) یا مسیر پوشه، هر مورد یک خط</label><textarea class="in" data-m="files">${esc(w.files)}</textarea>
    <div class="links">${(w.files || '').split('\n').filter(x => /^https?:\/\//.test(x.trim())).map(x => `<a href="${esc(x.trim())}" target="_blank" rel="noopener">${esc(x.trim())}</a>`).join('')}</div>
    <div class="cr"><b>لینک رهگیری هر شبکه (UTM)</b></div><p class="help" style="margin:0 0 4px">این لینک‌ها را در بیو، کامنت یا استیکر استوری بگذارید تا بازدید سایت به همین پست برگردد.</p>
    <div class="r2" style="margin-bottom:6px"><div><label class="f">کد کمپین (انگلیسی)</label><input class="in" data-m="slug" dir="ltr" value="${esc(w.slug)}" placeholder="خودکار"></div><div></div></div>
    ${w.channels.map(c => `<div class="utm"><b>${esc(c)}</b><code>${esc(H.utm(w, c))}</code><button class="btn s sm" data-copy="utm:${esc(c)}" aria-label="کپی">${ic('copy', 14)}</button></div>`).join('') || '<p class="help">برای ساخت لینک، شبکه انتخاب کنید.</p>'}`;
  const tabRes = w => `<p class="help" style="margin-top:12px">بعد از انتشار، لینک پست و عددهای هر شبکه را وارد کنید. عددی را که ندارید خالی بگذارید؛ خالی با صفر فرق دارد.</p>
    ${w.channels.map(c => { const m = w.metrics[c] || {}; return `<div class="chm"><h4>${esc(c)}</h4><label class="f" style="margin-top:0">لینک پست</label><input class="in" dir="ltr" data-url="${esc(c)}" value="${esc(w.postUrls[c] || '')}" placeholder="https://...">
      <div class="mg" style="margin-top:10px">${H.METRICS.map(x => `<div><label>${x.n}</label><input class="in" inputmode="numeric" data-met="${esc(c)}|${x.k}" value="${m[x.k] === undefined || m[x.k] === null ? '' : esc(fa(m[x.k]))}"></div>`).join('')}</div></div>`; }).join('') || '<p class="help">شبکه‌ای انتخاب نشده.</p>'}`;
  const tabHist = w => `<ul class="hist" style="padding:0;margin-top:10px">${(w.history || []).slice().reverse().map(h => `<li>${esc(h)}</li>`).join('') || '<li>هنوز تغییر مرحله‌ای ثبت نشده.</li>'}</ul>`;


  /* نظر رئیس: رئیس دستور اصلاح می‌نویسد؛ اصلاح (خودکار با Claude یا دستی) آن را done می‌کند و پست دوباره برای تأیید می‌آید */
  const tabRev = w => {
    const rs = (w.reviews || []).slice().reverse(), boss = H.isBoss(), openN = rs.filter(r => r.status === 'open').length;
    const chip = r => r.status === 'open' ? '<span class="pill w">منتظر اصلاح</span>' : '<span class="pill o">اصلاح شد</span>';
    return `<p class="help" style="margin-top:12px">${boss ? 'اگر متن یا تاریخ درست نیست، همین‌جا بنویسید چه چیزی چطور عوض شود. پست به پیش‌نویس برمی‌گردد، اصلاح می‌شود و دوباره برای تأیید شما می‌آید.' : 'نظر رئیس اینجا می‌آید. اگر اصلاح خودکار فعال باشد Claude متن را اصلاح می‌کند و پست دوباره برای رئیس می‌رود.'}</p>
      ${boss ? `<label class="f">نظر یا دستور اصلاح</label><textarea class="in" id="rv-text" placeholder="مثلاً: در کپشن تلگرام جملهٔ دوم را کوتاه‌تر کن و تاریخ را با ماه بنویس" style="min-height:110px"></textarea>
        <div class="cr"><button class="btn p" data-e="reqchg">${ic('send', 16)} ارسال برای اصلاح</button></div>` : ''}
      ${!boss && openN ? `<label class="f">پاسخ شما (اختیاری)</label><textarea class="in" id="rv-reply" placeholder="چه چیزی را عوض کردید؟" style="min-height:70px"></textarea>
        <div class="cr"><button class="btn s" data-e="rvdone">${ic('check', 16)} خودم اصلاح کردم؛ دوباره برای رئیس بفرست</button></div>` : ''}
      ${rs.map(r => `<div class="chm"><div class="cr"><b>${esc(r.by || 'رئیس')} <small class="sub">${esc(r.at || '')}</small></b>${chip(r)}</div><p style="white-space:pre-wrap;margin:8px 0">${esc(r.text)}</p>${r.reply ? `<p class="help"><b>${esc(r.doneBy || 'پاسخ')}:</b> ${esc(r.reply)}</p>` : ''}</div>`).join('') || '<p class="help">هنوز نظری ثبت نشده.</p>'}`;
  };

  /* شبکه‌هایی که انتشارشان خودکار است؛ بقیه با «بستهٔ انتشار» دستی منتشر می‌شوند */
  const AUTO = ['تلگرام', 'بله', 'روبیکا', 'ایتا', 'لینکدین'];
  const tabPub = w => {
    const man = w.channels.filter(c => !AUTO.includes(c)), aut = w.channels.filter(c => AUTO.includes(c)), imgs = (w.attachments || []).filter(H.isImg);
    const att = imgs.length ? `<div class="cr"><b>تصویرها</b>${imgs.length > 1 ? `<button type="button" class="btn s sm" data-att="dlall">دانلود همه</button>` : ''}</div><div class="att">${imgs.map(a => `<div class="at"><div class="ti"><b title="${esc(a.name)}">${esc(a.name)}</b><small>${H.fmtSize(a.size || 0)}</small></div><button type="button" class="mini" data-att="dl" data-i="${w.attachments.indexOf(a)}">دانلود</button></div>`).join('')}</div>` : '<p class="help">تصویری ضمیمه نشده. در تب «فایل و لینک» اضافه کنید.</p>';
    const card = c => `<div class="chm"><h4>${esc(c)}</h4>
      <div class="cr"><b>کپشن</b><button type="button" class="btn s sm" data-copy="cap:${esc(c)}">${ic('copy', 14)} کپی</button></div>
      <textarea class="in" readonly style="min-height:110px">${esc(w.captions[c] || w.caption || '')}</textarea>
      <div class="utm"><b>لینک رهگیری</b><code>${esc(H.utm(w, c))}</code><button class="btn s sm" data-copy="utm:${esc(c)}" aria-label="کپی">${ic('copy', 14)}</button></div>
      <label class="f">لینک پست بعد از انتشار</label><input class="in" dir="ltr" data-url="${esc(c)}" value="${esc(w.postUrls[c] || '')}" placeholder="https://...">
      ${w.postUrls[c] ? '<p class="help">✓ ثبت شده</p>' : ''}</div>`;
    return `<p class="help" style="margin-top:12px">برای شبکه‌هایی که انتشار خودکار ندارند (مثل اینستاگرام و فیسبوک): تصویرها را دانلود کنید، کپشن را کپی کنید، در خود شبکه منتشر کنید، بعد لینک پست را اینجا بگذارید و ذخیره کنید.</p>
      ${aut.length ? `<p class="help">خودکار: ${aut.map(esc).join('، ')}${w.autoPublish ? '' : ' (گزینهٔ «ارسال خودکار» در تب محتوا خاموش است)'}</p>` : ''}
      ${att}
      ${man.map(card).join('') || '<p class="help">همهٔ شبکه‌های این پست خودکارند، یا هنوز شبکه‌ای انتخاب نشده.</p>'}`;
  };

  E.render = (full) => {
    const w = E.w, host = H.$('#editor'), idx = ST.findIndex(s => s.id === w.stage);
    const prev = H.$('.db', host), sc = prev ? prev.scrollTop : 0;
    const tabs = [['main', 'محتوا'], ['cap', 'کپشن‌ها'], ['links', 'فایل و لینک'], ['pub', 'انتشار دستی'], ['rev', 'نظر رئیس'], ['res', 'نتیجه'], ['hist', 'تاریخچه']];
    host.innerHTML = `<div class="scrim" data-e="close"></div><aside class="drawer" role="dialog" aria-modal="true" aria-label="ویرایش پست">
      <div class="dh"><h2>${E.isNew ? 'پست جدید' : esc(w.title || 'ویرایش پست')}</h2><button class="xb" data-e="close" aria-label="بستن">${ic('x', 18)}</button></div>
      <div class="steps">${ST.map((s, i) => `<button class="step ${i === idx ? 'on' : i < idx ? 'past' : ''}" data-stage="${s.id}">${i < idx ? ic('check', 13, 2.4) : ''}${s.name}</button>`).join('')}</div>
      <div class="dtabs" role="tablist">${tabs.map(([k, n]) => `<button class="dtab ${E.tab === k ? 'on' : ''}" role="tab" data-tab="${k}">${n}${k === 'rev' && (w.reviews || []).some(r => r.status === 'open') ? ' <span class="pill w">باز</span>' : ''}</button>`).join('')}</div>
      <div id="eerr" class="err hide" hidden style="margin:10px 22px 0"></div>
      <div class="db">${({ main: tabMain, cap: tabCap, links: tabLinks, pub: tabPub, rev: tabRev, res: tabRes, hist: tabHist })[E.tab](w)}</div>
      <div class="df"><button class="btn p" data-e="save">${ic('check', 17, 2.2)} ذخیره</button>${!E.isNew ? `<button class="btn s" data-e="dup">${ic('copy', 16)} کپی پست</button><button class="btn d" data-e="del">${ic('trash', 16)} حذف</button>` : ''}<button class="btn g" data-e="close" style="margin-inline-start:auto">بستن</button></div></aside>`;
    const nb = H.$('.db', host); if (nb && !full) nb.scrollTop = sc;
    E.hydrate();
    if (full) setTimeout(() => { const t = H.$('[data-m=title]', host); if (t && E.isNew) t.focus(); }, 60);
  };
  const err = m => { const x = H.$('#eerr'); if (!x) return H.toast(m, 4000, 'bad'); x.textContent = m; x.hidden = false; x.scrollIntoView({ block: 'nearest' }); };
  E.err = err;

  const SIG = x => JSON.stringify([x.title, x.caption, x.captions, x.due]);
  const nextSlug = () => { const used = new Set(S.posts.map(p => p.slug)); let n = S.posts.length; let s; do { s = 'post-' + String(n++).padStart(2, '0'); } while (used.has(s)); return s; };

  E.collect = () => {
    const w = E.w; w.title = (w.title || '').trim();
    if (!w.title) throw new Error('عنوان را بنویسید');
    w.due = H.inputToDue(w._d || '', w._t || '');
    w.slug = (w.slug || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || nextSlug();
    if (S.posts.some(p => p.id !== w.id && p.slug === w.slug)) throw new Error('این کد کمپین قبلاً برای پست دیگری استفاده شده');
    Object.keys(w.captions).forEach(k => { if (!w.channels.includes(k) || !String(w.captions[k]).trim()) delete w.captions[k]; });
    const hist = [...(w.history || [])], stamp = `${new Date().toLocaleString('fa-IR')} — ${H.who() || 'ناشناس'}`;
    /* قفل تأیید: اگر ادمین بعد از تأیید رئیس متن یا تاریخ را عوض کند، تأیید باطل می‌شود */
    if (w.insurance && w.legalApproved) {
      if (H.isBoss()) w.approvedSig = SIG(w);
      else if ((w.approvedSig ?? SIG(E.orig)) !== SIG(w)) {
        w.legalApproved = false; hist.push(stamp + ': تأیید رئیس باطل شد (متن یا تاریخ عوض شد)');
        if (w.stage === 'ready' || w.stage === 'done') { hist.push(stamp + ': ' + H.stage(w.stage).name + ' ← تأیید رئیس'); w.stage = 'boss'; }
      }
    }
    if (!w.legalApproved) delete w.approvedSig;
    const er = H.moveError(w, w.stage, E.orig.stage); if (er) throw new Error(er);
    if (w.stage !== E.orig.stage) hist.push(`${stamp}: ${H.stage(E.orig.stage).name} ← ${H.stage(w.stage).name}`);
    w.history = hist;
    const out = clone({ ...w, attachments: [] }); delete out._d; delete out._t; return out;
  };

  /* رویدادها */
  const host = () => H.$('#editor');
  document.addEventListener('input', e => {
    const w = E.w; if (!w) return; const t = e.target;
    if (t.dataset.m) { const k = t.dataset.m; w[k] = t.type === 'checkbox' ? t.checked : t.value; if (k === 'caption') { const c = H.$('#cnt-main'); if (c) c.textContent = fa(t.value.length) + ' نویسه'; E.updatePreview(); } if (k === 'insurance' || k === 'legalApproved') {} }
    else if (t.dataset.cap) { w.captions[t.dataset.cap] = t.value; E.updatePreview(); }
    else if (t.dataset.ux || t.dataset.us || t.dataset.ul || t.dataset.fx) {
      w.utm = w.utm || {}; w.footer = w.footer || {};
      if (t.dataset.ux) w.utm[t.dataset.ux] = t.value; else if (t.dataset.us) (w.utm.sources = w.utm.sources || {})[t.dataset.us] = t.value; else if (t.dataset.ul) (w.utm.links = w.utm.links || {})[t.dataset.ul] = t.value; else w.footer[t.dataset.fx] = t.value;
      H.$$('.utres').forEach(el => { const c = el.dataset.uc; el.textContent = c === 'اینستاگرام' ? 'بدون لینک در کپشن' : H.utm(w, c); });
      H.$$('.fres').forEach((el, i) => { el.textContent = H.footerText(w, w.channels[i]) || 'فوتری ندارد'; });
      E.updatePreview && E.updatePreview();
    }
    else if (t.dataset.url) w.postUrls[t.dataset.url] = t.value.trim();
    else if (t.dataset.met) { const [c, k] = t.dataset.met.split('|'); w.metrics[c] = w.metrics[c] || {}; const v = H.en(t.value).replace(/[^\d.]/g, ''); if (v === '') delete w.metrics[c][k]; else w.metrics[c][k] = Number(v); }
  });
  document.addEventListener('change', e => { const t0 = e.target; if (E.w && t0.dataset && (t0.dataset.ux === 'on' || t0.dataset.fx === 'on') && t0.type === 'checkbox') { if (t0.dataset.ux) { E.w.utm = E.w.utm || {}; E.w.utm.on = t0.checked; } else { E.w.footer = E.w.footer || {}; E.w.footer.on = t0.checked; } E.render(); return; }
    const cf = e.target.dataset && e.target.dataset.cf; if (cf && E.w) { const [c, n] = cf.split('|'), w = E.w; const cur = chosen(w, c).slice(); const i = cur.indexOf(n); if (e.target.checked && i < 0) cur.push(n); if (!e.target.checked && i >= 0) cur.splice(i, 1); const order = imgNames(w); w.channelFiles = { ...(w.channelFiles || {}), [c]: order.filter(x => cur.includes(x)) }; E.updatePreview(); return; }
    if (e.target.id === 'att-in') { E.addFiles(e.target.files); e.target.value = ''; return; } const t = e.target; if (E.w && t.dataset.m && (t.dataset.m === 'insurance' || t.dataset.m === 'legalApproved')) E.render(); });
  document.addEventListener('click', async e => {
    const w = E.w; if (!w) return; const el = e.target.closest('[data-e],[data-tab],[data-stage],.tgl,[data-copy],[data-pv],[data-pvfull],[data-att]'); if (!el || !el.closest('#editor')) return;
    if (el.dataset.att) {
      const k = el.dataset.att, i = +el.dataset.i;
      if (k === 'pick') return H.$('#att-in').click();
      if (k === 'rm') { const a = w.attachments[i]; if (!a.pending) E.removed.push(a); else URL.revokeObjectURL(a.url); w.attachments.splice(i, 1); return E.render(); }
      if (k === 'dlall') { for (const a of w.attachments.filter(H.isImg)) { try { const b = a.pending ? a.blob : await H.store.fileBlob(a.path), u = URL.createObjectURL(b), l = document.createElement('a'); l.href = u; l.download = a.name; l.click(); setTimeout(() => URL.revokeObjectURL(u), 3000); await new Promise(r => setTimeout(r, 400)); } catch (x) { err(x.message); } } return; }
      if (k === 'dl') { const a = w.attachments[i]; try { const b = a.pending ? a.blob : await H.store.fileBlob(a.path), u = URL.createObjectURL(b), l = document.createElement('a'); l.href = u; l.download = a.name; l.click(); setTimeout(() => URL.revokeObjectURL(u), 3000); } catch (x) { err(x.message); } return; }
    }
    if (el.dataset.pvall) { E.pvAll = !E.pvAll; E.updatePreview(); return; }
    if (el.dataset.pv) { E.pv = el.dataset.pv; E.pvAll = false; E.updatePreview(); return; }
    if (el.dataset.pvfull) { E.pvFull = !E.pvFull; E.updatePreview(); return; }
    if (el.classList.contains('tgl')) { const k = el.parentElement.dataset.k, v = el.dataset.v, a = w[k], i = a.indexOf(v); if (i < 0) a.push(v); else a.splice(i, 1); E.render(); return; }
    if (el.dataset.tab) { E.tab = el.dataset.tab; E.render(true); return; }
    if (el.dataset.stage) { const er = H.moveError(w, el.dataset.stage, E.orig.stage); if (er) return err(er); w.stage = el.dataset.stage; E.render(); return; }
    if (el.dataset.copy) {
      const [k, c] = el.dataset.copy.split(':'); let txt = '';
      if (k === 'caption') txt = w.caption; else if (k === 'cap') txt = w.captions[c] || w.caption; else if (k === 'utm') txt = H.utm(w, c);
      try { await navigator.clipboard.writeText(txt); } catch (x) { const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
      return H.toast('کپی شد');
    }
    const a = el.dataset.e;
    if (a === 'close') return E.close();
    if (a === 'reqchg' || a === 'rvdone') {
      const stamp = `${new Date().toLocaleString('fa-IR')} — ${H.who() || 'ناشناس'}`;
      if (a === 'reqchg') {
        const txt = ((H.$('#rv-text') || {}).value || '').trim(); if (!txt) return err('نظر را بنویسید');
        w.reviews = [...(w.reviews || []), { id: 'r' + Date.now().toString(36), by: H.who() || 'رئیس', at: new Date().toLocaleString('fa-IR'), text: txt, status: 'open' }];
        w.legalApproved = false; if (['review', 'boss', 'ready'].includes(w.stage)) w.stage = 'draft';
        w.history = [...(w.history || []), stamp + ': رئیس نظر گذاشت و پست برای اصلاح برگشت'];
      } else {
        const rp = ((H.$('#rv-reply') || {}).value || '').trim() || 'اصلاح شد.';
        w.reviews = (w.reviews || []).map(r => r.status === 'open' ? { ...r, status: 'done', reply: rp, doneBy: H.who() || 'ادمین', doneAt: new Date().toISOString() } : r);
        w.legalApproved = false; w.stage = 'boss';
        w.history = [...(w.history || []), stamp + ': اصلاح انجام شد؛ منتظر تأیید رئیس'];
      }
      const sv = H.$('[data-e=save]'); if (sv) sv.click(); return;
    }
    if (a === 'save') { const sb = el; sb.disabled = true; try { const out = E.collect(), toDone = out.stage === 'done' && E.orig.stage !== 'done'; if (E.w.attachments.some(x => x.pending) || E.removed.length) { sb.textContent = 'در حال آپلود فایل…'; } out.attachments = await E.flush(); await H.app.saveFrom(out); E.close(); if (toDone) H.confetti(); } catch (x) { if (x.conflict) E.close(); else { err(x.message); sb.disabled = false; } } }
    if (a === 'dup') { try { const c = E.collect(); c.id = H.newId(); c.slug = ''; c.title += ' (کپی)'; c.stage = 'idea'; c.legalApproved = false; c.autoPublish = false; c.history = []; c.metrics = {}; c.postUrls = {}; c.attachments = []; delete c._sha; E.open(c, true); } catch (x) { err(x.message); } }
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
