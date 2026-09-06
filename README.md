<div align="center">

# 📈 آزمایشگاه خط و معادله‌های خطی
# 📈 Interactive Linear Equations Simulator

### شبیه‌سازی تعاملی خط، شیب و معادلهٔ خطی — ریاضی پایه نهم
### An interactive line, slope, and linear-equation simulator — Grade 9 Math

<p>
<img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black">
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
<img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white">
<img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white">
</p>

`#LinearEquations` `#Math` `#Slope` `#CoordinatePlane` `#MathEducation` `#STEM` `#Simulator` `#Grade9Math`

</div>

---

## 🔗 لینک ورود &nbsp;|&nbsp; Open the simulator

<div align="center">

### ▶️ [ورود به شبیه‌ساز · Open the simulator](https://fatemeh1203.github.io/Smart-Simulators-ShowCase/linear/)

`https://fatemeh1203.github.io/Smart-Simulators-ShowCase/linear/`

**رمز · Password:** `project`

</div>

**فارسی:** شبیه‌ساز روی **GitHub Pages** منتشر شده و با لینک بالا مستقیماً در مرورگر باز می‌شود. با باز کردن آن، یک صفحهٔ ورود نمایش داده می‌شود. هر کسی که رمز بالا را وارد کند می‌تواند شبیه‌ساز را ببیند. رمز تا پایان همان نشست مرورگر (session) ذخیره می‌ماند و با بستن مرورگر دوباره پرسیده می‌شود. (نسخهٔ استاتیک از همین سورس ساخته و روی برنچ `main` در مسیر `linear/` قرار گرفته است.)

**English:** The simulator is published on **GitHub Pages** and opens straight in the browser from the link above. Opening it shows a login screen. Anyone who types the password above can view the simulator. The unlock is remembered for the current browser session and is asked again after the browser is closed. (A static build from this source is hosted on the `main` branch under `linear/`.)

> ⚠️ **این یک قفلِ سمتِ‌کاربر (client-side) است، نه امنیت واقعی.** چون کل برنامه یک فایل استاتیک است، رمز عبور در سورس صفحه قابل مشاهده است و کاربر فنی می‌تواند آن را دور بزند. این قفل فقط جلوی دسترسی اتفاقی را می‌گیرد؛ برای دادهٔ حساس مناسب نیست.
>
> ⚠️ **This is a client-side gate, not real security.** Because the whole app is a static file, the password is visible in the page source and a technical user can bypass it. It only keeps casual visitors out — do not rely on it for sensitive data.

برای تغییر رمز، مقدار `PASSWORD` را در `linear-src/src/Gate.tsx` عوض کنید، دوباره بیلد بگیرید و خروجی را روی `main/linear/` جایگزین کنید.
To change the password, edit `PASSWORD` in `linear-src/src/Gate.tsx`, rebuild, and replace the copy at `main/linear/`.

> **📌 سورس این پروژه روی همین برنچ (`linear-equations-lab`) نگه‌داری می‌شود؛ نسخهٔ منتشرشده روی `main/linear/` است.**
> **The source lives on this `linear-equations-lab` branch; the published build is on `main/linear/`.**

---

## ▶️ اجرا &nbsp;|&nbsp; How to run

### گزینهٔ ۱ — فایل آمادهٔ بیلد‌شده &nbsp;|&nbsp; Option 1 — prebuilt file
فایل `index.html` در ریشهٔ این برنچ، نسخهٔ کاملاً خودکفا و بیلد‌شده است (همهٔ کدها، استایل‌ها و تصاویر در همان یک فایل قرار دارند). کافی است آن را در مرورگر باز کنید.

The `index.html` at the root of this branch is a fully self-contained, prebuilt bundle (all code, styles and images are inlined in that one file). Just open it in a browser.

### گزینهٔ ۲ — از روی سورس &nbsp;|&nbsp; Option 2 — from source
```bash
cd linear-src
npm install
npm run dev      # اجرای محلی برای توسعه · local dev server
npm run build    # ساخت نسخهٔ تک‌فایلی در dist/index.html · build the single-file bundle
```
خروجی `linear-src/dist/index.html` را می‌توانید جایگزین `index.html` ریشه کنید.
Copy the resulting `linear-src/dist/index.html` over the root `index.html`.

> **فارسی:** چون این فایل کاملاً خودکفاست (بدون هیچ مسیر نسبی)، برای انتشار روی GitHub Pages فقط کافی است همان فایل در `main/linear/index.html` کپی شود — بدون نیاز به تنظیم مسیر پایه.
> **English:** Since the file is fully self-contained (no relative paths), publishing to GitHub Pages is just a copy to `main/linear/index.html` — no base-path configuration needed.

