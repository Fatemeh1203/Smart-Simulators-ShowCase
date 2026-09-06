<div align="center">

# 🧱 آزمایشگاه مجازی فشار
# 🧱 Interactive Physics Pressure Simulator

### شبیه‌سازی فیزیکی تعاملی فشار — فیزیک دهم
### An interactive, physics-based pressure simulator — Grade 10 Physics

<p>
<img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black">
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
<img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white">
<img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white">
</p>

`#Pressure` `#Physics` `#PascalsPrinciple` `#Archimedes` `#Bernoulli` `#Barometer` `#Manometer` `#Grade10` `#Simulator` `#PhysicsEducation`

</div>

---

## 🔗 لینک ورود &nbsp;|&nbsp; Open the simulator

<div align="center">

### ▶️ [ورود به شبیه‌ساز · Open the simulator](https://fatemeh1203.github.io/Smart-Simulators-ShowCase/press/)

`https://fatemeh1203.github.io/Smart-Simulators-ShowCase/press/`

**رمز · Password:** `project`

</div>

**فارسی:** شبیه‌ساز روی **GitHub Pages** منتشر شده و با لینک بالا مستقیماً در مرورگر باز می‌شود. با باز کردن آن، یک صفحهٔ ورود نمایش داده می‌شود. هر کسی که رمز بالا را وارد کند می‌تواند شبیه‌ساز را ببیند. رمز تا پایان همان نشست مرورگر (session) ذخیره می‌ماند و با بستن مرورگر دوباره پرسیده می‌شود. (نسخهٔ استاتیک از همین سورس ساخته و روی برنچ `main` در مسیر `press/` قرار گرفته است.)

**English:** The simulator is published on **GitHub Pages** and opens straight in the browser from the link above. Opening it shows a login screen. Anyone who types the password above can view the simulator. The unlock is remembered for the current browser session and is asked again after the browser is closed. (A static build from this source is hosted on the `main` branch under `press/`.)

> ⚠️ **این یک قفلِ سمتِ‌کاربر (client-side) است، نه امنیت واقعی.** چون کل برنامه یک فایل استاتیک است، رمز عبور در سورس صفحه قابل مشاهده است و کاربر فنی می‌تواند آن را دور بزند. این قفل فقط جلوی دسترسی اتفاقی را می‌گیرد؛ برای دادهٔ حساس مناسب نیست.
>
> ⚠️ **This is a client-side gate, not real security.** Because the whole app is a static file, the password is visible in the page source and a technical user can bypass it. It only keeps casual visitors out — do not rely on it for sensitive data.

برای تغییر رمز، مقدار `PASSWORD` را در `press-src/src/Gate.tsx` عوض کنید، دوباره بیلد بگیرید و خروجی را روی `main/press/` جایگزین کنید.
To change the password, edit `PASSWORD` in `press-src/src/Gate.tsx`, rebuild, and replace the copy at `main/press/`.

> **📌 سورس این پروژه روی همین برنچ (`pressure-lab`) نگه‌داری می‌شود؛ نسخهٔ منتشرشده روی `main/press/` است.**
> **The source lives on this `pressure-lab` branch; the published build is on `main/press/`.**

---

## ▶️ اجرا &nbsp;|&nbsp; How to run

### گزینهٔ ۱ — فایل آمادهٔ بیلد‌شده &nbsp;|&nbsp; Option 1 — prebuilt file
فایل `index.html` در ریشهٔ این برنچ، نسخهٔ کاملاً خودکفا و بیلد‌شده است (همهٔ کدها و استایل‌ها در همان یک فایل قرار دارند). کافی است آن را در مرورگر باز کنید.

The `index.html` at the root of this branch is a fully self-contained, prebuilt bundle (all code and styles are inlined in that one file). Just open it in a browser.

