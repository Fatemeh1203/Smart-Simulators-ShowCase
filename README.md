<div align="center">

# 🌿 شبیه‌ساز آموزشی فتوسنتز
# 🌿 Interactive Photosynthesis Simulator

### شبیه‌سازی تعاملی فتوسنتز — نور، دی‌اکسید کربن، آب و دما
### An interactive photosynthesis simulator — light, CO₂, water, and temperature

<p>
<img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black">
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
<img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white">
<img alt="Recharts" src="https://img.shields.io/badge/Recharts-3-FF6384?style=for-the-badge">
</p>

`#Photosynthesis` `#Biology` `#PlantScience` `#STEM` `#ScienceEducation` `#Simulator` `#Chloroplast` `#LimitingFactors`

</div>

---

## 🔗 لینک ورود &nbsp;|&nbsp; Open the simulator

<div align="center">

### ▶️ [ورود به شبیه‌ساز · Open the simulator](https://fatemeh1203.github.io/Smart-Simulators-ShowCase/photosynthesis/)

`https://fatemeh1203.github.io/Smart-Simulators-ShowCase/photosynthesis/`

**رمز · Password:** `project`

</div>

**فارسی:** شبیه‌ساز روی **GitHub Pages** منتشر شده و با لینک بالا مستقیماً در مرورگر باز می‌شود. با باز کردن آن، یک صفحهٔ ورود نمایش داده می‌شود. هر کسی که رمز بالا را وارد کند می‌تواند شبیه‌ساز را ببیند. رمز تا پایان همان نشست مرورگر (session) ذخیره می‌ماند و با بستن مرورگر دوباره پرسیده می‌شود. (نسخهٔ استاتیک از همین سورس ساخته و روی برنچ `main` در مسیر `photosynthesis/` قرار گرفته است.)

**English:** The simulator is published on **GitHub Pages** and opens straight in the browser from the link above. Opening it shows a login screen. Anyone who types the password above can view the simulator. The unlock is remembered for the current browser session and is asked again after the browser is closed. (A static build from this source is hosted on the `main` branch under `photosynthesis/`.)

> ⚠️ **این یک قفلِ سمتِ‌کاربر (client-side) است، نه امنیت واقعی.** چون کل برنامه یک فایل استاتیک است، رمز عبور در سورس صفحه قابل مشاهده است و کاربر فنی می‌تواند آن را دور بزند. این قفل فقط جلوی دسترسی اتفاقی را می‌گیرد؛ برای دادهٔ حساس مناسب نیست.
>
> ⚠️ **This is a client-side gate, not real security.** Because the whole app is a static file, the password is visible in the page source and a technical user can bypass it. It only keeps casual visitors out — do not rely on it for sensitive data.

برای تغییر رمز، مقدار `PASSWORD` را در `photosynthesis-src/src/Gate.tsx` عوض کنید، دوباره بیلد بگیرید و خروجی را روی `main/photosynthesis/` جایگزین کنید.
To change the password, edit `PASSWORD` in `photosynthesis-src/src/Gate.tsx`, rebuild, and replace the copy at `main/photosynthesis/`.

> **📌 سورس این پروژه روی همین برنچ (`photosynthesis-lab`) نگه‌داری می‌شود؛ نسخهٔ منتشرشده روی `main/photosynthesis/` است.**
> **The source lives on this `photosynthesis-lab` branch; the published build is on `main/photosynthesis/`.**

---

## ▶️ اجرا &nbsp;|&nbsp; How to run

### گزینهٔ ۱ — فایل آمادهٔ بیلد‌شده &nbsp;|&nbsp; Option 1 — prebuilt file
فایل `index.html` در ریشهٔ این برنچ، نسخهٔ کاملاً خودکفا و بیلد‌شده است (همهٔ کدها، استایل‌ها و نمودارها در همان یک فایل قرار دارند). کافی است آن را در مرورگر باز کنید.

The `index.html` at the root of this branch is a fully self-contained, prebuilt bundle (all code, styles and charts are inlined in that one file). Just open it in a browser.

