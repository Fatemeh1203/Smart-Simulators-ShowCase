<div align="center">

# ⚡ آزمایشگاه مدار الکتریکی کوچولوها
# ⚡ Interactive Electric Circuit Simulator

### شبیه‌سازی تعاملی مدارهای الکتریکی ساده — با کشیدن و رها کردن قطعات
### An interactive electric circuit simulator — build circuits by dragging and dropping parts

<p>
<img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black">
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
<img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white">
<img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white">
</p>

`#ElectricCircuit` `#Physics` `#Electronics` `#STEM` `#KidsScience` `#Ohm` `#CircuitBuilder` `#Simulator` `#PhysicsEducation`

</div>

---

## 🔗 لینک ورود &nbsp;|&nbsp; Open the simulator

<div align="center">

### ▶️ [ورود به شبیه‌ساز · Open the simulator](https://fatemeh1203.github.io/Smart-Simulators-ShowCase/circuit/)

`https://fatemeh1203.github.io/Smart-Simulators-ShowCase/circuit/`

**رمز · Password:** `project`

</div>

**فارسی:** شبیه‌ساز روی **GitHub Pages** منتشر شده و با لینک بالا مستقیماً در مرورگر باز می‌شود. با باز کردن آن، یک صفحهٔ ورود نمایش داده می‌شود. هر کسی که رمز بالا را وارد کند می‌تواند شبیه‌ساز را ببیند. رمز تا پایان همان نشست مرورگر (session) ذخیره می‌ماند و با بستن مرورگر دوباره پرسیده می‌شود. (نسخهٔ استاتیک از همین سورس ساخته و روی برنچ `main` در مسیر `circuit/` قرار گرفته است.)

**English:** The simulator is published on **GitHub Pages** and opens straight in the browser from the link above. Opening it shows a login screen. Anyone who types the password above can view the simulator. The unlock is remembered for the current browser session and is asked again after the browser is closed. (A static build from this source is hosted on the `main` branch under `circuit/`.)

> ⚠️ **این یک قفلِ سمتِ‌کاربر (client-side) است، نه امنیت واقعی.** چون کل برنامه یک فایل استاتیک است، رمز عبور در سورس صفحه قابل مشاهده است و کاربر فنی می‌تواند آن را دور بزند. این قفل فقط جلوی دسترسی اتفاقی را می‌گیرد؛ برای دادهٔ حساس مناسب نیست.
>
> ⚠️ **This is a client-side gate, not real security.** Because the whole app is a static file, the password is visible in the page source and a technical user can bypass it. It only keeps casual visitors out — do not rely on it for sensitive data.

برای تغییر رمز، مقدار `PASSWORD` را در `circuit-src/src/Gate.tsx` عوض کنید، دوباره بیلد بگیرید و خروجی را روی `main/circuit/` جایگزین کنید.
To change the password, edit `PASSWORD` in `circuit-src/src/Gate.tsx`, rebuild, and replace the copy at `main/circuit/`.

> **📌 سورس این پروژه روی همین برنچ (`circuit-lab`) نگه‌داری می‌شود؛ نسخهٔ منتشرشده روی `main/circuit/` است.**
> **The source lives on this `circuit-lab` branch; the published build is on `main/circuit/`.**

---

## ▶️ اجرا &nbsp;|&nbsp; How to run

### گزینهٔ ۱ — فایل آمادهٔ بیلد‌شده &nbsp;|&nbsp; Option 1 — prebuilt file
فایل `index.html` در ریشهٔ این برنچ، نسخهٔ کاملاً خودکفا و بیلد‌شده است (همهٔ کدها و استایل‌ها در همان یک فایل قرار دارند). کافی است آن را در مرورگر باز کنید.

The `index.html` at the root of this branch is a fully self-contained, prebuilt bundle (all code and styles are inlined in that one file). Just open it in a browser.

