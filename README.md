<div align="center">

# 🧲 آزمایشگاه مجازی الکترومغناطیس
# 🧲 Interactive Electromagnetism Virtual Lab

### شبیه‌سازی تعاملی الکترومغناطیس — از بار الکتریکی تا امواج الکترومغناطیسی
### An interactive electromagnetism simulator — from electric charge to electromagnetic waves

<p>
<img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black">
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
<img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white">
<img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white">
</p>

`#Electromagnetism` `#Physics` `#ElectricField` `#MagneticField` `#GaussLaw` `#Faraday` `#Maxwell` `#STEM` `#Simulator` `#PhysicsEducation`

</div>

---

## 🔗 لینک ورود &nbsp;|&nbsp; Open the simulator

<div align="center">

### ▶️ [ورود به شبیه‌ساز · Open the simulator](https://fatemeh1203.github.io/Smart-Simulators-ShowCase/electromagnetism/)

`https://fatemeh1203.github.io/Smart-Simulators-ShowCase/electromagnetism/`

**رمز · Password:** `project`

</div>

**فارسی:** شبیه‌ساز روی **GitHub Pages** منتشر شده و با لینک بالا مستقیماً در مرورگر باز می‌شود. با باز کردن آن، یک صفحهٔ ورود نمایش داده می‌شود. هر کسی که رمز بالا را وارد کند می‌تواند شبیه‌ساز را ببیند. رمز تا پایان همان نشست مرورگر (session) ذخیره می‌ماند و با بستن مرورگر دوباره پرسیده می‌شود. (نسخهٔ استاتیک از همین سورس ساخته و روی برنچ `main` در مسیر `electromagnetism/` قرار گرفته است.)

**English:** The simulator is published on **GitHub Pages** and opens straight in the browser from the link above. Opening it shows a login screen. Anyone who types the password above can view the simulator. The unlock is remembered for the current browser session and is asked again after the browser is closed. (A static build from this source is hosted on the `main` branch under `electromagnetism/`.)

> ⚠️ **این یک قفلِ سمتِ‌کاربر (client-side) است، نه امنیت واقعی.** چون کل برنامه یک فایل استاتیک است، رمز عبور در سورس صفحه قابل مشاهده است و کاربر فنی می‌تواند آن را دور بزند. این قفل فقط جلوی دسترسی اتفاقی را می‌گیرد؛ برای دادهٔ حساس مناسب نیست.
>
> ⚠️ **This is a client-side gate, not real security.** Because the whole app is a static file, the password is visible in the page source and a technical user can bypass it. It only keeps casual visitors out — do not rely on it for sensitive data.

برای تغییر رمز، مقدار `PASSWORD` را در `emag-src/src/Gate.tsx` عوض کنید، دوباره بیلد بگیرید و خروجی را روی `main/electromagnetism/` جایگزین کنید.
To change the password, edit `PASSWORD` in `emag-src/src/Gate.tsx`, rebuild, and replace the copy at `main/electromagnetism/`.

> **📌 سورس این پروژه روی همین برنچ (`electromagnetism-lab`) نگه‌داری می‌شود؛ نسخهٔ منتشرشده روی `main/electromagnetism/` است.**
> **The source lives on this `electromagnetism-lab` branch; the published build is on `main/electromagnetism/`.**

---

## ▶️ اجرا &nbsp;|&nbsp; How to run

### گزینهٔ ۱ — فایل آمادهٔ بیلد‌شده &nbsp;|&nbsp; Option 1 — prebuilt file
فایل `index.html` در ریشهٔ این برنچ، نسخهٔ کاملاً خودکفا و بیلد‌شده است (همهٔ کدها و استایل‌ها در همان یک فایل قرار دارند). کافی است آن را در مرورگر باز کنید.

The `index.html` at the root of this branch is a fully self-contained, prebuilt bundle (all code and styles are inlined in that one file). Just open it in a browser.

### گزینهٔ ۲ — از روی سورس &nbsp;|&nbsp; Option 2 — from source
```bash
cd emag-src
npm install
npm run dev      # اجرای محلی برای توسعه · local dev server
npm run build    # ساخت نسخهٔ تک‌فایلی در dist/index.html · build the single-file bundle
```
خروجی `emag-src/dist/index.html` را می‌توانید جایگزین `index.html` ریشه کنید.
Copy the resulting `emag-src/dist/index.html` over the root `index.html`.

