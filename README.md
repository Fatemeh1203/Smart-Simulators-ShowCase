<div align="center">

# 🔬 شبیه‌ساز حسگر جریان فیبر نوری
# 🔬 Fiber-Optic Current Sensor Simulator

### شبیه‌سازی تعاملی سه‌فازِ حسگر جریان فیبر نوری — با محاسبات عددی واقعی
### An interactive, three-phase simulator of a fiber-optic current sensor with real numerical computation

<p>
<img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black">
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
<img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white">
<img alt="Plotly" src="https://img.shields.io/badge/Plotly.js-3-3F4F75?style=for-the-badge&logo=plotly&logoColor=white">
</p>

</div>

---

> **📌 این برنچ فقط برای پروژهٔ شبیه‌ساز فیبر نوری است.**
> این برنچ (`fiber-optic-sensor`) به‌صورت جداگانه نگه‌داری می‌شود و از سایر شبیه‌سازها مستقل است.
>
> **This branch holds only the Fiber-Optic Current Sensor Simulator.** It is kept separate from the other simulators.

---

## 🔐 رمز ورود &nbsp;|&nbsp; Access password

برای دیدن شبیه‌ساز باید رمز عبور را وارد کنید:

To view the simulator you must enter the password:

```
project01
```

**فارسی:** با باز کردن `index.html`، یک صفحهٔ ورود نمایش داده می‌شود. هر کسی که رمز بالا را وارد کند می‌تواند شبیه‌ساز را ببیند. رمز تا پایان همان نشست مرورگر (session) ذخیره می‌ماند و با بستن مرورگر دوباره پرسیده می‌شود.

**English:** Opening `index.html` shows a login screen. Anyone who types the password above can view the simulator. The unlock is remembered for the current browser session and is asked again after the browser is closed.

> ⚠️ **این یک قفلِ سمتِ‌کاربر (client-side) است، نه امنیت واقعی.** چون کل برنامه یک فایل استاتیک است، رمز عبور در سورس صفحه قابل مشاهده است و کاربر فنی می‌تواند آن را دور بزند. این قفل فقط جلوی دسترسی اتفاقی را می‌گیرد؛ برای دادهٔ حساس مناسب نیست.
>
> ⚠️ **This is a client-side gate, not real security.** Because the whole app is a static file, the password is visible in the page source and a technical user can bypass it. It only keeps casual visitors out — do not rely on it for sensitive data.

برای تغییر رمز، مقدار `PASSWORD` را در `fiber-src/src/Gate.tsx` عوض کنید و دوباره بیلد بگیرید.
To change the password, edit `PASSWORD` in `fiber-src/src/Gate.tsx` and rebuild.

---

## ▶️ اجرا &nbsp;|&nbsp; How to run

### گزینهٔ ۱ — فایل آمادهٔ بیلد‌شده &nbsp;|&nbsp; Option 1 — prebuilt file
فایل `index.html` در ریشهٔ این برنچ، نسخهٔ کاملاً خودکفا و بیلد‌شده است (همهٔ کدها، استایل‌ها و Plotly در همان یک فایل قرار دارند). کافی است آن را در مرورگر باز کنید.

The `index.html` at the root of this branch is a fully self-contained, prebuilt bundle (all code, styles and Plotly are inlined in that one file). Just open it in a browser.

> تنها منبع خارجی، فونت Vazirmatn از Google Fonts است؛ برای نمایش بهتر فارسی، بار اول به اینترنت نیاز دارد.
> The only external resource is the Vazirmatn font from Google Fonts, needed once for nicer Persian text.

### گزینهٔ ۲ — از روی سورس &nbsp;|&nbsp; Option 2 — from source
```bash
cd fiber-src
npm install
npm run dev      # اجرای محلی برای توسعه · local dev server
npm run build    # ساخت نسخهٔ تک‌فایلی در dist/index.html · build the single-file bundle
```
خروجی `fiber-src/dist/index.html` را می‌توانید جایگزین `index.html` ریشه کنید.
Copy the resulting `fiber-src/dist/index.html` over the root `index.html`.

---

## 📚 محتوای شبیه‌ساز &nbsp;|&nbsp; What's inside

| فاز / Phase | فارسی | English |
|:-:|:--|:--|
| **۱** | اثر فارادی + میکروخمش در فیبر دومُدی | Faraday effect + microbending in two-mode fiber |
| **۲** | ساختار SMS و تداخل چندمُدی | SMS structure and multimode interference |
| **۳** | SMS + میکروخمش + نانوذرهٔ مغناطیسی (Ferrofluid) | SMS + microbending + magnetic nanoparticles (ferrofluid) |

**فارسی:** هر فاز شامل ستاپ آزمایشگاهی، روابط فیزیکی مستند، نمودارهای دوبعدی/سه‌بعدی با حالت‌های «با میدان» و «بدون میدان»، تحلیل کمّی و فاز پیشنهادی اصلاحی است. همهٔ نمودارها از محاسبات عددی واقعی (Plotly.js) تولید می‌شوند.

**English:** Each phase includes a lab setup, documented physics relations, 2D/3D plots with "field on / field off" states, quantitative analysis and a proposed corrective phase. All plots are produced from real numerical computation (Plotly.js).

---

## 🏷️ نسخه‌ها و تگ‌ها &nbsp;|&nbsp; Releases & tags

نسخه‌های این شبیه‌ساز با **تگ‌های گیت** علامت‌گذاری می‌شوند (مثلاً `fiber-optic-sensor-v1.0`). برای دیدن همهٔ تگ‌ها:

Releases of this simulator are marked with **git tags** (e.g. `fiber-optic-sensor-v1.0`). To list all tags:

```bash
git tag                       # فهرست تگ‌ها · list tags
git checkout fiber-optic-sensor-v1.0
```

---

## 🗂️ ساختار این برنچ &nbsp;|&nbsp; Branch layout

| مسیر / Path | توضیح / Description |
|:--|:--|
| `index.html` | نسخهٔ بیلد‌شده و خودکفا با قفل رمز — prebuilt, self-contained, gated app |
| `fiber-src/` | سورس کامل (React + Vite + TypeScript) — full source |
| `fiber-src/src/Gate.tsx` | کامپوننت قفل رمز — the password gate component |

---

## 📄 مجوز &nbsp;|&nbsp; License

منتشر شده تحت مجوز موجود در فایل [LICENSE](LICENSE).
Released under the license in [LICENSE](LICENSE).

<div align="center">
<br>
<sub>ساخته شده برای پژوهش و آموزش &nbsp;·&nbsp; Built for research and teaching</sub>
</div>