---

## 📚 محتوای شبیه‌ساز &nbsp;|&nbsp; What's inside

**فارسی:** یک آزمایشگاه کامل خط و معادلهٔ خطی با مسیر یادگیری ۱۳ مرحله‌ای، به‌همراه دو نمای کاملاً جدا برای دانش‌آموز و معلم.

**English:** A complete line and linear-equation lab with a 13-stage learning path, plus fully separate Student and Teacher views.

### 🧭 مسیر یادگیری ۱۳ مرحله‌ای &nbsp;|&nbsp; The 13-stage learning path

دستگاه مختصات → نقاط در صفحه → مفهوم خط → شیب خط → شیب مثبت و منفی → خط افقی و عمودی → معادلهٔ خط → فرم شیب-عرض از مبدأ → خط از روی دو نقطه → رسم نمودار از روی معادله → تبدیل فرم‌های معادله → دو خط (موازی/متقاطع) → مرور ترکیبی

Coordinate plane → Points in the plane → The concept of a line → Slope → Positive/negative slope → Horizontal & vertical lines → The equation of a line → Slope-intercept form → Line from two points → Graphing an equation → Converting equation forms → Two lines (parallel/intersecting) → Mixed review

### 👩‍🎓 حالت دانش‌آموز &nbsp;|&nbsp; Student mode
- 📊 داشبورد پیشرفت، مسیر یادگیری، درس‌ها و آزمون‌ها · progress dashboard, learning path, lessons and quizzes
- 🏆 نشان‌ها و دستاوردها (استاد شیب، شکارچی خط، متخصص معادله و…) · badges and achievements
- 🧪 آزمایشگاه‌های تعاملی — صفحهٔ مختصات، شیب، معادله، تبدیل نمودار به معادله، حل دو‌نقطه‌ای، کاوش آزاد، مقایسه، بازی تطبیق، چالش، حل‌کننده گام‌به‌گام، دو خط، نمای سه‌بعدی<br>Interactive labs — plane, slope, equation, graph-to-equation, two-point solver, free explore, compare, matching game, challenges, step-by-step solver, two lines, 3D view

### 👩‍🏫 حالت معلم &nbsp;|&nbsp; Teacher mode
- 🏫 داشبورد، کلاس‌ها، جزئیات دانش‌آموز، محتوا · dashboard, classes, student detail, content
- 📝 سازندهٔ تکلیف و سازندهٔ آزمون · assignment builder and quiz builder
- 📈 تحلیل‌ها و کلاس زندهٔ تعاملی · analytics and a live interactive classroom
- 🖥️ حالت ارائه برای نمایش روی پرده · presentation mode for the classroom screen

- 🌐 **دو‌زبانه / Bilingual** — فارسی و انگلیسی، با تغییر جهت کامل (RTL/LTR) · Persian and English, with full RTL/LTR switching
- 🌙 **پوستهٔ روشن و تیره / Light & dark themes**

---

## 🗂️ ساختار این برنچ &nbsp;|&nbsp; Branch layout

| مسیر / Path | توضیح / Description |
|:--|:--|
| `index.html` | نسخهٔ بیلد‌شده و خودکفا با قفل رمز — prebuilt, self-contained, gated app |
| `linear-src/` | سورس کامل (React + Vite + TypeScript) — full source |
| `linear-src/src/Gate.tsx` | کامپوننت قفل رمز — the password gate component |
| `linear-src/src/math.ts` | موتور محاسبات ریاضی — the math engine |
| `linear-src/src/data.ts` | مراحل، سؤالات، دستاوردها و داده‌های آزمون‌ها — stages, questions, achievements, and quiz data |
| `linear-src/src/pages/StudentPages.tsx` | نمای دانش‌آموز — student view |
| `linear-src/src/pages/TeacherPages.tsx` | نمای معلم — teacher view |
| `linear-src/src/pages/GraphLabs.tsx` | آزمایشگاه‌های تعاملی نمودار — interactive graph labs |

---

## 📄 مجوز &nbsp;|&nbsp; License

منتشر شده تحت مجوز موجود در فایل [LICENSE](LICENSE).
Released under the license in [LICENSE](LICENSE).

<div align="center">
<br>
<sub>ساخته شده برای پژوهش و آموزش &nbsp;·&nbsp; Built for research and teaching</sub>
</div>
