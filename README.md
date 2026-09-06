<div align="center">

# 🚀 آزمایشگاه مجازی نیرو و حرکت
# 🚀 Interactive Physics Motion Simulator

### شبیه‌سازی فیزیکی تعاملی نیرو و حرکت — قانون دوم نیوتن و اصطکاک
### An interactive, physics-based force & motion simulator — Newton's Second Law & Friction

<p>
<img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black">
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
<img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white">
<img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white">
</p>

`#Physics` `#NewtonsLaws` `#Friction` `#Motion` `#Kinematics` `#Force` `#Simulator` `#PhysicsEducation` `#STEM`

</div>

---

## 🔗 لینک ورود &nbsp;|&nbsp; Open the simulator

<div align="center">

### ▶️ [ورود به شبیه‌ساز · Open the simulator](https://fatemeh1203.github.io/Smart-Simulators-ShowCase/motion/)

`https://fatemeh1203.github.io/Smart-Simulators-ShowCase/motion/`

**رمز · Password:** `project`

</div>

**فارسی:** شبیه‌ساز روی **GitHub Pages** منتشر شده و با لینک بالا مستقیماً در مرورگر باز می‌شود. با باز کردن آن، یک صفحهٔ ورود نمایش داده می‌شود. هر کسی که رمز بالا را وارد کند می‌تواند شبیه‌ساز را ببیند. رمز تا پایان همان نشست مرورگر (session) ذخیره می‌ماند و با بستن مرورگر دوباره پرسیده می‌شود. (نسخهٔ استاتیک از همین سورس ساخته و روی برنچ `main` در مسیر `motion/` قرار گرفته است.)

**English:** The simulator is published on **GitHub Pages** and opens straight in the browser from the link above. Opening it shows a login screen. Anyone who types the password above can view the simulator. The unlock is remembered for the current browser session and is asked again after the browser is closed. (A static build from this source is hosted on the `main` branch under `motion/`.)

> ⚠️ **این یک قفلِ سمتِ‌کاربر (client-side) است، نه امنیت واقعی.** چون کل برنامه یک فایل استاتیک است، رمز عبور در سورس صفحه قابل مشاهده است و کاربر فنی می‌تواند آن را دور بزند. این قفل فقط جلوی دسترسی اتفاقی را می‌گیرد؛ برای دادهٔ حساس مناسب نیست.
>
> ⚠️ **This is a client-side gate, not real security.** Because the whole app is a static file, the password is visible in the page source and a technical user can bypass it. It only keeps casual visitors out — do not rely on it for sensitive data.

برای تغییر رمز، مقدار `PASSWORD` را در `motion-src/src/Gate.tsx` عوض کنید، دوباره بیلد بگیرید و خروجی را روی `main/motion/` جایگزین کنید.
To change the password, edit `PASSWORD` in `motion-src/src/Gate.tsx`, rebuild, and replace the copy at `main/motion/`.

> **📌 سورس این پروژه روی همین برنچ (`motion-lab`) نگه‌داری می‌شود؛ نسخهٔ منتشرشده روی `main/motion/` است.**
> **The source lives on this `motion-lab` branch; the published build is on `main/motion/`.**

---

## ▶️ اجرا &nbsp;|&nbsp; How to run

### گزینهٔ ۱ — فایل آمادهٔ بیلد‌شده &nbsp;|&nbsp; Option 1 — prebuilt file
فایل `index.html` در ریشهٔ این برنچ، نسخهٔ کاملاً خودکفا و بیلد‌شده است (همهٔ کدها و استایل‌ها در همان یک فایل قرار دارند). کافی است آن را در مرورگر باز کنید.

The `index.html` at the root of this branch is a fully self-contained, prebuilt bundle (all code and styles are inlined in that one file). Just open it in a browser.

