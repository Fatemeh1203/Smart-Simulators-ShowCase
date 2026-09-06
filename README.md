<div align="center">

# 🧊 آزمایشگاه فشار، چگالی و شناوری
# 🧊 Density and Buoyancy Simulator

### شبیه‌سازی تعاملی چگالی، فشار آب و شناوری — با آزمایش، حدس و ساخت قایق
### An interactive density, water-pressure and buoyancy simulator — experiment, predict, and build a boat

<p>
<img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black">
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
<img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white">
<img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white">
</p>

`#Density` `#Buoyancy` `#Physics` `#Archimedes` `#WaterPressure` `#STEM` `#KidsScience` `#Simulator` `#PhysicsEducation`

</div>

---

## 🔗 لینک ورود &nbsp;|&nbsp; Open the simulator

<div align="center">

### ▶️ [ورود به شبیه‌ساز · Open the simulator](https://fatemeh1203.github.io/Smart-Simulators-ShowCase/density/)

`https://fatemeh1203.github.io/Smart-Simulators-ShowCase/density/`

**رمز · Password:** `project`

</div>

**فارسی:** شبیه‌ساز روی **GitHub Pages** منتشر شده و با لینک بالا مستقیماً در مرورگر باز می‌شود. با باز کردن آن، یک صفحهٔ ورود نمایش داده می‌شود. هر کسی که رمز بالا را وارد کند می‌تواند شبیه‌ساز را ببیند. رمز تا پایان همان نشست مرورگر (session) ذخیره می‌ماند و با بستن مرورگر دوباره پرسیده می‌شود. (نسخهٔ استاتیک از همین سورس ساخته و روی برنچ `main` در مسیر `density/` قرار گرفته است.)

**English:** The simulator is published on **GitHub Pages** and opens straight in the browser from the link above. Opening it shows a login screen. Anyone who types the password above can view the simulator. The unlock is remembered for the current browser session and is asked again after the browser is closed. (A static build from this source is hosted on the `main` branch under `density/`.)

> ⚠️ **این یک قفلِ سمتِ‌کاربر (client-side) است، نه امنیت واقعی.** چون کل برنامه یک فایل استاتیک است، رمز عبور در سورس صفحه قابل مشاهده است و کاربر فنی می‌تواند آن را دور بزند. این قفل فقط جلوی دسترسی اتفاقی را می‌گیرد؛ برای دادهٔ حساس مناسب نیست.
>
> ⚠️ **This is a client-side gate, not real security.** Because the whole app is a static file, the password is visible in the page source and a technical user can bypass it. It only keeps casual visitors out — do not rely on it for sensitive data.

برای تغییر رمز، مقدار `PASSWORD` را در `density-src/src/Gate.tsx` عوض کنید، دوباره بیلد بگیرید و خروجی را روی `main/density/` جایگزین کنید.
To change the password, edit `PASSWORD` in `density-src/src/Gate.tsx`, rebuild, and replace the copy at `main/density/`.

> **📌 سورس این پروژه روی همین برنچ (`density-buoyancy-lab`) نگه‌داری می‌شود؛ نسخهٔ منتشرشده روی `main/density/` است.**
> **The source lives on this `density-buoyancy-lab` branch; the published build is on `main/density/`.**

---

## ▶️ اجرا &nbsp;|&nbsp; How to run

### گزینهٔ ۱ — فایل آمادهٔ بیلد‌شده &nbsp;|&nbsp; Option 1 — prebuilt file
فایل `index.html` در ریشهٔ این برنچ، نسخهٔ کاملاً خودکفا و بیلد‌شده است (همهٔ کدها و استایل‌ها در همان یک فایل قرار دارند). کافی است آن را در مرورگر باز کنید.

The `index.html` at the root of this branch is a fully self-contained, prebuilt bundle (all code and styles are inlined in that one file). Just open it in a browser.

### گزینهٔ ۲ — از روی سورس &nbsp;|&nbsp; Option 2 — from source
```bash
cd density-src
npm install
npm run dev      # اجرای محلی برای توسعه · local dev server
npm run build    # ساخت نسخهٔ تک‌فایلی در dist/index.html · build the single-file bundle
```
خروجی `density-src/dist/index.html` را می‌توانید جایگزین `index.html` ریشه کنید.
Copy the resulting `density-src/dist/index.html` over the root `index.html`.

