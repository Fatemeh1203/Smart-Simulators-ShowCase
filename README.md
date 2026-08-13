# Smart Simulators ShowCase

شبیه‌سازی‌های تعاملی آموزشی، پژوهشی، علمی و آزمایشگاهی.
شبیه‌ساز کاملاً روی GitHub Pages میزبانی می‌شود و مستقیم در مرورگر اجرا می‌شود — بدون نصب، بدون دانلود.

---

## 🔬 ورود به شبیه‌ساز

روی این لینک کلیک کنید:

### 👉 https://fatemeh1203.github.io/Smart-Simulators-ShowCase/

با کلیک روی این لینک وارد صفحهٔ ویترین می‌شوید. در آن صفحه دکمهٔ **«ورود به شبیه‌ساز»** را بزنید تا **آزمایشگاه مجازی** باز شود.

اگر می‌خواهید یک‌مرحله‌ای و مستقیم وارد خود آزمایشگاه مجازی شوید، این لینک را باز کنید:

### 👉 https://fatemeh1203.github.io/Smart-Simulators-ShowCase/lab/

---

## دربارهٔ شبیه‌ساز

**آزمایشگاه مجازی ریاضی کلاس چهارم دبستان** — یک محیط تعاملی برای یادگیری و تمرین، شامل هفت فصل:

| فصل | موضوع |
| --- | --- |
| ۱ | اعداد و الگوها |
| ۲ | کسرها |
| ۳ | ضرب و تقسیم |
| ۴ | زاویه و زمان |
| ۵ | عدد مخلوط و عدد اعشاری |
| ۶ | شکل‌های هندسی |
| ۷ | آمار و احتمال |

هر فصل شبیه‌ساز تعاملی، اهداف یادگیری، آزمون چندگزینه‌ای با پاسخ تشریحی و کارنامه دارد.

---

## راهنمای استفاده

1. لینک بالا را در مرورگر باز کنید (کروم، فایرفاکس، اج یا سافاری).
2. روی دکمهٔ **«ورود به شبیه‌ساز»** کلیک کنید.
3. از منوی کناری فصل مورد نظر را انتخاب کنید.
4. با شبیه‌ساز هر فصل کار کنید و در پایان آزمون آن فصل را بدهید.

> نکته: برای تجربهٔ بهتر، صفحه را روی نمایشگر بزرگ‌تر یا در حالت تمام‌صفحه باز کنید.

---

## ساختار مخزن

| مسیر | توضیح |
| --- | --- |
| `index.html` | صفحهٔ ویترین با دکمهٔ ورود به شبیه‌ساز |
| `lab/index.html` | خود شبیه‌ساز — فایل build شده و کاملاً خودکفا |
| `simulator.html` | تغییر مسیر به `lab/` (برای لینک‌های قدیمی) |
| `simulator-src/` | سورس‌کد شبیه‌ساز (React + TypeScript + Vite + Tailwind) |
| `README.md` | همین راهنما |
| `LICENSE` | مجوز استفاده |

---
پروژه با `vite-plugin-singlefile` ساخته می‌شود، بنابراین خروجی یک فایل HTML خودکفاست که همهٔ CSS و JavaScript داخل آن جاسازی شده است.

---

## English

An interactive **virtual math lab for 4th-grade elementary school**, covering seven chapters
with simulators, learning goals, quizzes and a report card.

**Open the simulator here:** https://fatemeh1203.github.io/Smart-Simulators-ShowCase/

Click the **«ورود به شبیه‌ساز» (Enter Simulator)** button on that page to open the virtual lab,
or go straight to https://fatemeh1203.github.io/Smart-Simulators-ShowCase/lab/.
It runs entirely in the browser — no installation required.

Built with React, TypeScript, Vite and Tailwind CSS. Source lives in `simulator-src/`.

---

## مجوز

این پروژه تحت مجوز موجود در فایل [LICENSE](LICENSE) منتشر شده است.
