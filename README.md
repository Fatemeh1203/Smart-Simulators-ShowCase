<div align="center">

# 🧪 آزمایشگاه مجازی فیبر نوری
# 🧪 Virtual Optical Fiber Laboratory

### شبیه‌سازی فیزیکی تعاملی فیبر نوری — از کارشناسی تا دکترا
### An interactive, physics-based fiber-optic simulator — BSc to PhD

<p>
<img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black">
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
<img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white">
<img alt="Recharts" src="https://img.shields.io/badge/Recharts-3-FF6384?style=for-the-badge">
</p>

`#FiberOptics` `#Photonics` `#OTDR` `#WDM` `#EDFA` `#Solitons` `#NLSE` `#OpticalCommunications` `#Simulator` `#Physics`

</div>

---

## 🔗 لینک ورود &nbsp;|&nbsp; Open the simulator

<div align="center">

### ▶️ [ورود به شبیه‌ساز · Open the simulator](https://01a06d32-6cc6-7686-a930-ea56c7fff4c5.arena.site/)

`https://01a06d32-6cc6-7686-a930-ea56c7fff4c5.arena.site/`

**رمز · Password:** `project02`

</div>

**فارسی:** با باز کردن لینک بالا، یک صفحهٔ ورود نمایش داده می‌شود. هر کسی که رمز بالا را وارد کند می‌تواند شبیه‌ساز را ببیند. رمز تا پایان همان نشست مرورگر (session) ذخیره می‌ماند و با بستن مرورگر دوباره پرسیده می‌شود.

**English:** Opening the link above shows a login screen. Anyone who types the password above can view the simulator. The unlock is remembered for the current browser session and is asked again after the browser is closed.

> ⚠️ **این یک قفلِ سمتِ‌کاربر (client-side) است، نه امنیت واقعی.** چون کل برنامه یک فایل استاتیک است، رمز عبور در سورس صفحه قابل مشاهده است و کاربر فنی می‌تواند آن را دور بزند. این قفل فقط جلوی دسترسی اتفاقی را می‌گیرد؛ برای دادهٔ حساس مناسب نیست.
>
> ⚠️ **This is a client-side gate, not real security.** Because the whole app is a static file, the password is visible in the page source and a technical user can bypass it. It only keeps casual visitors out — do not rely on it for sensitive data.

برای تغییر رمز، مقدار `PASSWORD` را در `vfol-src/src/Gate.tsx` عوض کنید و دوباره بیلد بگیرید.
To change the password, edit `PASSWORD` in `vfol-src/src/Gate.tsx` and rebuild.

> **📌 این برنچ فقط برای پروژهٔ آزمایشگاه مجازی فیبر نوری است.**
> این برنچ (`virtual-fiber-optic-lab`) به‌صورت جداگانه نگه‌داری می‌شود و از سایر شبیه‌سازها مستقل است.
>
> **This branch holds only the Virtual Optical Fiber Laboratory.** It is kept separate from the other simulators.

---

## ▶️ اجرا &nbsp;|&nbsp; How to run

### گزینهٔ ۱ — فایل آمادهٔ بیلد‌شده &nbsp;|&nbsp; Option 1 — prebuilt file
فایل `index.html` در ریشهٔ این برنچ، نسخهٔ کاملاً خودکفا و بیلد‌شده است (همهٔ کدها، استایل‌ها و نمودارها در همان یک فایل قرار دارند). کافی است آن را در مرورگر باز کنید.

The `index.html` at the root of this branch is a fully self-contained, prebuilt bundle (all code, styles and charts are inlined in that one file). Just open it in a browser.

### گزینهٔ ۲ — از روی سورس &nbsp;|&nbsp; Option 2 — from source
```bash
cd vfol-src
npm install
npm run dev      # اجرای محلی برای توسعه · local dev server
npm run build    # ساخت نسخهٔ تک‌فایلی در dist/index.html · build the single-file bundle
```
خروجی `vfol-src/dist/index.html` را می‌توانید جایگزین `index.html` ریشه کنید.
Copy the resulting `vfol-src/dist/index.html` over the root `index.html`.

