<div align="center">

# 🔬 آزمایشگاه مجازی ریاضی
# 🔬 Virtual Math Lab — Grade 4

### شبیه‌سازی تعاملی ریاضی چهارم دبستان — هفت فصل با شبیه‌ساز، آزمون و کارنامه
### An interactive math lab for grade 4 — seven chapters with simulators, quizzes, and a report card

<p>
<img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black">
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
<img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white">
</p>

`#MathEducation` `#Grade4Math` `#Fractions` `#Geometry` `#Statistics` `#STEM` `#Simulator` `#KidsMath`

</div>

---

## 🔗 لینک ورود &nbsp;|&nbsp; Open the simulator

<div align="center">

### ▶️ [ورود به شبیه‌ساز · Open the simulator](https://fatemeh1203.github.io/Smart-Simulators-ShowCase/math-lab/)

`https://fatemeh1203.github.io/Smart-Simulators-ShowCase/math-lab/`

**رمز · Password:** `project`

</div>

**فارسی:** شبیه‌ساز روی **GitHub Pages** منتشر شده و با لینک بالا مستقیماً در مرورگر باز می‌شود. با باز کردن آن، یک صفحهٔ ورود نمایش داده می‌شود. هر کسی که رمز بالا را وارد کند می‌تواند شبیه‌ساز را ببیند. رمز تا پایان همان نشست مرورگر (session) ذخیره می‌ماند و با بستن مرورگر دوباره پرسیده می‌شود. (نسخهٔ استاتیک از همین سورس ساخته و روی برنچ `main` در مسیر `math-lab/` قرار گرفته است.)

**English:** The simulator is published on **GitHub Pages** and opens straight in the browser from the link above. Opening it shows a login screen. Anyone who types the password above can view the simulator. The unlock is remembered for the current browser session and is asked again after the browser is closed. (A static build from this source is hosted on the `main` branch under `math-lab/`.)

> ⚠️ **این یک قفلِ سمتِ‌کاربر (client-side) است، نه امنیت واقعی.** چون کل برنامه یک فایل استاتیک است، رمز عبور در سورس صفحه قابل مشاهده است و کاربر فنی می‌تواند آن را دور بزند. این قفل فقط جلوی دسترسی اتفاقی را می‌گیرد؛ برای دادهٔ حساس مناسب نیست.
>
> ⚠️ **This is a client-side gate, not real security.** Because the whole app is a static file, the password is visible in the page source and a technical user can bypass it. It only keeps casual visitors out — do not rely on it for sensitive data.

برای تغییر رمز، مقدار `PASSWORD` را در `simulator-src/src/Gate.tsx` عوض کنید، دوباره بیلد بگیرید و خروجی را روی `main/math-lab/` جایگزین کنید.
To change the password, edit `PASSWORD` in `simulator-src/src/Gate.tsx`, rebuild, and replace the copy at `main/math-lab/`.

> **📌 سورس این پروژه روی همین برنچ (`math-lab-grade4`) نگه‌داری می‌شود؛ نسخهٔ منتشرشده روی `main/math-lab/` است.**
> **The source lives on this `math-lab-grade4` branch; the published build is on `main/math-lab/`.**

---

## ▶️ اجرا &nbsp;|&nbsp; How to run

### گزینهٔ ۱ — فایل آمادهٔ بیلد‌شده &nbsp;|&nbsp; Option 1 — prebuilt file
فایل `lab/index.html` در این برنچ، نسخهٔ کاملاً خودکفا و بیلد‌شده است (همهٔ کدها و استایل‌ها در همان یک فایل قرار دارند). کافی است آن را در مرورگر باز کنید — یا از `index.html` ریشه که به آن هدایت می‌کند.

The `lab/index.html` in this branch is a fully self-contained, prebuilt bundle (all code and styles are inlined in that one file). Just open it in a browser — or the root `index.html`, which redirects to it.

### گزینهٔ ۲ — از روی سورس &nbsp;|&nbsp; Option 2 — from source
```bash
cd simulator-src
npm install
npm run dev      # اجرای محلی برای توسعه · local dev server
npm run build    # ساخت نسخهٔ تک‌فایلی در dist/index.html · build the single-file bundle
```
خروجی `simulator-src/dist/index.html` را می‌توانید جایگزین `lab/index.html` کنید.
Copy the resulting `simulator-src/dist/index.html` over `lab/index.html`.

> **فارسی:** چون این فایل کاملاً خودکفاست (بدون هیچ مسیر نسبی)، برای انتشار روی GitHub Pages فقط کافی است همان فایل در `main/math-lab/index.html` کپی شود — بدون نیاز به تنظیم مسیر پایه.
> **English:** Since the file is fully self-contained (no relative paths), publishing to GitHub Pages is just a copy to `main/math-lab/index.html` — no base-path configuration needed.

