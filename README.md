<div align="center">

# 🚀 آزمایشگاه منظومه شمسی
# 🚀 Interactive Solar System Simulator

### شبیه‌سازی تعاملی منظومه شمسی — مدار، سرعت، فاصله، فصل‌ها و شب و روز
### An interactive solar system simulator — orbits, speed, distance, seasons, and day & night

<p>
<img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black">
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
<img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white">
<img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white">
</p>

`#SolarSystem` `#Astronomy` `#Planets` `#Space` `#Orbits` `#STEM` `#KidsScience` `#Simulator` `#ScienceEducation`

</div>

---

## 🔗 لینک ورود &nbsp;|&nbsp; Open the simulator

<div align="center">

### ▶️ [ورود به شبیه‌ساز · Open the simulator](https://fatemeh1203.github.io/Smart-Simulators-ShowCase/solar/)

`https://fatemeh1203.github.io/Smart-Simulators-ShowCase/solar/`

**رمز · Password:** `project`

</div>

**فارسی:** شبیه‌ساز روی **GitHub Pages** منتشر شده و با لینک بالا مستقیماً در مرورگر باز می‌شود. با باز کردن آن، یک صفحهٔ ورود نمایش داده می‌شود. هر کسی که رمز بالا را وارد کند می‌تواند شبیه‌ساز را ببیند. رمز تا پایان همان نشست مرورگر (session) ذخیره می‌ماند و با بستن مرورگر دوباره پرسیده می‌شود. (نسخهٔ استاتیک از همین سورس ساخته و روی برنچ `main` در مسیر `solar/` قرار گرفته است.)

**English:** The simulator is published on **GitHub Pages** and opens straight in the browser from the link above. Opening it shows a login screen. Anyone who types the password above can view the simulator. The unlock is remembered for the current browser session and is asked again after the browser is closed. (A static build from this source is hosted on the `main` branch under `solar/`.)

> ⚠️ **این یک قفلِ سمتِ‌کاربر (client-side) است، نه امنیت واقعی.** چون کل برنامه یک فایل استاتیک است، رمز عبور در سورس صفحه قابل مشاهده است و کاربر فنی می‌تواند آن را دور بزند. این قفل فقط جلوی دسترسی اتفاقی را می‌گیرد؛ برای دادهٔ حساس مناسب نیست.
>
> ⚠️ **This is a client-side gate, not real security.** Because the whole app is a static file, the password is visible in the page source and a technical user can bypass it. It only keeps casual visitors out — do not rely on it for sensitive data.

برای تغییر رمز، مقدار `PASSWORD` را در `solar-src/src/Gate.tsx` عوض کنید، دوباره بیلد بگیرید و خروجی را روی `main/solar/` جایگزین کنید.
To change the password, edit `PASSWORD` in `solar-src/src/Gate.tsx`, rebuild, and replace the copy at `main/solar/`.

> **📌 سورس این پروژه روی همین برنچ (`solar-system-lab`) نگه‌داری می‌شود؛ نسخهٔ منتشرشده روی `main/solar/` است.**
> **The source lives on this `solar-system-lab` branch; the published build is on `main/solar/`.**

---

## ▶️ اجرا &nbsp;|&nbsp; How to run

### گزینهٔ ۱ — فایل آمادهٔ بیلد‌شده &nbsp;|&nbsp; Option 1 — prebuilt file
فایل `index.html` در ریشهٔ این برنچ، نسخهٔ کاملاً خودکفا و بیلد‌شده است (همهٔ کدها و استایل‌ها در همان یک فایل قرار دارند). کافی است آن را در مرورگر باز کنید.

The `index.html` at the root of this branch is a fully self-contained, prebuilt bundle (all code and styles are inlined in that one file). Just open it in a browser.

### گزینهٔ ۲ — از روی سورس &nbsp;|&nbsp; Option 2 — from source
```bash
cd solar-src
npm install
npm run dev      # اجرای محلی برای توسعه · local dev server
npm run build    # ساخت نسخهٔ تک‌فایلی در dist/index.html · build the single-file bundle
```
خروجی `solar-src/dist/index.html` را می‌توانید جایگزین `index.html` ریشه کنید.
Copy the resulting `solar-src/dist/index.html` over the root `index.html`.

