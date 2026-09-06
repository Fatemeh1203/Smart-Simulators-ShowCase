<div align="center">

# ⚡ آزمایشگاه مجازی الکتریسیته ساکن
# ⚡ Interactive Electrostatics Virtual Laboratory

### شبیه‌سازی فیزیکی تعاملی الکتریسیته ساکن — فیزیک یازدهم
### An interactive, physics-based electrostatics simulator — Grade 11 Physics

<p>
<img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black">
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
<img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white">
<img alt="Recharts" src="https://img.shields.io/badge/Recharts-3-FF6384?style=for-the-badge">
</p>

`#Electrostatics` `#Physics` `#CoulombsLaw` `#ElectricField` `#Capacitor` `#Potential` `#Grade11` `#Simulator` `#PhysicsEducation`

</div>

---

## 🔗 لینک ورود &nbsp;|&nbsp; Open the simulator

<div align="center">

### ▶️ [ورود به شبیه‌ساز · Open the simulator](https://fatemeh1203.github.io/Smart-Simulators-ShowCase/eslab/)

`https://fatemeh1203.github.io/Smart-Simulators-ShowCase/eslab/`

**رمز · Password:** `project`

</div>

**فارسی:** شبیه‌ساز روی **GitHub Pages** منتشر شده و با لینک بالا مستقیماً در مرورگر باز می‌شود. با باز کردن آن، یک صفحهٔ ورود نمایش داده می‌شود. هر کسی که رمز بالا را وارد کند می‌تواند شبیه‌ساز را ببیند. رمز تا پایان همان نشست مرورگر (session) ذخیره می‌ماند و با بستن مرورگر دوباره پرسیده می‌شود. (نسخهٔ استاتیک از همین سورس ساخته و روی برنچ `main` در مسیر `eslab/` قرار گرفته است.)

**English:** The simulator is published on **GitHub Pages** and opens straight in the browser from the link above. Opening it shows a login screen. Anyone who types the password above can view the simulator. The unlock is remembered for the current browser session and is asked again after the browser is closed. (A static build from this source is hosted on the `main` branch under `eslab/`.)

> ⚠️ **این یک قفلِ سمتِ‌کاربر (client-side) است، نه امنیت واقعی.** چون کل برنامه یک فایل استاتیک است، رمز عبور در سورس صفحه قابل مشاهده است و کاربر فنی می‌تواند آن را دور بزند. این قفل فقط جلوی دسترسی اتفاقی را می‌گیرد؛ برای دادهٔ حساس مناسب نیست.
>
> ⚠️ **This is a client-side gate, not real security.** Because the whole app is a static file, the password is visible in the page source and a technical user can bypass it. It only keeps casual visitors out — do not rely on it for sensitive data.

برای تغییر رمز، مقدار `PASSWORD` را در `eslab-src/src/Gate.tsx` عوض کنید، دوباره بیلد بگیرید و خروجی را روی `main/eslab/` جایگزین کنید.
To change the password, edit `PASSWORD` in `eslab-src/src/Gate.tsx`, rebuild, and replace the copy at `main/eslab/`.

> **📌 سورس این پروژه روی همین برنچ (`electrostatics-lab`) نگه‌داری می‌شود؛ نسخهٔ منتشرشده روی `main/eslab/` است.**
> **The source lives on this `electrostatics-lab` branch; the published build is on `main/eslab/`.**

---

## ▶️ اجرا &nbsp;|&nbsp; How to run

### گزینهٔ ۱ — فایل آمادهٔ بیلد‌شده &nbsp;|&nbsp; Option 1 — prebuilt file
فایل `index.html` در ریشهٔ این برنچ، نسخهٔ کاملاً خودکفا و بیلد‌شده است (همهٔ کدها، استایل‌ها و نمودارها در همان یک فایل قرار دارند). کافی است آن را در مرورگر باز کنید.

The `index.html` at the root of this branch is a fully self-contained, prebuilt bundle (all code, styles and charts are inlined in that one file). Just open it in a browser.

