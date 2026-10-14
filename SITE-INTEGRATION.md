# اتصال هستهٔ محتوا به سایت baje724.ir و گرفتن آمار

من سامانهٔ آمار فعلی باجه را ندیده‌ام. این سند قرارداد ساده‌ای است که توسعه‌دهندهٔ سایت می‌تواند با هر ابزار آمار پیاده کند. بدون آن هم برنامه کار می‌کند؛ فقط عددها را دستی در تب «نتیجه» وارد می‌کنید.

## ۱) لینک رهگیری (UTM) برای هر پست و شبکه
در ویرایشگر هر پست، تب «فایل و لینک»، برای هر شبکه یک لینک ساخته می‌شود:
```
https://baje724.ir/abzar/?utm_source=instagram&utm_medium=social&utm_campaign=post-02-abzar&utm_content=carousel
```
- `utm_source` = شبکه (instagram، telegram، facebook، youtube، linkedin، aparat)
- `utm_campaign` = «کد کمپین» پست (در ویرایشگر قابل تغییر؛ منحصربه‌فرد)
- `utm_content` = قالب (carousel، reel، story، single)
این لینک‌ها را در بیو، کامنت سنجاق‌شده یا استیکر استوری بگذارید. UTM فقط منبع ورود را مشخص می‌کند؛ اینکه چند نفر روی دکمه‌های شبکه‌های اجتماعی داخل سایت کلیک می‌کنند موضوع جدا است (بخش ۳).

## ۲) ثبت ورود روی سایت
سایت باید در اولین بازدید، پارامترهای UTM را بخواند و همراه رویداد بازدید و ثبت‌نام به سامانهٔ آمار بفرستد. نمونهٔ مستقل از ابزار:
```js
// در همهٔ صفحه‌ها اجرا شود
const q = new URLSearchParams(location.search);
if (q.get('utm_campaign')) {
  const utm = { source: q.get('utm_source'), medium: q.get('utm_medium'), campaign: q.get('utm_campaign'), content: q.get('utm_content') };
  sessionStorage.setItem('baje_utm', JSON.stringify(utm));
  sendEvent('social_landing', utm);          // sendEvent را با سامانهٔ آمار خودتان جایگزین کنید
}
// هنگام ثبت‌نام موفق:
const utm = JSON.parse(sessionStorage.getItem('baje_utm') || 'null');
if (utm) sendEvent('signup', utm);
```
نکته: شناسه‌های شخصی (شماره، نام) را همراه این رویدادها نفرستید.

## ۳) کلیک روی آیکن شبکه‌ها داخل سایت
برای گزارش «چند نفر روی هر آیکن کلیک کرده‌اند» رویداد جدا ثبت کنید:
```js
document.querySelectorAll('a[data-social]').forEach(a => a.addEventListener('click', () =>
  sendEvent('social_link_click', { network: a.dataset.social, placement: a.dataset.placement /* مثلاً footer */ })));
```

## ۴) نقطهٔ JSON آمار برای این برنامه (اختیاری)
یک آدرس GET که فقط عددهای تجمیعی برگرداند و هدر CORS برای آدرس برنامه بدهد (`Access-Control-Allow-Origin: https://<نام‌کاربری>.github.io`):
```json
{
  "updated": "2026-10-07",
  "campaigns": {
    "post-02-abzar": { "visits": 321, "signups": 5, "clicks": 40 }
  },
  "daily": [ { "date": "2026-10-06", "visits": 25 }, { "date": "2026-10-07", "visits": 18 } ]
}
```
- `campaigns` کلیدش همان «کد کمپین» پست است. `visits` و `signups` را برنامه در تب آمار نشان می‌دهد.
- `daily` (اختیاری) نمودار بازدید روزانه از شبکه‌ها را می‌سازد.
- فقط جمع‌ها؛ هیچ دادهٔ شخصی نباید در این پاسخ باشد. اگر آدرس عمومی است، فرض کنید هر کسی می‌تواند این عددها را ببیند.
سپس در برنامه: تنظیمات ← «نشانی JSON آمار سایت» ← ذخیره و آزمایش.

## چه چیزی هنوز معلوم نیست
- سامانهٔ آمار فعلی باجه چیست و امکان ثبت رویداد سفارشی دارد یا نه.
- اینکه سایت روی سرور داخل ایران است و Pages/GitHub از آنجا چه محدودیتی دارد: درخواست مرورگر کاربر به نقطهٔ آمار می‌رود، نه از سرور ما.
