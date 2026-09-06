<div align="center">

# 🎲 آزمایشگاه احتمال
# 🎲 Interactive Probability Simulator

### شبیه‌سازی تعاملی احتمال نظری و تجربی — سکه، تاس و کیسهٔ توپ
### An interactive theoretical & experimental probability simulator — coin, dice, and a bag of balls

<p>
<img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black">
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
<img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white">
<img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white">
</p>

`#Probability` `#Statistics` `#Math` `#MathEducation` `#STEM` `#Simulator` `#TheoreticalProbability` `#ExperimentalProbability`

</div>

---

## 🔗 لینک ورود &nbsp;|&nbsp; Open the simulator

<div align="center">

### ▶️ [ورود به شبیه‌ساز · Open the simulator](https://fatemeh1203.github.io/Smart-Simulators-ShowCase/probability/)

`https://fatemeh1203.github.io/Smart-Simulators-ShowCase/probability/`

**رمز · Password:** `project`

</div>

**فارسی:** شبیه‌ساز روی **GitHub Pages** منتشر شده و با لینک بالا مستقیماً در مرورگر باز می‌شود. با باز کردن آن، یک صفحهٔ ورود نمایش داده می‌شود. هر کسی که رمز بالا را وارد کند می‌تواند شبیه‌ساز را ببیند. رمز تا پایان همان نشست مرورگر (session) ذخیره می‌ماند و با بستن مرورگر دوباره پرسیده می‌شود. (نسخهٔ استاتیک از همین سورس ساخته و روی برنچ `main` در مسیر `probability/` قرار گرفته است.)

**English:** The simulator is published on **GitHub Pages** and opens straight in the browser from the link above. Opening it shows a login screen. Anyone who types the password above can view the simulator. The unlock is remembered for the current browser session and is asked again after the browser is closed. (A static build from this source is hosted on the `main` branch under `probability/`.)

> ⚠️ **این یک قفلِ سمتِ‌کاربر (client-side) است، نه امنیت واقعی.** چون کل برنامه یک فایل استاتیک است، رمز عبور در سورس صفحه قابل مشاهده است و کاربر فنی می‌تواند آن را دور بزند. این قفل فقط جلوی دسترسی اتفاقی را می‌گیرد؛ برای دادهٔ حساس مناسب نیست.
>
> ⚠️ **This is a client-side gate, not real security.** Because the whole app is a static file, the password is visible in the page source and a technical user can bypass it. It only keeps casual visitors out — do not rely on it for sensitive data.

برای تغییر رمز، مقدار `PASSWORD` را در `probability-src/src/Gate.tsx` عوض کنید، دوباره بیلد بگیرید و خروجی را روی `main/probability/` جایگزین کنید.
To change the password, edit `PASSWORD` in `probability-src/src/Gate.tsx`, rebuild, and replace the copy at `main/probability/`.

> **📌 سورس این پروژه روی همین برنچ (`probability-lab`) نگه‌داری می‌شود؛ نسخهٔ منتشرشده روی `main/probability/` است.**
> **The source lives on this `probability-lab` branch; the published build is on `main/probability/`.**

---

## ▶️ اجرا &nbsp;|&nbsp; How to run

### گزینهٔ ۱ — فایل آمادهٔ بیلد‌شده &nbsp;|&nbsp; Option 1 — prebuilt file
فایل `index.html` در ریشهٔ این برنچ، نسخهٔ کاملاً خودکفا و بیلد‌شده است (همهٔ کدها و استایل‌ها در همان یک فایل قرار دارند). کافی است آن را در مرورگر باز کنید.

The `index.html` at the root of this branch is a fully self-contained, prebuilt bundle (all code and styles are inlined in that one file). Just open it in a browser.

