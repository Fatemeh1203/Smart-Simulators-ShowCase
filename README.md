<div align="center">

# 📐 آزمایشگاه مثلث‌ها
# 📐 Interactive Triangle Geometry Simulator

### شبیه‌سازی تعاملی هندسه مثلث برای دبستانی‌ها — ضلع، زاویه، محیط و مساحت
### An interactive triangle geometry simulator for elementary school — sides, angles, perimeter, and area

<p>
<img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black">
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
<img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white">
<img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white">
</p>

`#Geometry` `#Math` `#Triangle` `#MathEducation` `#STEM` `#KidsScience` `#Simulator` `#ElementaryMath`

</div>

---

## 🔗 لینک ورود &nbsp;|&nbsp; Open the simulator

<div align="center">

### ▶️ [ورود به شبیه‌ساز · Open the simulator](https://fatemeh1203.github.io/Smart-Simulators-ShowCase/triangle/)

`https://fatemeh1203.github.io/Smart-Simulators-ShowCase/triangle/`

**رمز · Password:** `project`

</div>

**فارسی:** شبیه‌ساز روی **GitHub Pages** منتشر شده و با لینک بالا مستقیماً در مرورگر باز می‌شود. با باز کردن آن، یک صفحهٔ ورود نمایش داده می‌شود. هر کسی که رمز بالا را وارد کند می‌تواند شبیه‌ساز را ببیند. رمز تا پایان همان نشست مرورگر (session) ذخیره می‌ماند و با بستن مرورگر دوباره پرسیده می‌شود. (نسخهٔ استاتیک از همین سورس ساخته و روی برنچ `main` در مسیر `triangle/` قرار گرفته است.)

**English:** The simulator is published on **GitHub Pages** and opens straight in the browser from the link above. Opening it shows a login screen. Anyone who types the password above can view the simulator. The unlock is remembered for the current browser session and is asked again after the browser is closed. (A static build from this source is hosted on the `main` branch under `triangle/`.)

> ⚠️ **این یک قفلِ سمتِ‌کاربر (client-side) است، نه امنیت واقعی.** چون کل برنامه یک فایل استاتیک است، رمز عبور در سورس صفحه قابل مشاهده است و کاربر فنی می‌تواند آن را دور بزند. این قفل فقط جلوی دسترسی اتفاقی را می‌گیرد؛ برای دادهٔ حساس مناسب نیست.
>
> ⚠️ **This is a client-side gate, not real security.** Because the whole app is a static file, the password is visible in the page source and a technical user can bypass it. It only keeps casual visitors out — do not rely on it for sensitive data.

برای تغییر رمز، مقدار `PASSWORD` را در `triangle-src/src/Gate.tsx` عوض کنید، دوباره بیلد بگیرید و خروجی را روی `main/triangle/` جایگزین کنید.
To change the password, edit `PASSWORD` in `triangle-src/src/Gate.tsx`, rebuild, and replace the copy at `main/triangle/`.

> **📌 سورس این پروژه روی همین برنچ (`triangle-lab`) نگه‌داری می‌شود؛ نسخهٔ منتشرشده روی `main/triangle/` است.**
> **The source lives on this `triangle-lab` branch; the published build is on `main/triangle/`.**

---

## ▶️ اجرا &nbsp;|&nbsp; How to run

### گزینهٔ ۱ — فایل آمادهٔ بیلد‌شده &nbsp;|&nbsp; Option 1 — prebuilt file
فایل `index.html` در ریشهٔ این برنچ، نسخهٔ کاملاً خودکفا و بیلد‌شده است (همهٔ کدها و استایل‌ها در همان یک فایل قرار دارند). کافی است آن را در مرورگر باز کنید.

The `index.html` at the root of this branch is a fully self-contained, prebuilt bundle (all code and styles are inlined in that one file). Just open it in a browser.

### گزینهٔ ۲ — از روی سورس &nbsp;|&nbsp; Option 2 — from source
```bash
cd triangle-src
npm install
npm run dev      # اجرای محلی برای توسعه · local dev server
npm run build    # ساخت نسخهٔ تک‌فایلی در dist/index.html · build the single-file bundle
```
خروجی `triangle-src/dist/index.html` را می‌توانید جایگزین `index.html` ریشه کنید.
Copy the resulting `triangle-src/dist/index.html` over the root `index.html`.

> **فارسی:** چون این فایل کاملاً خودکفاست (بدون هیچ مسیر نسبی)، برای انتشار روی GitHub Pages فقط کافی است همان فایل در `main/triangle/index.html` کپی شود — بدون نیاز به تنظیم مسیر پایه.
> **English:** Since the file is fully self-contained (no relative paths), publishing to GitHub Pages is just a copy to `main/triangle/index.html` — no base-path configuration needed.

---

## 📚 محتوای شبیه‌ساز &nbsp;|&nbsp; What's inside

**فارسی:** یک آزمایشگاه تعاملی هندسه مثلث، ویژهٔ دانش‌آموزان دبستانی، در چهار حالت کاری.

**English:** An interactive triangle geometry lab for elementary school students, in four working modes.

| # | English | فارسی |
|:-:|:--|:--|
| ۱ | Lab | آزمایشگاه |
| ۲ | Build Your Own Triangle | خودت مثلث بساز! |
| ۳ | Geometry Challenge | چالش هندسه |
| ۴ | Compare Two Triangles | مقایسه دو مثلث |

- 🌐 **دو‌زبانه / Bilingual** — فارسی و انگلیسی، با تغییر جهت کامل (RTL/LTR) · Persian and English, with full RTL/LTR switching
- 🖐️ **کشیدن و جابه‌جایی رأس‌ها / Draggable vertices** — رأس مثلث را بکش و همه‌چیز زنده به‌روز می‌شود · drag a vertex and everything updates live
- 📏 **محاسبات زنده / Live measurements** — طول اضلاع، زاویه‌ها، محیط، مساحت، قاعده و ارتفاع · side lengths, angles, perimeter, area, base and height
- 🤔 **حدس بزن! / Guess-first questions** — قبل از دیدن نتیجه حدس بزن چه اتفاقی می‌افتد · guess what will happen before seeing the result
- 🎉 **جشن موفقیت / Confetti celebration** — پاسخ درست را با جلوهٔ بصری جشن می‌گیرد · a visual celebration for correct answers
- 🔺 **انواع مثلث / Triangle types** — متساوی‌الساقین، متساوی‌الاضلاع، مختلف‌الاضلاع، قائم‌الزاویه<br>isosceles, equilateral, scalene, right-angled

---

## 🗂️ ساختار این برنچ &nbsp;|&nbsp; Branch layout

| مسیر / Path | توضیح / Description |
|:--|:--|
| `index.html` | نسخهٔ بیلد‌شده و خودکفا با قفل رمز — prebuilt, self-contained, gated app |
| `triangle-src/` | سورس کامل (React + Vite + TypeScript) — full source |
| `triangle-src/src/Gate.tsx` | کامپوننت قفل رمز — the password gate component |
| `triangle-src/src/lib/geometry.ts` | موتور محاسبات هندسی — the geometry computation engine |
| `triangle-src/src/components/` | آزمایشگاه، ساخت مثلث، چالش و مقایسه — Lab, Build, Challenge and Compare views |

---

## 📄 مجوز &nbsp;|&nbsp; License

منتشر شده تحت مجوز موجود در فایل [LICENSE](LICENSE).
Released under the license in [LICENSE](LICENSE).

<div align="center">
<br>
<sub>ساخته شده برای پژوهش و آموزش &nbsp;·&nbsp; Built for research and teaching</sub>
</div>