---

## 📚 محتوای شبیه‌ساز &nbsp;|&nbsp; What's inside

**فارسی:** ۱۹ آزمایش تعاملی مبتنی بر فیزیک واقعی، در سه سطح — کارشناسی، کارشناسی ارشد، و دکترا/پژوهش — به‌همراه حالت آزاد (Free Lab)، حالت مربی (Instructor) و حالت پژوهش (Research).

**English:** 19 interactive, physics-based experiments across three levels — BSc, MSc, and PhD/Research — plus a Free Lab mode, an Instructor mode, and a Research mode.

| سطح / Level | آزمایش‌ها / Experiments |
|:--|:--|
| **کارشناسی (پایه) / BSc (Basic)** | قانون اسنل و بازتاب کلی داخلی · روزنه عددی · تک‌مود/چندمود (V-number, LP) · تضعیف · تلفات خمش · پاشندگی رنگی · پاشندگی مودی<br>Snell's Law & TIR · Numerical Aperture · Single/Multimode (V-number, LP modes) · Attenuation · Bending Loss · Chromatic Dispersion · Modal Dispersion |
| **ارشد (سامانه‌ها) / MSc (Systems)** | OTDR · بودجه توان لینک · طیف‌سنج نوری (OSA) · WDM · EDFA · گیرندهٔ PIN در برابر APD · نمودار چشمی · نرخ خطای بیت (BER)<br>OTDR · Optical Link Budget · Optical Spectrum Analyzer · WDM · EDFA · PIN vs APD Receivers · Eye Diagram · Bit Error Rate |
| **دکترا (پیشرفته) / PhD (Advanced)** | توری براگ فیبری (FBG) · قطبش و PMD · اثرات غیرخطی (Kerr, SPM, XPM, FWM, SRS, SBS) · سالیتون‌ها (NLSE)<br>Fiber Bragg Grating (FBG) · Polarization & PMD · Nonlinear Effects (Kerr, SPM, XPM, FWM, SRS, SBS) · Solitons (NLSE) |

- 🌐 **دو‌زبانه / Bilingual** — فارسی و انگلیسی، با تغییر جهت کامل (RTL/LTR) · Persian and English, with full RTL/LTR switching
- 🌙 **پوستهٔ روشن و تیره / Light & dark themes**
- 📊 **نمودارهای تعاملی زنده / Live interactive charts** — Recharts
- 🧭 **سه حالت کاری / Three working modes** — آزاد، مربی، پژوهش · Free Lab, Instructor, Research
- 🔬 **شبیه‌سازی فیزیکی واقعی / Real physics** — از قانون اسنل تا حل عددی معادلهٔ شرودینگر غیرخطی (NLSE)<br>from Snell's Law to a numerical split-step NLSE solver

---

## 🗂️ ساختار این برنچ &nbsp;|&nbsp; Branch layout

| مسیر / Path | توضیح / Description |
|:--|:--|
| `index.html` | نسخهٔ بیلد‌شده و خودکفا با قفل رمز — prebuilt, self-contained, gated app |
| `vfol-src/` | سورس کامل (React + Vite + TypeScript) — full source |
| `vfol-src/src/Gate.tsx` | کامپوننت قفل رمز — the password gate component |
| `vfol-src/src/experiments/` | ۱۹ آزمایش (basic, systems, advanced) — the 19 experiments |
| `vfol-src/src/modes/` | حالت‌های آزاد، مربی و پژوهش — Free Lab, Instructor, Research modes |
| `vfol-src/src/lib/physics.ts` | موتور محاسبات فیزیکی — the physics computation engine |

---

## 📄 مجوز &nbsp;|&nbsp; License

منتشر شده تحت مجوز موجود در فایل [LICENSE](LICENSE).
Released under the license in [LICENSE](LICENSE).

<div align="center">
<br>
<sub>ساخته شده برای پژوهش و آموزش &nbsp;·&nbsp; Built for research and teaching</sub>
</div>