> **فارسی:** چون این فایل کاملاً خودکفاست (بدون هیچ مسیر نسبی)، برای انتشار روی GitHub Pages فقط کافی است همان فایل در `main/solar/index.html` کپی شود — بدون نیاز به تنظیم مسیر پایه.
> **English:** Since the file is fully self-contained (no relative paths), publishing to GitHub Pages is just a copy to `main/solar/index.html` — no base-path configuration needed.

---

## 📚 محتوای شبیه‌ساز &nbsp;|&nbsp; What's inside

**فارسی:** یک آزمایشگاه تعاملی منظومه شمسی با هر ۸ سیاره، در نُه حالت کاری.

**English:** An interactive solar system lab with all 8 planets, in nine working modes.

| # | English | فارسی |
|:-:|:--|:--|
| ۱ | Free Lab | آزمایش آزاد |
| ۲ | Speed Experiment | آزمایش سرعت |
| ۳ | Distance Experiment | آزمایش فاصله |
| ۴ | Build a Planet | سیاره بساز |
| ۵ | Find the Planet | سیاره را پیدا کن |
| ۶ | Race | مسابقه |
| ۷ | Day & Night | شب و روز |
| ۸ | Seasons | فصل‌ها |
| ۹ | Missions | مأموریت‌ها |

**فارسی:** هر ۸ سیاره — عطارد، زهره، زمین، مریخ، مشتری، زحل، اورانوس و نپتون — با اطلاعات واقعی (فاصله، سرعت مداری، اندازه و ویژگی‌ها).

**English:** All 8 planets — Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune — with real data (distance, orbital speed, size, and features).

- 🌐 **دو‌زبانه / Bilingual** — فارسی و انگلیسی، با تغییر جهت کامل (RTL/LTR) · Persian and English, with full RTL/LTR switching
- 🪐 **مدارهای واقعی و کنترل سرعت زمان / Real orbits with time-speed control** — ۱× تا ۱۰× · 1× to 10×
- 🔍 **بازی حدس بزن / Guess-the-planet game** — سرنخ ببین، حدس بزن، جواب را کشف کن · see a clue, guess, discover the answer
- 🏁 **مسابقهٔ سیارات / Planet race** — کدام سیاره سریع‌تر دور خورشید می‌چرخد؟ · which planet orbits the sun fastest?
- 🌗 **شبیه‌سازی شب و روز و فصل‌ها / Day/night and seasons simulation**
- 🏆 **مأموریت‌ها و ستاره / Missions & stars** — یادگیری از طریق بازی · learning through play

---

## 🗂️ ساختار این برنچ &nbsp;|&nbsp; Branch layout

| مسیر / Path | توضیح / Description |
|:--|:--|
| `index.html` | نسخهٔ بیلد‌شده و خودکفا با قفل رمز — prebuilt, self-contained, gated app |
| `solar-src/` | سورس کامل (React + Vite + TypeScript) — full source |
| `solar-src/src/Gate.tsx` | کامپوننت قفل رمز — the password gate component |
| `solar-src/src/data/planets.ts` | داده‌های سیارات — the planet data |
| `solar-src/src/sim/Simulation.ts` | موتور شبیه‌سازی مداری — the orbital simulation engine |
| `solar-src/src/components/` | نماهای مختلف — آزمایش‌ها، بازی‌ها، فصل‌ها، شب و روز — Experiments, games, seasons, day/night views |

---

## 📄 مجوز &nbsp;|&nbsp; License

منتشر شده تحت مجوز موجود در فایل [LICENSE](LICENSE).
Released under the license in [LICENSE](LICENSE).

<div align="center">
<br>
<sub>ساخته شده برای پژوهش و آموزش &nbsp;·&nbsp; Built for research and teaching</sub>
</div>