### گزینهٔ ۲ — از روی سورس &nbsp;|&nbsp; Option 2 — from source
```bash
cd eslab-src
npm install
npm run dev      # اجرای محلی برای توسعه · local dev server
npm run build    # ساخت نسخهٔ تک‌فایلی در dist/index.html · build the single-file bundle
```
خروجی `eslab-src/dist/index.html` را می‌توانید جایگزین `index.html` ریشه کنید.
Copy the resulting `eslab-src/dist/index.html` over the root `index.html`.

> **فارسی:** چون این فایل کاملاً خودکفاست (بدون هیچ مسیر نسبی)، برای انتشار روی GitHub Pages فقط کافی است همان فایل در `main/eslab/index.html` کپی شود — بدون نیاز به تنظیم مسیر پایه.
> **English:** Since the file is fully self-contained (no relative paths), publishing to GitHub Pages is just a copy to `main/eslab/index.html` — no base-path configuration needed.

---

## 📚 محتوای شبیه‌ساز &nbsp;|&nbsp; What's inside

**فارسی:** ۱۲ آزمایش تعاملی مبتنی بر فیزیک واقعی، به‌همراه سه حالت کاری — معلم (Teacher)، خودت کشف کن (Discovery) و اندازه‌گیری (Measurement).

**English:** 12 interactive, physics-based experiments, plus three working modes — Teacher, Discovery, and Measurement.

| # | English | فارسی |
|:-:|:--|:--|
| ۱ | Electric Charge | بار الکتریکی |
| ۲ | Conservation & Quantization of Charge | پایستگی و کوانتیده بودن بار |
| ۳ | Coulomb's Law | قانون کولن |
| ۴ | Electric Field | میدان الکتریکی |
| ۵ | Field of a Point Charge | میدان یک ذرهٔ باردار |
| ۶ | Electric Field Lines | خطوط میدان الکتریکی |
| ۷ | Electric Potential Energy | انرژی پتانسیل الکتریکی |
| ۸ | Electric Potential | پتانسیل الکتریکی |
| ۹ | Field Inside a Conductor | میدان الکتریکی درون رسانا |
| ۱۰ | Capacitor | خازن |
| ۱۱ | Capacitor with Dielectric | خازن با دی‌الکتریک |
| ۱۲ | Capacitor Energy | انرژی خازن |

- 🌐 **دو‌زبانه / Bilingual** — فارسی و انگلیسی، با تغییر جهت کامل (RTL/LTR) · Persian and English, with full RTL/LTR switching
- 🌙 **پوستهٔ روشن و تیره / Light & dark themes**
- 📊 **نمودارهای تعاملی زنده / Live interactive charts** — Recharts
- 🧭 **سه حالت کاری / Three working modes** — معلم، خودت کشف کن، اندازه‌گیری · Teacher, Discovery, Measurement
- 🔬 **شبیه‌سازی فیزیکی واقعی / Real physics** — از قانون کولن تا خازن با دی‌الکتریک<br>from Coulomb's law to capacitors with dielectrics
- 📓 **دفترچهٔ ثبت داده (Data Logger)** برای اندازه‌گیری‌های تجربی · a Data Logger for experimental measurements

---

## 🗂️ ساختار این برنچ &nbsp;|&nbsp; Branch layout

| مسیر / Path | توضیح / Description |
|:--|:--|
| `index.html` | نسخهٔ بیلد‌شده و خودکفا با قفل رمز — prebuilt, self-contained, gated app |
| `eslab-src/` | سورس کامل (React + Vite + TypeScript) — full source |
| `eslab-src/src/Gate.tsx` | کامپوننت قفل رمز — the password gate component |
| `eslab-src/src/experiments/` | ۱۲ آزمایش — the 12 experiments |
| `eslab-src/src/modes/` | حالت‌های معلم، کشف و اندازه‌گیری — Teacher, Discovery, Measurement modes |
| `eslab-src/src/physics/core.ts` | موتور محاسبات فیزیکی — the physics computation engine |

---

## 📄 مجوز &nbsp;|&nbsp; License

منتشر شده تحت مجوز موجود در فایل [LICENSE](LICENSE).
Released under the license in [LICENSE](LICENSE).

<div align="center">
<br>
<sub>ساخته شده برای پژوهش و آموزش &nbsp;·&nbsp; Built for research and teaching</sub>
</div>
