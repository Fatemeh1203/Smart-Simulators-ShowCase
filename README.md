<div align="center">

# 💧 شبیه‌ساز تعاملی چرخه آب
# 💧 Interactive Water Cycle Simulator

### شبیه‌سازی تعاملی چرخهٔ آب — تبخیر، تراکم، بارش، نفوذ و روان‌آب
### An interactive water cycle simulator — evaporation, condensation, precipitation, infiltration, and runoff

<p>
<img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black">
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
<img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white">
<img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white">
</p>

`#WaterCycle` `#EarthScience` `#Hydrology` `#Climate` `#STEM` `#ScienceEducation` `#Simulator` `#Geography`

</div>

---

## 🔗 لینک ورود &nbsp;|&nbsp; Open the simulator

<div align="center">

### ▶️ [ورود به شبیه‌ساز · Open the simulator](https://fatemeh1203.github.io/Smart-Simulators-ShowCase/watercycle/)

`https://fatemeh1203.github.io/Smart-Simulators-ShowCase/watercycle/`

**رمز · Password:** `project`

</div>

**فارسی:** شبیه‌ساز روی **GitHub Pages** منتشر شده و با لینک بالا مستقیماً در مرورگر باز می‌شود. با باز کردن آن، یک صفحهٔ ورود نمایش داده می‌شود. هر کسی که رمز بالا را وارد کند می‌تواند شبیه‌ساز را ببیند. رمز تا پایان همان نشست مرورگر (session) ذخیره می‌ماند و با بستن مرورگر دوباره پرسیده می‌شود. (نسخهٔ استاتیک از همین سورس ساخته و روی برنچ `main` در مسیر `watercycle/` قرار گرفته است.)

**English:** The simulator is published on **GitHub Pages** and opens straight in the browser from the link above. Opening it shows a login screen. Anyone who types the password above can view the simulator. The unlock is remembered for the current browser session and is asked again after the browser is closed. (A static build from this source is hosted on the `main` branch under `watercycle/`.)

> ⚠️ **این یک قفلِ سمتِ‌کاربر (client-side) است، نه امنیت واقعی.** چون کل برنامه یک فایل استاتیک است، رمز عبور در سورس صفحه قابل مشاهده است و کاربر فنی می‌تواند آن را دور بزند. این قفل فقط جلوی دسترسی اتفاقی را می‌گیرد؛ برای دادهٔ حساس مناسب نیست.
>
> ⚠️ **This is a client-side gate, not real security.** Because the whole app is a static file, the password is visible in the page source and a technical user can bypass it. It only keeps casual visitors out — do not rely on it for sensitive data.

برای تغییر رمز، مقدار `PASSWORD` را در `water-cycle-src/src/Gate.tsx` عوض کنید، دوباره بیلد بگیرید و خروجی را روی `main/watercycle/` جایگزین کنید.
To change the password, edit `PASSWORD` in `water-cycle-src/src/Gate.tsx`, rebuild, and replace the copy at `main/watercycle/`.

> **📌 سورس این پروژه روی همین برنچ (`water-cycle-lab`) نگه‌داری می‌شود؛ نسخهٔ منتشرشده روی `main/watercycle/` است.**
> **The source lives on this `water-cycle-lab` branch; the published build is on `main/watercycle/`.**

---

## ▶️ اجرا &nbsp;|&nbsp; How to run

### گزینهٔ ۱ — فایل آمادهٔ بیلد‌شده &nbsp;|&nbsp; Option 1 — prebuilt file
فایل `index.html` در ریشهٔ این برنچ، نسخهٔ کاملاً خودکفا و بیلد‌شده است (همهٔ کدها و استایل‌ها در همان یک فایل قرار دارند). کافی است آن را در مرورگر باز کنید.

The `index.html` at the root of this branch is a fully self-contained, prebuilt bundle (all code and styles are inlined in that one file). Just open it in a browser.

### گزینهٔ ۲ — از روی سورس &nbsp;|&nbsp; Option 2 — from source
```bash
cd water-cycle-src
npm install
npm run dev      # اجرای محلی برای توسعه · local dev server
npm run build    # ساخت نسخهٔ تک‌فایلی در dist/index.html · build the single-file bundle
```
خروجی `water-cycle-src/dist/index.html` را می‌توانید جایگزین `index.html` ریشه کنید.
Copy the resulting `water-cycle-src/dist/index.html` over the root `index.html`.