> **فارسی:** چون این فایل کاملاً خودکفاست (بدون هیچ مسیر نسبی)، برای انتشار روی GitHub Pages فقط کافی است همان فایل در `main/electromagnetism/index.html` کپی شود — بدون نیاز به تنظیم مسیر پایه.
> **English:** Since the file is fully self-contained (no relative paths), publishing to GitHub Pages is just a copy to `main/electromagnetism/index.html` — no base-path configuration needed.

---

## 📚 محتوای شبیه‌ساز &nbsp;|&nbsp; What's inside

**فارسی:** ۱۲ آزمایشگاه تعاملی الکترومغناطیس در قالب یک مسیر یادگیری ۸ سطحی، به‌همراه آزمایش آزاد و حالت چالش.

**English:** 12 interactive electromagnetism labs organized as an 8-level suggested learning path, plus a free-experiment sandbox and a challenge mode.

| سطح / Level | English | فارسی |
|:-:|:--|:--|
| ۱ | Charge → Electric Field → Force | بار → میدان الکتریکی → نیرو |
| ۲ | Potential → Voltage → Energy | پتانسیل → ولتاژ → انرژی |
| ۳ | Flux → Gauss's Law | شار → قانون گاوس |
| ۴ | Current → Magnetic Field | جریان → میدان مغناطیسی |
| ۵ | Magnetic Force → Particle Motion | نیروی مغناطیسی → حرکت ذره |
| ۶ | Faraday → Lenz → Induction | فارادی → لنز → القا |
| ۷ | Maxwell → Electromagnetic Waves | ماکسول → امواج الکترومغناطیسی |
| ۸ | Waves → Antennas → Radiation | امواج → آنتن → تشعشع |

**فارسی:** ۱۲ آزمایشگاه — میدان الکتریکی، نیرو و حرکت بار، پتانسیل و ولتاژ، خازن، قانون گاوس، میدان مغناطیسی، بیو-ساوار و آمپر، نیروی مغناطیسی، القای الکترومغناطیسی، مدار و جریان، امواج الکترومغناطیسی، آنتن و تشعشع.

**English:** 12 labs — electric field, force & particle motion, potential & voltage, capacitor, Gauss's law, magnetic field, Biot-Savart & Ampère, magnetic force, electromagnetic induction, circuit & current, electromagnetic waves, antenna & radiation.

- 🌐 **دو‌زبانه / Bilingual** — فارسی و انگلیسی، با تغییر جهت کامل (RTL/LTR) · Persian and English, with full RTL/LTR switching
- 🔍 **حالت کشف / Discovery mode** — فرمول‌ها را کشف کن، نه اینکه فقط ببینی · discover formulas instead of just seeing them
- 🤔 **حالت پیش‌بینی / Predict mode** — قبل از دیدن نتیجه حدس بزن · guess the outcome before seeing it
- 📊 **نمودار و نقشهٔ مفهومی / Live graphs and a concept map** — رابطهٔ ریاضی هر پدیده را ببین · see the mathematical relationship behind each phenomenon
- 🧪 **آزمایش آزاد / Free Experiment sandbox** — هرچیزی را خودت بساز و آزمایش کن · build and test anything yourself
- 🏆 **حالت چالش / Challenge mode** — سؤال‌های علمی برای محک زدن یادگیری · science questions to test what you learned

---

## 🗂️ ساختار این برنچ &nbsp;|&nbsp; Branch layout

| مسیر / Path | توضیح / Description |
|:--|:--|
| `index.html` | نسخهٔ بیلد‌شده و خودکفا با قفل رمز — prebuilt, self-contained, gated app |
| `emag-src/` | سورس کامل (React + Vite + TypeScript) — full source |
| `emag-src/src/Gate.tsx` | کامپوننت قفل رمز — the password gate component |
| `emag-src/src/data/constants.ts` | ثابت‌های فیزیکی — physical constants |
| `emag-src/src/data/labsMeta.tsx` | فهرست و ابرداده آزمایشگاه‌ها — the lab registry |
| `emag-src/src/labs/` | ۱۲ آزمایشگاه + آزمایش آزاد + چالش — the 12 labs, Free Experiment, and Challenges |

---

## 📄 مجوز &nbsp;|&nbsp; License

منتشر شده تحت مجوز موجود در فایل [LICENSE](LICENSE).
Released under the license in [LICENSE](LICENSE).

<div align="center">
<br>
<sub>ساخته شده برای پژوهش و آموزش &nbsp;·&nbsp; Built for research and teaching</sub>
</div>