### گزینهٔ ۲ — از روی سورس &nbsp;|&nbsp; Option 2 — from source
```bash
cd circuit-src
npm install
npm run dev      # اجرای محلی برای توسعه · local dev server
npm run build    # ساخت نسخهٔ تک‌فایلی در dist/index.html · build the single-file bundle
```
خروجی `circuit-src/dist/index.html` را می‌توانید جایگزین `index.html` ریشه کنید.
Copy the resulting `circuit-src/dist/index.html` over the root `index.html`.

> **فارسی:** چون این فایل کاملاً خودکفاست (بدون هیچ مسیر نسبی)، برای انتشار روی GitHub Pages فقط کافی است همان فایل در `main/circuit/index.html` کپی شود — بدون نیاز به تنظیم مسیر پایه.
> **English:** Since the file is fully self-contained (no relative paths), publishing to GitHub Pages is just a copy to `main/circuit/index.html` — no base-path configuration needed.

---

## 📚 محتوای شبیه‌ساز &nbsp;|&nbsp; What's inside

**فارسی:** یک آزمایشگاه مدار الکتریکی با کشیدن‌ورهاکردن قطعات (باتری، لامپ، کلید، سیم، مقاومت)، در چهار حالت کاری.

**English:** A drag-and-drop electric circuit lab (battery, lamp, switch, wire, resistor), with four working modes.

| # | English | فارسی |
|:-:|:--|:--|
| ۱ | Free Lab | آزمایشگاه آزاد |
| ۲ | Guess It | حدس بزن |
| ۳ | Circuit Missions | ماموریت مدار |
| ۴ | Know the Parts | قطعات را بشناس |

**فارسی:** پنج مأموریت مدار — روشن کردن لامپ، افزودن کلید، پیدا کردن مدار خراب، کم‌نور کردن لامپ، و روشن کردن دو لامپ — به‌همراه آزمایش‌های هدایت‌شده روی کلید، باتری و مقاومت.

**English:** Five circuit missions — light the lamp, add a switch, find the broken circuit, dim the lamp, and light two lamps — plus guided experiments on the switch, battery, and resistor.

- 🌐 **دو‌زبانه / Bilingual** — فارسی و انگلیسی، با تغییر جهت کامل (RTL/LTR) · Persian and English, with full RTL/LTR switching
- 🧲 **کشیدن و رها کردن / Drag & drop** — قطعات را از جعبه‌ابزار بکش و مدار بساز · drag parts from the toolbox and build a circuit
- ✨ **نمایش جریان زنده / Live current visualization** — نقطه‌های نورانی مسیر جریان را نشان می‌دهند · glowing dots show the current flowing
- 🏆 **ماموریت‌ها و امتیاز / Missions and points** — یادگیری از طریق بازی · learning through play
- 🔬 **شبیه‌سازی فیزیکی واقعی / Real physics** — تحلیل واقعی مدار (ولتاژ، جریان، مقاومت)<br>real circuit analysis (voltage, current, resistance)

---

## 🗂️ ساختار این برنچ &nbsp;|&nbsp; Branch layout

| مسیر / Path | توضیح / Description |
|:--|:--|
| `index.html` | نسخهٔ بیلد‌شده و خودکفا با قفل رمز — prebuilt, self-contained, gated app |
| `circuit-src/` | سورس کامل (React + Vite + TypeScript) — full source |
| `circuit-src/src/Gate.tsx` | کامپوننت قفل رمز — the password gate component |
| `circuit-src/src/circuit/` | موتور تحلیل مدار — the circuit analysis engine |
| `circuit-src/src/data/` | قطعات، ماموریت‌ها و آزمایش‌ها — parts, missions, and experiments |

---

## 📄 مجوز &nbsp;|&nbsp; License

منتشر شده تحت مجوز موجود در فایل [LICENSE](LICENSE).
Released under the license in [LICENSE](LICENSE).

<div align="center">
<br>
<sub>ساخته شده برای پژوهش و آموزش &nbsp;·&nbsp; Built for research and teaching</sub>
</div>
