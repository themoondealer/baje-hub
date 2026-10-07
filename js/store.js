/* داده‌ها: حالت نمونه (localStorage) یا مخزن GitHub (هر پست یک فایل JSON در team/posts) */
(function (H) {
  const S = H.S = { mode: null, token: '', repo: '', user: '', posts: [], boss: [], settings: { siteUrl: 'https://baje724.ir', statsUrl: '', theme: 'auto' }, siteStats: null };
  const DEMO = 'baje-hub-demo-v2', SET = 'baje-hub-settings-v1';
  H.STAGES = [
    { id: 'idea', name: 'ایده', color: '#9AA3C4' }, { id: 'draft', name: 'پیش‌نویس', color: '#7F95FF' },
    { id: 'review', name: 'بازبینی', color: '#2F4FE0' }, { id: 'boss', name: 'تأیید رئیس', color: '#E8A100' },
    { id: 'ready', name: 'آماده انتشار', color: '#1FA971' }, { id: 'done', name: 'منتشر شد', color: '#0E1020' }];
  H.CHANNELS = [{ n: 'اینستاگرام', k: 'instagram' }, { n: 'فیسبوک', k: 'facebook' }, { n: 'یوتیوب', k: 'youtube' }, { n: 'تلگرام', k: 'telegram' }, { n: 'لینکدین', k: 'linkedin' }, { n: 'آپارات', k: 'aparat' }];
  H.FORMATS = [{ n: 'کاروسل', k: 'carousel' }, { n: 'ریلز', k: 'reel' }, { n: 'استوری', k: 'story' }, { n: 'پست تکی', k: 'single' }];
  H.METRICS = [{ k: 'views', n: 'بازدید' }, { k: 'likes', n: 'پسند' }, { k: 'comments', n: 'نظر' }, { k: 'saves', n: 'ذخیره' }, { k: 'shares', n: 'اشتراک' }, { k: 'linkClicks', n: 'کلیک لینک' }, { k: 'followers', n: 'دنبال‌کنندهٔ جدید' }];
  H.stage = id => H.STAGES.find(s => s.id === id) || { id, name: id, color: '#9AA3C4' };
  H.chKey = n => (H.CHANNELS.find(c => c.n === n) || { k: n }).k;
  H.fmKey = n => (H.FORMATS.find(c => c.n === n) || { k: n }).k;

  try { Object.assign(S.settings, JSON.parse(localStorage.getItem(SET) || '{}')); } catch (e) {}
  H.saveSettings = () => { try { localStorage.setItem(SET, JSON.stringify(S.settings)); } catch (e) {} };

  const b64 = s => btoa(unescape(encodeURIComponent(s)));
  async function gh(url, opt = {}) {
    const r = await fetch(url, { ...opt, headers: { Authorization: 'Bearer ' + S.token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' } });
    if (r.status === 401) throw Object.assign(new Error('توکن نامعتبر یا منقضی شده است'), { auth: true });
    if (r.status === 403 || r.status === 404) throw new Error('دسترسی توکن کافی نیست (مخزن و Contents: Read and write را بررسی کنید)');
    if (r.status === 409 || r.status === 422) throw Object.assign(new Error('کس دیگری همین پست را تغییر داده؛ فهرست دوباره بارگذاری شد'), { conflict: true });
    if (!r.ok) throw new Error('خطای GitHub: ' + r.status);
    return r.status === 204 ? {} : r.json();
  }
  H.ghUser = async () => (await gh('https://api.github.com/user')).login;

  const seed = () => { const t = Date.now(); return [
    { id: 'p-intro', slug: 'post-00-moarefi', landing: '/', title: 'معرفی باجه', formats: ['کاروسل'], channels: ['اینستاگرام', 'تلگرام'], due: '2026-10-07T13:00', assignee: 'سارا', insurance: false, legalApproved: false, stage: 'draft', brief: 'کاور سفید. متن‌ها فقط از صفحهٔ اول baje724.ir.', caption: 'باجه؛ لیست بیمه تأمین اجتماعی، آنلاین و بدون نصب نرم‌افزار 📌\n\nهمان کار «لیست دیسک»، این‌بار در مرورگر.', captions: {}, files: 'posts/00-moarefi/', postUrls: {}, metrics: {}, history: [], updatedAt: t },
    { id: 'p-mohlat', slug: 'post-01-mohlat', landing: '/abzar/', title: 'مهلت ارسال لیست بیمه ۱۴۰۵', formats: ['کاروسل', 'ریلز'], channels: ['اینستاگرام', 'تلگرام', 'فیسبوک'], due: '2026-10-10T13:00', assignee: 'علی', insurance: true, legalApproved: false, stage: 'boss', brief: 'جدول ۱۲ ماه با اصلاح تعطیلات؛ منتظر تأیید رئیس.', caption: 'مهلت ارسال لیست بیمه ۱۴۰۵؛ جدول کامل ۱۲ ماه 📌', captions: {}, files: 'posts/01-mohlat/', postUrls: {}, metrics: {}, history: [], updatedAt: t - 3600e3 },
    { id: 'p-tools', slug: 'post-02-abzar', landing: '/abzar/', title: 'ابزارهای رایگان باجه', formats: ['کاروسل'], channels: ['اینستاگرام', 'فیسبوک', 'تلگرام'], due: '2026-10-14T13:00', assignee: 'مریم', insurance: false, legalApproved: false, stage: 'idea', brief: '', caption: '', captions: {}, files: '', postUrls: {}, metrics: {}, history: [], updatedAt: t - 7200e3 },
    { id: 'p-old', slug: 'post-old-1', landing: '/', title: 'نمونه: پست منتشرشده', formats: ['ریلز'], channels: ['اینستاگرام', 'تلگرام'], due: '2026-09-28T20:30', assignee: 'علی', insurance: false, legalApproved: false, stage: 'done', brief: '', caption: '', captions: {}, files: '', postUrls: {}, metrics: { 'اینستاگرام': { views: 1840, likes: 96, comments: 8, saves: 41, shares: 12, linkClicks: 33, followers: 14 }, 'تلگرام': { views: 420, likes: 18 } }, history: [], updatedAt: t - 86400e3 * 8 }]; };

  H.store = {
    async list() {
      if (S.mode === 'demo') { let d = localStorage.getItem(DEMO); if (!d) { d = JSON.stringify(seed()); localStorage.setItem(DEMO, d); } return JSON.parse(d).map(p => ({ ...p, _sha: 'demo' })); }
      const [o, n] = S.repo.split('/');
      const q = 'query($o:String!,$n:String!){repository(owner:$o,name:$n){object(expression:"HEAD:team/posts"){... on Tree{entries{name oid object{... on Blob{text}}}}}}}';
      const r = await gh('https://api.github.com/graphql', { method: 'POST', body: JSON.stringify({ query: q, variables: { o, n } }) });
      if (r.errors) throw new Error(r.errors[0].message);
      if (!r.data.repository) throw new Error('مخزن پیدا نشد یا توکن به آن دسترسی ندارد');
      const t = r.data.repository.object; if (!t) return [];
      return t.entries.filter(e => e.name.endsWith('.json') && e.object && e.object.text).map(e => { try { return { ...JSON.parse(e.object.text), _sha: e.oid }; } catch (x) { return null; } }).filter(Boolean);
    },
    async save(p) {
      const c = { ...p }; delete c._sha; c.updatedAt = Date.now();
      if (S.mode === 'demo') { const all = S.posts.filter(x => x.id !== p.id).map(x => { const y = { ...x }; delete y._sha; return y; }); all.push(c); localStorage.setItem(DEMO, JSON.stringify(all)); return; }
      const body = { message: 'hub: ' + c.title, content: b64(JSON.stringify(c, null, 2)) }; if (p._sha) body.sha = p._sha;
      await gh(`https://api.github.com/repos/${S.repo}/contents/team/posts/${c.id}.json`, { method: 'PUT', body: JSON.stringify(body) });
    },
    async del(p) {
      if (S.mode === 'demo') { localStorage.setItem(DEMO, JSON.stringify(S.posts.filter(x => x.id !== p.id).map(x => { const y = { ...x }; delete y._sha; return y; }))); return; }
      await gh(`https://api.github.com/repos/${S.repo}/contents/team/posts/${p.id}.json`, { method: 'DELETE', body: JSON.stringify({ message: 'hub: delete ' + p.title, sha: p._sha }) });
    },
    async config() {
      if (S.mode === 'demo') return { boss: [S.user] };
      try { const r = await fetch(`https://api.github.com/repos/${S.repo}/contents/team/config.json`, { headers: { Authorization: 'Bearer ' + S.token, Accept: 'application/vnd.github.raw+json' } }); if (r.ok) { const c = await r.json(); if (Array.isArray(c.boss) && c.boss.length) return c; } } catch (e) {}
      return { boss: [], unset: true }; /* تا رئیس تعیین نشده همه می‌توانند تأیید کنند؛ تنظیمات هشدار می‌دهد */
    },
    async saveConfig(cfg) {
      if (S.mode === 'demo') return;
      let sha; try { const r = await gh(`https://api.github.com/repos/${S.repo}/contents/team/config.json`); sha = r.sha; } catch (e) {}
      const body = { message: 'hub: config', content: b64(JSON.stringify(cfg, null, 2)) }; if (sha) body.sha = sha;
      await gh(`https://api.github.com/repos/${S.repo}/contents/team/config.json`, { method: 'PUT', body: JSON.stringify(body) });
    },
    /* آمار سایت: نقطهٔ JSON که خود سایت می‌دهد (راهنما: SITE-INTEGRATION.md) */
    async siteStats() {
      const u = S.settings.statsUrl; if (!u) return null;
      const r = await fetch(u, { cache: 'no-store' });
      if (!r.ok) throw new Error('نقطهٔ آمار سایت پاسخ نداد (' + r.status + ')');
      const j = await r.json(); if (!j || typeof j.campaigns !== 'object') throw new Error('قالب آمار سایت درست نیست');
      return j;
    }
  };

  /* آمادگی پست برای انتشار */
  H.ready = p => {
    const it = [
      { k: 'title', n: 'عنوان', ok: !!(p.title || '').trim(), tab: 'main' },
      { k: 'due', n: 'تاریخ انتشار', ok: !!p.due, tab: 'main' },
      { k: 'ch', n: 'شبکه‌ها', ok: (p.channels || []).length > 0, tab: 'main' },
      { k: 'fm', n: 'قالب', ok: (p.formats || []).length > 0, tab: 'main' },
      { k: 'cap', n: 'کپشن', ok: !!(p.caption || '').trim(), tab: 'cap' },
      { k: 'files', n: 'فایل‌ها', ok: !!(p.files || '').trim() || (p.attachments || []).length > 0, tab: 'links' }];
    if (p.insurance) it.push({ k: 'ok', n: 'تأیید رئیس', ok: !!p.legalApproved, tab: 'main' });
    const done = it.filter(x => x.ok).length;
    return { items: it, done, total: it.length, pct: Math.round(done / it.length * 100), missing: it.filter(x => !x.ok) };
  };

  /* فایل‌های پیوست: team/files/<postId>/<name> در مخزن (در حالت نمونه: localStorage) */
  const DEMOF = 'baje-hub-demo-files-v1';
  H.fileCache = {};
  H.store.putFile = async (postId, a) => {
    const b64 = await H.fileToB64(a.blob), path = `team/files/${postId}/${a.stored}`;
    if (S.mode === 'demo') {
      const m = JSON.parse(localStorage.getItem(DEMOF) || '{}'); m[path] = 'data:' + (a.type || 'application/octet-stream') + ';base64,' + b64;
      try { localStorage.setItem(DEMOF, JSON.stringify(m)); } catch (e) { throw new Error('حافظهٔ مرورگر برای حالت نمونه پر شد'); }
      return { path, sha: 'demo' };
    }
    const r = await gh(`https://api.github.com/repos/${S.repo}/contents/${path}`, { method: 'PUT', body: JSON.stringify({ message: 'hub: file ' + a.name, content: b64 }) });
    return { path, sha: r.content && r.content.sha };
  };
  H.store.fileBlob = async path => {
    if (S.mode === 'demo') { const m = JSON.parse(localStorage.getItem(DEMOF) || '{}'); if (!m[path]) throw new Error('فایل پیدا نشد'); return (await fetch(m[path])).blob(); }
    const r = await fetch(`https://api.github.com/repos/${S.repo}/contents/${path}`, { headers: { Authorization: 'Bearer ' + S.token, Accept: 'application/vnd.github.raw+json' } });
    if (!r.ok) throw new Error('فایل پیدا نشد (' + r.status + ')'); return r.blob();
  };
  H.store.fileURL = async path => { if (H.fileCache[path]) return H.fileCache[path]; const u = URL.createObjectURL(await H.store.fileBlob(path)); H.fileCache[path] = u; return u; };
  H.store.delFile = async a => {
    if (S.mode === 'demo') { const m = JSON.parse(localStorage.getItem(DEMOF) || '{}'); delete m[a.path]; localStorage.setItem(DEMOF, JSON.stringify(m)); return; }
    let sha = a.sha; if (!sha) { try { sha = (await gh(`https://api.github.com/repos/${S.repo}/contents/${a.path}`)).sha; } catch (e) { return; } }
    await gh(`https://api.github.com/repos/${S.repo}/contents/${a.path}`, { method: 'DELETE', body: JSON.stringify({ message: 'hub: delete file ' + a.name, sha }) });
  };
  /* اندازه و خصوصی‌بودن مخزن داده (اندازه را GitHub با تأخیر و تقریبی می‌دهد) */
  H.store.repoInfo = async () => {
    if (S.mode === 'demo') return { kb: 187000, private: true, demo: true };
    const r = await gh(`https://api.github.com/repos/${S.repo}`); return { kb: r.size || 0, private: !!r.private };
  };
  H.who = () => S.display || S.user || '';
  H.isBoss = () => S.mode === 'demo' || S.bossUnset || S.boss.map(x => x.toLowerCase()).includes((S.user || '').toLowerCase());
  H.newId = () => 'p-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  H.blank = () => ({ id: H.newId(), slug: '', landing: '/', title: '', formats: [], channels: [], due: '', assignee: '', insurance: false, legalApproved: false, stage: 'idea', brief: '', caption: '', captions: {}, files: '', attachments: [], postUrls: {}, metrics: {}, history: [] });
  H.utm = (p, channelName) => {
    const base = (S.settings.siteUrl || '').replace(/\/+$/, ''), path = p.landing || '/';
    const u = /^https?:\/\//.test(path) ? path : base + (path.startsWith('/') ? path : '/' + path);
    const q = new URLSearchParams({ utm_source: H.chKey(channelName), utm_medium: 'social', utm_campaign: p.slug || p.id, utm_content: p.formats[0] ? H.fmKey(p.formats[0]) : 'post' });
    return u + (u.includes('?') ? '&' : '?') + q.toString();
  };
  /* جمع آمار دستی یک پست */
  H.sumMetric = (p, k) => { let s = null; Object.values(p.metrics || {}).forEach(m => { if (m && m[k] !== undefined && m[k] !== null && m[k] !== '' && !isNaN(m[k])) s = (s || 0) + Number(m[k]); }); return s; };
  H.siteFor = p => (S.siteStats && S.siteStats.campaigns && S.siteStats.campaigns[p.slug || p.id]) || null;
})(window.H);
