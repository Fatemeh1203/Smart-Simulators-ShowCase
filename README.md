<div align="center">

# 💡 آزمایشگاه نور
# 💡 Interactive Light Simulation Lab

### شبیه‌سازی تعاملی نور برای دبستانی‌ها — آینه، عدسی، شکست نور و بازتاب
### An interactive light simulator for elementary school — mirrors, lenses, refraction, and reflection

<p>
<img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black">
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
<img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white">
<img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white">
</p>

`#Light` `#Optics` `#Physics` `#Mirrors` `#Lenses` `#Refraction` `#STEM` `#KidsScience` `#Simulator` `#ScienceEducation`

</div>

---

## 🔗 لینک ورود &nbsp;|&nbsp; Open the simulator

<div align="center">

### ▶️ [ورود به شبیه‌ساز · Open the simulator](https://fatemeh1203.github.io/Smart-Simulators-ShowCase/light/)

`https://fatemeh1203.github.io/Smart-Simulators-ShowCase/light/`

**رمز · Password:** `project`

</div>

**فارسی:** شبیه‌ساز روی **GitHub Pages** منتشر شده و با لینک بالا مستقیماً در مرورگر باز می‌شود. با باز کردن آن، یک صفحهٔ ورود نمایش داده می‌شود. هر کسی که رمز بالا را وارد کند می‌تواند شبیه‌ساز را ببیند. رمز تا پایان همان نشست مرورگر (session) ذخیره می‌ماند و با بستن مرورگر دوباره پرسیده می‌شود. (نسخهٔ استاتیک از همین سورس ساخته و روی برنچ `main` در مسیر `light/` قرار گرفته است.)

**English:** The simulator is published on **GitHub Pages** and opens straight in the browser from the link above. Opening it shows a login screen. Anyone who types the password above can view the simulator. The unlock is remembered for the current browser session and is asked again after the browser is closed. (A static build from this source is hosted on the `main` branch under `light/`.)

> ⚠️ **این یک قفلِ سمتِ‌کاربر (client-side) است، نه امنیت واقعی.** چون کل برنامه یک فایل استاتیک است، رمز عبور در سورس صفحه قابل مشاهده است و کاربر فنی می‌تواند آن را دور بزند. این قفل فقط جلوی دسترسی اتفاقی را می‌گیرد؛ برای دادهٔ حساس مناسب نیست.
>
> ⚠️ **This is a client-side gate, not real security.** Because the whole app is a static file, the password is visible in the page source and a technical user can bypass it. It only keeps casual visitors out — do not rely on it for sensitive data.

برای تغییر رمز، مقدار `PASSWORD` را در `light-src/src/Gate.tsx` عوض کنید، دوباره بیلد بگیرید و خروجی را روی `main/light/` جایگزین کنید.
To change the password, edit `PASSWORD` in `light-src/src/Gate.tsx`, rebuild, and replace the copy at `main/light/`.

> **📌 سورس این پروژه روی همین برنچ (`light-lab`) نگه‌داری می‌شود؛ نسخهٔ منتشرشده روی `main/light/` است.**
> **The source lives on this `light-lab` branch; the published build is on `main/light/`.**

---

## ▶️ اجرا &nbsp;|&nbsp; How to run

### گزینهٔ ۱ — فایل آمادهٔ بیلد‌شده &nbsp;|&nbsp; Option 1 — prebuilt file
فایل `index.html` در ریشهٔ این برنچ، نسخهٔ کاملاً خودکفا و بیلد‌شده است (همهٔ کدها و استایل‌ها در همان یک فایل قرار دارند). کافی است آن را در مرورگر باز کنید.

The `index.html` at the root of this branch is a fully self-contained, prebuilt bundle (all code and styles are inlined in that one file). Just open it in a browser.

### گزینهٔ ۲ — از روی سورس &nbsp;|&nbsp; Option 2 — from source
```bash
cd light-src
npm install
npm run dev      # اجرای محلی برای توسعه · local dev server
npm run build    # ساخت نسخهٔ تک‌فایلی در dist/index.html · build the single-file bundle
```
خروجی `light-src/dist/index.html` را می‌توانید جایگزین `index.html` ریشه کنید.
Copy the resulting `light-src/dist/index.html` over the root `index.html`.

> **فارسی:** چون این فایل کاملاً خودکفاست (بدون هیچ مسیر نسبی)، برای انتشار روی GitHub Pages فقط کافی است همان فایل در `main/light/index.html` کپی شود — بدون نیاز به تنظیم مسیر پایه.
> **English:** Since the file is fully self-contained (no relative paths), publishing to GitHub Pages is just a copy to `main/light/index.html` — no base-path configuration needed.

---

## 📚 محتوای شبیه‌ساز &nbsp;|&nbsp; What's inside

**فارسی:** یک آزمایشگاه تعاملی نور، ویژهٔ دانش‌آموزان دبستانی، در نُه بخش.

**English:** An interactive light lab for elementary school students, in nine sections.

| # | English | فارسی |
|:-:|:--|:--|
| ۱ | Home | خانه |
| ۲ | Free Lab | آزمایش آزاد |
| ۳ | Mirror | آینه |
| ۴ | Lens | عدسی |
| ۵ | Water Refraction | آب |
| ۶ | Compare | مقایسه |
| ۷ | Target Game | بازی |
| ۸ | Missions | ماموریت |
| ۹ | Discovery Notebook | دفترچه |

- 🌐 **دو‌زبانه / Bilingual** — فارسی و انگلیسی، با تغییر جهت کامل (RTL/LTR) · Persian and English, with full RTL/LTR switching
- 🔦 **آزمایشگاه آزاد / Free Lab** — چراغ‌قوه بگذار، آینه بچرخان، نور را دنبال کن · place a flashlight, rotate mirrors, follow the light
- 🪞 **آزمایش آینه و عدسی / Mirror and lens experiments** — زاویهٔ تابش و بازتاب، نقطهٔ تمرکز نور<br>angle of incidence and reflection, the focal point of light
- 💧 **شکست نور در آب / Refraction in water** — چرا مداد داخل آب شکسته دیده می‌شود؟ · why does a pencil look bent in water?
- 🎯 **بازی هدف / Target Game** — نور را با آینه‌ها به هدف برسان · guide the light to the target using mirrors
- 🏆 **ماموریت‌ها و دفترچهٔ کشف / Missions & Discovery Notebook** — یادگیری از طریق بازی · learning through play

---

## 🗂️ ساختار این برنچ &nbsp;|&nbsp; Branch layout

| مسیر / Path | توضیح / Description |
|:--|:--|
| `index.html` | نسخهٔ بیلد‌شده و خودکفا با قفل رمز — prebuilt, self-contained, gated app |
| `light-src/` | سورس کامل (React + Vite + TypeScript) — full source |
| `light-src/src/Gate.tsx` | کامپوننت قفل رمز — the password gate component |
| `light-src/src/lab/physics.ts` | موتور محاسبات نوری — the optics physics engine |
| `light-src/src/pages/` | صفحات مختلف — آینه، عدسی، آب، مقایسه، بازی، ماموریت — Mirror, Lens, Water, Compare, Game, Missions pages |

---

## 📄 مجوز &nbsp;|&nbsp; License

منتشر شده تحت مجوز موجود در فایل [LICENSE](LICENSE).
Released under the license in [LICENSE](LICENSE).

<div align="center">
<br>
<sub>ساخته شده برای پژوهش و آموزش &nbsp;·&nbsp; Built for research and teaching</sub>
</div>