> **فارسی:** چون این فایل کاملاً خودکفاست (بدون هیچ مسیر نسبی)، برای انتشار روی GitHub Pages فقط کافی است همان فایل در `main/density/index.html` کپی شود — بدون نیاز به تنظیم مسیر پایه.
> **English:** Since the file is fully self-contained (no relative paths), publishing to GitHub Pages is just a copy to `main/density/index.html` — no base-path configuration needed.

---

## 📚 محتوای شبیه‌ساز &nbsp;|&nbsp; What's inside

**فارسی:** یک آزمایشگاه تعاملی چگالی و شناوری با ۱۲ جسم مختلف (توپ پلاستیکی، چوب، سنگ، آهن، یخ، شیشه و…)، در پنج حالت کاری.

**English:** An interactive density and buoyancy lab with 12 different objects (plastic ball, wood, stone, iron, ice, glass, and more), in five working modes.

| # | English | فارسی |
|:-:|:--|:--|
| ۱ | Free Lab | آزمایشگاه آزاد |
| ۲ | Water Pressure | فشار آب |
| ۳ | Build a Boat | قایق بساز |
| ۴ | Missions | مأموریت‌ها |
| ۵ | Discovery Notebook | دفترچه کشف |

**فارسی:** بیش از هشت مأموریت — پیدا کردن اجسام شناور، پیدا کردن جسمی که در آب فرو می‌رود، ساخت جسمی که در آب معلق بماند، پیش‌بینی بدون آزمایش، ساخت جسم بزرگ شناور، ساخت جسم کوچک غرق‌شونده، بررسی فشار آب از سوراخ‌های مختلف، و چالش ساخت قایق باربر.

**English:** Eight-plus missions — find floating objects, find a sinking object, build something that stays suspended, predict without testing, build a large floating object, build a small sinking object, compare water pressure from different holes, and the boat-building challenge.

- 🌐 **دو‌زبانه / Bilingual** — فارسی و انگلیسی، با تغییر جهت کامل (RTL/LTR) · Persian and English, with full RTL/LTR switching
- 🎯 **حدس بزن، بعد آزمایش کن / Predict, then test** — قبل از انداختن جسم در آب، حدس بزن شناور می‌شود یا فرو می‌رود
- ⛵ **قایق‌ساز / Boat builder** — قایقی بساز که با بار شناور بماند · build a boat that stays afloat with cargo
- 🏅 **مأموریت‌ها، ستاره و نشان / Missions, stars & badges** — یادگیری از طریق بازی · learning through play
- 🔬 **شبیه‌سازی فیزیکی واقعی / Real physics** — چگالی، اصل ارشمیدس، فشار هیدرواستاتیک<br>density, Archimedes' principle, hydrostatic pressure

---

## 🗂️ ساختار این برنچ &nbsp;|&nbsp; Branch layout

| مسیر / Path | توضیح / Description |
|:--|:--|
| `index.html` | نسخهٔ بیلد‌شده و خودکفا با قفل رمز — prebuilt, self-contained, gated app |
| `density-src/` | سورس کامل (React + Vite + TypeScript) — full source |
| `density-src/src/Gate.tsx` | کامپوننت قفل رمز — the password gate component |
| `density-src/src/data.ts` | اجسام و مواد با چگالی — objects and materials with densities |
| `density-src/src/missions.ts` | مأموریت‌های آزمایشگاه — the lab missions |
| `density-src/src/components/` | آزمایشگاه، فشار، قایق‌ساز، مأموریت‌ها و دفترچه — Lab, Pressure, Boat, Missions and Notebook views |

---

## 📄 مجوز &nbsp;|&nbsp; License

منتشر شده تحت مجوز موجود در فایل [LICENSE](LICENSE).
Released under the license in [LICENSE](LICENSE).

<div align="center">
<br>
<sub>ساخته شده برای پژوهش و آموزش &nbsp;·&nbsp; Built for research and teaching</sub>
</div>