---

## 📚 محتوای شبیه‌ساز &nbsp;|&nbsp; What's inside

<div align="center">

<img src="docs/screenshots/01-dashboard.png" alt="Math lab dashboard" width="100%">

</div>

**فارسی:** آزمایشگاه تعاملی ریاضی چهارم دبستان در هفت فصل، با شبیه‌ساز عملی، اهداف یادگیری، آزمون و کارنامهٔ توصیفی قابل چاپ.

**English:** An interactive math lab for fourth grade in seven chapters, with hands-on simulators, learning goals, quizzes and a printable descriptive report card.

<div align="center">

<table>
<tr>
<td width="50%">
<img src="docs/screenshots/02-chapters.png" alt="Chapter cards" width="100%"><br>
<b>Seven chapter cards with learning goals</b><br>
<sub>هفت کارت فصل به همراه اهداف یادگیری</sub>
</td>
<td width="50%">
<img src="docs/screenshots/03-fractions.png" alt="Fraction lab" width="100%"><br>
<b>Fraction lab — slice the pizza, build the fraction</b><br>
<sub>آزمایشگاه کسر — پیتزا را برش بزن و کسر بساز</sub>
</td>
</tr>
<tr>
<td width="50%">
<img src="docs/screenshots/04-angles.png" alt="Protractor lab" width="100%"><br>
<b>Virtual protractor — drag to explore angle types</b><br>
<sub>نقالهٔ مجازی — با کشیدن نوار، نوع زاویه را کشف کن</sub>
</td>
<td width="50%">
<img src="docs/screenshots/05-geometry.png" alt="Geometry lab" width="100%"><br>
<b>Geoboard — resize a shape, watch perimeter and area update</b><br>
<sub>جئوبورد — اندازهٔ شکل را تغییر بده و محیط و مساحت را ببین</sub>
</td>
</tr>
<tr>
<td width="50%">
<img src="docs/screenshots/06-quiz.png" alt="Quiz" width="100%"><br>
<b>Five-question quiz with worked explanations</b><br>
<sub>آزمون پنج‌سؤالی با پاسخ تشریحی</sub>
</td>
<td width="50%">
<img src="docs/screenshots/07-report.png" alt="Report card" width="100%"><br>
<b>Printable descriptive report card</b><br>
<sub>کارنامهٔ توصیفی قابل چاپ</sub>
</td>
</tr>
</table>

</div>

### 📚 فصل‌ها &nbsp;|&nbsp; Chapters

| # | English | فارسی |
|:-:|:--|:--|
| ۱ | Numbers & Patterns | اعداد و الگوها |
| ۲ | Fractions | کسرها |
| ۳ | Multiplication & Division | ضرب و تقسیم |
| ۴ | Angles & Time | زاویه و زمان |
| ۵ | Mixed & Decimal Numbers | عدد مخلوط و عدد اعشاری |
| ۶ | Geometric Shapes | شکل‌های هندسی |
| ۷ | Statistics & Probability | آمار و احتمال |

- 🌐 **دو‌زبانه / Bilingual** — کاملاً راست‌به‌چپ و فارسی · fully right-to-left Persian interface
- 📝 **آزمون با پاسخ تشریحی / Quizzes with worked explanations** — برای هر سؤال · for every answer
- 🧾 **پیشرفت و کارنامه / Progress and report cards** — روی دستگاه خودتان ذخیره می‌شود · saved on your own device
- 🔒 **بدون حساب کاربری و بدون سرور / No account, no server** — داده‌ای از مرورگر خارج نمی‌شود · no data leaves your browser
- 📱 **واکنش‌گرا / Responsive** — روی تبلت و دسکتاپ کار می‌کند · works on tablet and desktop

---

## 🗂️ ساختار این برنچ &nbsp;|&nbsp; Branch layout

| مسیر / Path | توضیح / Description |
|:--|:--|
| `index.html` | صفحهٔ ورود به آزمایشگاه ریاضی — landing page for the math lab |
| `lab/` | نسخهٔ بیلد‌شده و خودکفا با قفل رمز — the prebuilt, self-contained, gated app |
| `simulator.html` | تغییر مسیر به `lab/` — redirect kept for older links |
| `simulator-src/` | سورس کامل (React + Vite + TypeScript) — full source |
| `simulator-src/src/Gate.tsx` | کامپوننت قفل رمز — the password gate component |
| `docs/screenshots/` | تصاویر همین راهنما — images used in this README |

---

## 📄 مجوز &nbsp;|&nbsp; License

منتشر شده تحت مجوز موجود در فایل [LICENSE](LICENSE).
Released under the license in [LICENSE](LICENSE).

<div align="center">
<br>
<sub>ساخته شده برای دانش‌آموزان و معلمان &nbsp;·&nbsp; Built for students and teachers</sub>
</div>