### گزینهٔ ۲ — از روی سورس &nbsp;|&nbsp; Option 2 — from source
```bash
cd photosynthesis-src
npm install
npm run dev      # اجرای محلی برای توسعه · local dev server
npm run build    # ساخت نسخهٔ تک‌فایلی در dist/index.html · build the single-file bundle
```
خروجی `photosynthesis-src/dist/index.html` را می‌توانید جایگزین `index.html` ریشه کنید.
Copy the resulting `photosynthesis-src/dist/index.html` over the root `index.html`.

> **فارسی:** چون این فایل کاملاً خودکفاست (بدون هیچ مسیر نسبی)، برای انتشار روی GitHub Pages فقط کافی است همان فایل در `main/photosynthesis/index.html` کپی شود — بدون نیاز به تنظیم مسیر پایه.
> **English:** Since the file is fully self-contained (no relative paths), publishing to GitHub Pages is just a copy to `main/photosynthesis/index.html` — no base-path configuration needed.

---

## 📚 محتوای شبیه‌ساز &nbsp;|&nbsp; What's inside

**فارسی:** یک شبیه‌ساز تعاملی فتوسنتز که چهار عامل محیطی — شدت نور، دی‌اکسید کربن، آب و دما — و اثرشان روی نرخ فتوسنتز و «عامل محدودکننده» را نشان می‌دهد.

**English:** An interactive photosynthesis simulator showing four environmental factors — light intensity, CO₂, water, and temperature — and their effect on the photosynthesis rate and the "limiting factor."

- 🔬 **آزمایش جدید / New Experiment** — پارامترها را تغییر بده و اثرش را روی نرخ فتوسنتز ببین · adjust parameters and watch the effect on the rate
- 🌱🌱 **مقایسه دو گیاه / Compare Two Plants** — دو شرایط محیطی متفاوت را کنار هم مقایسه کن · compare two different environmental setups side by side
- 👩‍🏫 **حالت معلم / Teacher Mode** — پارامترها را قفل کن و برای کلاس آماده‌سازی کن · lock parameters and prepare a classroom demo
- 🎯 **چالش / Challenge mode** — مأموریت‌های علمی برای رسیدن به نرخ هدف · science missions to hit a target rate
- 🌡️ **کنترل کامل شرایط محیطی / Full environmental control** — نور، CO₂، آب، دما با درصد کارایی هر عامل<br>light, CO₂, water, temperature, each with its own efficiency percentage
- 📊 **نمودار زندهٔ نرخ فتوسنتز / Live photosynthesis-rate chart** — Recharts
- 🧬 **نمای گیاه و کلروپلاست / Plant and chloroplast view** — برگ، ساقه، ریشه و مسیر واکنش نوری<br>leaf, stem, root, and the path of the light reaction
- 🌐 **دو‌زبانه / Bilingual** — فارسی و انگلیسی · Persian and English

---

## 🗂️ ساختار این برنچ &nbsp;|&nbsp; Branch layout

| مسیر / Path | توضیح / Description |
|:--|:--|
| `index.html` | نسخهٔ بیلد‌شده و خودکفا با قفل رمز — prebuilt, self-contained, gated app |
| `photosynthesis-src/` | سورس کامل (React + Vite + TypeScript) — full source |
| `photosynthesis-src/src/Gate.tsx` | کامپوننت قفل رمز — the password gate component |
| `photosynthesis-src/src/lib/model.ts` | موتور محاسبات فتوسنتز — the photosynthesis-rate model |
| `photosynthesis-src/src/components/` | آزمایش‌ها، مقایسه، حالت معلم، چالش و نمودار زنده — Experiments, Compare, Teacher, Challenge and live-chart views |

---

## 📄 مجوز &nbsp;|&nbsp; License

منتشر شده تحت مجوز موجود در فایل [LICENSE](LICENSE).
Released under the license in [LICENSE](LICENSE).

<div align="center">
<br>
<sub>ساخته شده برای پژوهش و آموزش &nbsp;·&nbsp; Built for research and teaching</sub>
</div>