### گزینهٔ ۲ — از روی سورس &nbsp;|&nbsp; Option 2 — from source
```bash
cd probability-src
npm install
npm run dev      # اجرای محلی برای توسعه · local dev server
npm run build    # ساخت نسخهٔ تک‌فایلی در dist/index.html · build the single-file bundle
```
خروجی `probability-src/dist/index.html` را می‌توانید جایگزین `index.html` ریشه کنید.
Copy the resulting `probability-src/dist/index.html` over the root `index.html`.

> **فارسی:** چون این فایل کاملاً خودکفاست (بدون هیچ مسیر نسبی)، برای انتشار روی GitHub Pages فقط کافی است همان فایل در `main/probability/index.html` کپی شود — بدون نیاز به تنظیم مسیر پایه.
> **English:** Since the file is fully self-contained (no relative paths), publishing to GitHub Pages is just a copy to `main/probability/index.html` — no base-path configuration needed.

---

## 📚 محتوای شبیه‌ساز &nbsp;|&nbsp; What's inside

**فارسی:** یک آزمایشگاه تعاملی احتمال که احتمال نظری و تجربی را مقایسه می‌کند، با سه آزمایش تصادفی و سه حالت کاری.

**English:** An interactive probability lab comparing theoretical and experimental probability, with three random experiments and three working modes.

| # | English | فارسی |
|:-:|:--|:--|
| ۱ | Coin | پرتاب سکه |
| ۲ | Dice | پرتاب تاس |
| ۳ | Bag of Balls | انتخاب توپ از کیسه |

| # | English | فارسی |
|:-:|:--|:--|
| ۱ | Predict | پیش‌بینی |
| ۲ | Challenge | چالش |
| ۳ | Teacher Mode | حالت معلم |

- 🌐 **دو‌زبانه / Bilingual** — فارسی و انگلیسی، با تغییر جهت کامل (RTL/LTR) · Persian and English, with full RTL/LTR switching
- ⚖️ **مقایسهٔ احتمال نظری و تجربی / Theoretical vs. experimental probability** — تفاوت بین «باید» و «واقعاً اتفاق افتاد» · the gap between "should happen" and "actually happened"
- 🎛️ **تنظیم انصاف سکه/تاس / Adjustable fairness** — سکه یا تاس عادلانه یا ناعادلانه بساز · make a fair or unfair coin/die
- ⚡ **آزمایش دسته‌ای / Batch experiments** — از ۱۰ تا ۱۰٬۰۰۰ بار تکرار در یک کلیک · run 10 to 10,000 trials in one click
- 📈 **نمودار همگرایی / Convergence chart** — ببین احتمال تجربی چطور با تکرار بیشتر به نظری نزدیک می‌شود<br>watch experimental probability converge to the theoretical value with more trials
- 🎯 **حالت پیش‌بینی و چالش / Predict and Challenge modes** — قبل از آزمایش حدس بزن · guess before testing
- 👩‍🏫 **حالت معلم / Teacher Mode** — آماده‌سازی برای کلاس درس · classroom-ready setup

---

## 🗂️ ساختار این برنچ &nbsp;|&nbsp; Branch layout

| مسیر / Path | توضیح / Description |
|:--|:--|
| `index.html` | نسخهٔ بیلد‌شده و خودکفا با قفل رمز — prebuilt, self-contained, gated app |
| `probability-src/` | سورس کامل (React + Vite + TypeScript) — full source |
| `probability-src/src/Gate.tsx` | کامپوننت قفل رمز — the password gate component |
| `probability-src/src/lib/probability.ts` | موتور محاسبات احتمال — the probability engine |
| `probability-src/src/components/` | نمای سکه، تاس، کیسه، نمودار همگرایی و پنل‌های چالش/معلم — Coin, Dice, Bag, convergence chart, Challenge/Teacher panels |

---

## 📄 مجوز &nbsp;|&nbsp; License

منتشر شده تحت مجوز موجود در فایل [LICENSE](LICENSE).
Released under the license in [LICENSE](LICENSE).

<div align="center">
<br>
<sub>ساخته شده برای پژوهش و آموزش &nbsp;·&nbsp; Built for research and teaching</sub>
</div>