### گزینهٔ ۲ — از روی سورس &nbsp;|&nbsp; Option 2 — from source
```bash
cd motion-src
npm install
npm run dev      # اجرای محلی برای توسعه · local dev server
npm run build    # ساخت نسخهٔ تک‌فایلی در dist/index.html · build the single-file bundle
```
خروجی `motion-src/dist/index.html` را می‌توانید جایگزین `index.html` ریشه کنید.
Copy the resulting `motion-src/dist/index.html` over the root `index.html`.

> **فارسی:** چون این فایل کاملاً خودکفاست (بدون هیچ مسیر نسبی)، برای انتشار روی GitHub Pages فقط کافی است همان فایل در `main/motion/index.html` کپی شود — بدون نیاز به تنظیم مسیر پایه.
> **English:** Since the file is fully self-contained (no relative paths), publishing to GitHub Pages is just a copy to `main/motion/index.html` — no base-path configuration needed.

---

## 📚 محتوای شبیه‌ساز &nbsp;|&nbsp; What's inside

**فارسی:** شبیه‌سازی تعاملی قانون دوم نیوتن و اصطکاک، با پنج حالت کاری.

**English:** An interactive simulation of Newton's second law and friction, with five working modes.

| # | English | فارسی |
|:-:|:--|:--|
| ۱ | Lab | آزمایشگاه |
| ۲ | Compare | مقایسه |
| ۳ | Challenge | آزمایش کن |
| ۴ | Predict | پیش‌بینی کن |
| ۵ | Concepts | مفاهیم |

**فارسی:** چهار نوع سطح با ضریب اصطکاک متفاوت — یخ (μ=۰.۰۵)، چوب (μ=۰.۳)، بتن (μ=۰.۶) — و امکان تنظیم آزادانهٔ جرم، نیروی واردشده و سرعت اولیه.

**English:** Four surface types with different friction coefficients — ice (μ=0.05), wood (μ=0.3), concrete (μ=0.6) — with free control over mass, applied force, and initial velocity.

- 🌐 **دو‌زبانه / Bilingual** — فارسی و انگلیسی، با تغییر جهت کامل (RTL/LTR) · Persian and English, with full RTL/LTR switching
- 🎯 **حالت پیش‌بینی / Predict mode** — قبل از دیدن نتیجه، حدس بزن · guess the outcome before seeing it
- ⚖️ **حالت مقایسه / Compare mode** — دو سناریو را کنار هم ببین · see two scenarios side by side
- 🏆 **آزمایش کن / Challenge mode** — سؤال‌های عملی برای محک زدن یادگیری · practical questions to test what you learned
- 📊 **نمودارهای زندهٔ نیرو، سرعت و مکان بر حسب زمان / Live force, velocity and position vs. time charts**
- 🔬 **شبیه‌سازی فیزیکی واقعی / Real physics** — F = ma، وزن، نیروی عمودی، اصطکاک<br>F = ma, weight, normal force, friction

---

## 🗂️ ساختار این برنچ &nbsp;|&nbsp; Branch layout

| مسیر / Path | توضیح / Description |
|:--|:--|
| `index.html` | نسخهٔ بیلد‌شده و خودکفا با قفل رمز — prebuilt, self-contained, gated app |
| `motion-src/` | سورس کامل (React + Vite + TypeScript) — full source |
| `motion-src/src/Gate.tsx` | کامپوننت قفل رمز — the password gate component |
| `motion-src/src/physics.ts` | موتور محاسبات فیزیکی و انواع سطح — the physics engine and surface types |
| `motion-src/src/components/` | نمای آزمایشگاه، مقایسه، چالش و پیش‌بینی — Lab, Compare, Challenge and Predict views |

---

## 📄 مجوز &nbsp;|&nbsp; License

منتشر شده تحت مجوز موجود در فایل [LICENSE](LICENSE).
Released under the license in [LICENSE](LICENSE).

<div align="center">
<br>
<sub>ساخته شده برای پژوهش و آموزش &nbsp;·&nbsp; Built for research and teaching</sub>
</div>