### گزینهٔ ۲ — از روی سورس &nbsp;|&nbsp; Option 2 — from source
```bash
cd press-src
npm install
npm run dev      # اجرای محلی برای توسعه · local dev server
npm run build    # ساخت نسخهٔ تک‌فایلی در dist/index.html · build the single-file bundle
```
خروجی `press-src/dist/index.html` را می‌توانید جایگزین `index.html` ریشه کنید.
Copy the resulting `press-src/dist/index.html` over the root `index.html`.

> **فارسی:** چون این فایل کاملاً خودکفاست (بدون هیچ مسیر نسبی)، برای انتشار روی GitHub Pages فقط کافی است همان فایل در `main/press/index.html` کپی شود — بدون نیاز به تنظیم مسیر پایه.
> **English:** Since the file is fully self-contained (no relative paths), publishing to GitHub Pages is just a copy to `main/press/index.html` — no base-path configuration needed.

---

## 📚 محتوای شبیه‌ساز &nbsp;|&nbsp; What's inside

**فارسی:** ۸ ایستگاه آزمایش تعاملی مبتنی بر فیزیک واقعی، به‌همراه دو حالت ویژه — کشف کن (Explore) و چالش آزمایشگاه (Challenges).

**English:** 8 interactive, physics-based experiment stations, plus two special modes — Explore and Challenges.

| # | English | فارسی |
|:-:|:--|:--|
| ۱ | Pressure in Solids | فشار در جامدات |
| ۲ | Pressure in Liquids | فشار در مایعات |
| ۳ | Pressure in All Directions | فشار در همهٔ جهت‌ها |
| ۴ | Pascal's Principle & the Hydraulic Jack | اصل پاسکال و جک |
| ۵ | U-Shaped Manometer | مانومتر U شکل |
| ۶ | Barometer & Absolute Pressure | بارومتر و فشار مطلق |
| ۷ | Archimedes & Buoyancy | ارشمیدس و شناوری |
| ۸ | Bernoulli's Principle | اصل برنولی |

- 🌐 **دو‌زبانه / Bilingual** — فارسی و انگلیسی، با تغییر جهت کامل (RTL/LTR) · Persian and English, with full RTL/LTR switching
- 🌙 **پوستهٔ روشن و تیره / Light & dark themes**
- 🔍 **حالت کشف کن / Explore mode** — فرمول را کشف کن، نه اینکه فقط ببینی · discover the formula instead of just seeing it
- 🏁 **چالش آزمایشگاه / Lab Challenges** — سؤال‌های عملی برای محک زدن یادگیری · practical questions to test what you learned
- 🔬 **شبیه‌سازی فیزیکی واقعی / Real physics** — از فشار در جامدات تا اصل برنولی<br>from pressure in solids to Bernoulli's principle
- 🎛️ **کنترل کامل پارامترها / Full parameter control** — جرم، مساحت، شتاب گرانش، چگالی سیال و بیشتر<br>mass, area, gravity, fluid density, and more

---

## 🗂️ ساختار این برنچ &nbsp;|&nbsp; Branch layout

| مسیر / Path | توضیح / Description |
|:--|:--|
| `index.html` | نسخهٔ بیلد‌شده و خودکفا با قفل رمز — prebuilt, self-contained, gated app |
| `press-src/` | سورس کامل (React + Vite + TypeScript) — full source |
| `press-src/src/Gate.tsx` | کامپوننت قفل رمز — the password gate component |
| `press-src/src/stations/` | ۸ ایستگاه آزمایش — the 8 experiment stations |
| `press-src/src/modes/` | حالت‌های کشف کن و چالش — Explore and Challenges modes |

---

## 📄 مجوز &nbsp;|&nbsp; License

منتشر شده تحت مجوز موجود در فایل [LICENSE](LICENSE).
Released under the license in [LICENSE](LICENSE).

<div align="center">
<br>
<sub>ساخته شده برای پژوهش و آموزش &nbsp;·&nbsp; Built for research and teaching</sub>
</div>