> **فارسی:** چون این فایل کاملاً خودکفاست (بدون هیچ مسیر نسبی)، برای انتشار روی GitHub Pages فقط کافی است همان فایل در `main/watercycle/index.html` کپی شود — بدون نیاز به تنظیم مسیر پایه.
> **English:** Since the file is fully self-contained (no relative paths), publishing to GitHub Pages is just a copy to `main/watercycle/index.html` — no base-path configuration needed.

---

## 📚 محتوای شبیه‌ساز &nbsp;|&nbsp; What's inside

**فارسی:** یک شبیه‌ساز تعاملی چرخهٔ آب با یک صحنهٔ انیمیشنی زنده (خورشید، ابر، کوه، جنگل، رودخانه و آب زیرزمینی)، در چهار حالت کاری.

**English:** An interactive water cycle simulator with a live animated scene (sun, clouds, mountain, forest, river, and groundwater), across four working modes.

| # | English | فارسی |
|:-:|:--|:--|
| ۱ | Control | کنترل |
| ۲ | Teaching Mode | حالت آموزشی |
| ۳ | Experiment | آزمایش کن! |
| ۴ | Challenge | چالش |

**فارسی:** هشت مرحلهٔ چرخهٔ آب — تبخیر، تراکم، تشکیل ابر، بارش، روان‌آب، نفوذ، آب زیرزمینی، جمع‌آوری آب — با ارتباط علّی و معلولی بین هر مرحله.

**English:** Eight stages of the water cycle — evaporation, condensation, cloud formation, precipitation, runoff, infiltration, groundwater, collection — with cause-and-effect links between each stage.

- 🌐 **دو‌زبانه / Bilingual** — فارسی و انگلیسی، با تغییر جهت کامل (RTL/LTR) · Persian and English, with full RTL/LTR switching
- ☀️ **کنترل کامل شرایط اقلیمی / Full climate control** — شدت تابش خورشید، دما، رطوبت هوا، احتمال بارش · solar radiation, temperature, humidity, precipitation probability
- ⏩ **کنترل سرعت زمان / Time-speed control** — ۰.۵× تا ۵× · 0.5× to 5×
- 🔄 **ارتباط مراحل چرخه / Cause-and-effect stage links** — روی هر مرحله کلیک کن تا مرحلهٔ غالب کنونی را ببینی · click any stage to see which one currently dominates
- 🧪 **آزمایش کن! / Experiment mode** — سناریوهای آماده (خشک‌سالی، سیل، فصل بارانی) · ready-made scenarios (drought, flood, rainy season)
- 🎯 **چالش / Challenge mode** — سؤال‌های علمی برای محک زدن یادگیری · science questions to test what you learned
- 👩‍🏫 **حالت آموزشی / Teaching Mode** — قوانین علمی مدل شبیه‌ساز به‌همراه توضیح · the model's scientific rules explained

---

## 🗂️ ساختار این برنچ &nbsp;|&nbsp; Branch layout

| مسیر / Path | توضیح / Description |
|:--|:--|
| `index.html` | نسخهٔ بیلد‌شده و خودکفا با قفل رمز — prebuilt, self-contained, gated app |
| `water-cycle-src/` | سورس کامل (React + Vite + TypeScript) — full source |
| `water-cycle-src/src/Gate.tsx` | کامپوننت قفل رمز — the password gate component |
| `water-cycle-src/src/model/waterCycle.ts` | موتور شبیه‌سازی چرخهٔ آب — the water-cycle simulation model |
| `water-cycle-src/src/components/` | صحنهٔ انیمیشنی، کنترل، آزمایش‌ها، چالش و آموزش — Scene, Control, Experiments, Challenge and Teaching views |

---

## 📄 مجوز &nbsp;|&nbsp; License

منتشر شده تحت مجوز موجود در فایل [LICENSE](LICENSE).
Released under the license in [LICENSE](LICENSE).

<div align="center">
<br>
<sub>ساخته شده برای پژوهش و آموزش &nbsp;·&nbsp; Built for research and teaching</sub>
</div>
