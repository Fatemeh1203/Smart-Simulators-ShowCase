<div align="center">

# ⚛️ I&C Simulator
# ⚛️ شبیه‌ساز ابزار دقیق و کنترل (I&C)

### Fiber Optics · Kalman Filter · Neutron Flux · Digital Twin · IEC 61850
### فیبر نوری · فیلتر کالمن · شار نوترون · دوقلوی دیجیتال · IEC 61850

<p>
<img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white">
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
<img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white">
<img alt="Recharts" src="https://img.shields.io/badge/Recharts-3-FF6384?style=for-the-badge">
</p>

`#I&C` `#FiberOptic` `#KalmanFilter` `#DigitalTwin` `#IEC61850` `#NeutronFlux` `#Nuclear` `#SmartGrid` `#NextJS` `#Simulator`

</div>

---

## 🔗 لینک ورود &nbsp;|&nbsp; Open the simulator

<div align="center">

### ▶️ [ورود به شبیه‌ساز · Open the simulator](https://fatemeh1203.github.io/Smart-Simulators-ShowCase/ic-sim/)

`https://fatemeh1203.github.io/Smart-Simulators-ShowCase/ic-sim/`

</div>

**فارسی:** شبیه‌ساز روی **GitHub Pages** منتشر شده و با لینک بالا مستقیماً در مرورگر باز می‌شود — زبان پیش‌فرض انگلیسی است و از نوار بالا به فارسی تغییر می‌کند. (نسخهٔ استاتیک از همین سورس ساخته و روی برنچ `main` در مسیر `ic-sim/` قرار گرفته است.)

**English:** The simulator is published on **GitHub Pages** and opens straight in the browser from the link above — default language English, switchable to Persian from the top bar. (A static export built from this source is hosted on the `main` branch under `ic-sim/`.)

> **📌 سورس این پروژه روی همین برنچ (`ic-simulator`) نگه‌داری می‌شود؛ نسخهٔ منتشرشده روی `main/ic-sim/` است.**
> **The source lives on this `ic-simulator` branch; the published build is on `main/ic-sim/`.**

---

## ✨ محتوا &nbsp;|&nbsp; What's inside

**فارسی:** یک شبیه‌ساز تعاملی Next.js برای مفاهیم ابزار دقیق و کنترل (I&C) در نیروگاه‌های هسته‌ای و شبکه‌های هوشمند، شامل هفت بخش تعاملی به‌همراه واژه‌نامه:

**English:** An interactive Next.js simulator for instrumentation & control (I&C) concepts in nuclear power and smart-grid systems — seven interactive sections plus a glossary:

| # | English | فارسی |
|:-:|:--|:--|
| ۱ | Sensor Errors | خطاهای حسگر |
| ۲ | Kalman Filter | فیلتر کالمن |
| ۳ | Neutron Flux | شار نوترون |
| ۴ | Fiber Optic | فیبر نوری |
| ۵ | Digital Twin | دوقلوی دیجیتال |
| ۶ | IEC 61850 | IEC 61850 |
| ۷ | Standards Map | نقشهٔ استانداردها |
| — | Glossary | واژه‌نامه |

- 🌐 **دو‌زبانه / Bilingual** — انگلیسی (پیش‌فرض) و فارسی · English (default) and Persian
- 🌙 **پوستهٔ تیرهٔ راکتور / Dark tech-reactor theme** با افکت‌های نور و انیمیشن · with glow effects and animations
- 📚 **منابع معتبر / Cited sources** — IEC, ISO, IEEE, IAEA
- 📊 **نمودارهای تعاملی / Interactive charts** — Recharts

---

## 🛠️ فناوری‌ها &nbsp;|&nbsp; Tech stack

Next.js 16 (App Router) · TypeScript 5 · Tailwind CSS 4 · shadcn/ui · Recharts · Vazirmatn font (Latin + Arabic)

---

## ▶️ اجرای محلی &nbsp;|&nbsp; Run locally

```bash
# نصب وابستگی‌ها · install dependencies
bun install        # یا / or: npm install

# اجرای سرور توسعه · run the dev server
bun run dev        # یا / or: npm run dev

# ساخت نسخهٔ تولید · production build
bun run build
```

سپس در مرورگر باز کنید: <http://localhost:3000>
Then open <http://localhost:3000> in your browser.

> **فارسی:** این اپ Next.js است و برای اجرای تولیدیِ کامل به محیط Node/Bun نیاز دارد. برای میزبانی روی GitHub Pages، از آن یک **static export** گرفته شده است.
> **English:** This is a Next.js app and needs a Node/Bun runtime for a full production server. For GitHub Pages hosting it is built as a **static export**.

### 🌐 ساخت نسخهٔ GitHub Pages &nbsp;|&nbsp; Building the GitHub Pages version

برای بازتولید نسخهٔ منتشرشده در `main/ic-sim/`، در `next.config.ts` این تنظیمات اعمال شده است:
To reproduce the build published at `main/ic-sim/`, `next.config.ts` uses:

```ts
output: "export",
basePath: "/Smart-Simulators-ShowCase/ic-sim",
assetPrefix: "/Smart-Simulators-ShowCase/ic-sim",
trailingSlash: true,
images: { unoptimized: true },
```

- مسیر `src/app/api/` حذف شده (static export از route handler پشتیبانی نمی‌کند).
  The `src/app/api/` route is removed (static export does not support route handlers).
- فونت Vazirmatn به‌جای `next/font` با یک `<link>` در زمان اجرا بارگذاری می‌شود.
  The Vazirmatn font is loaded via a runtime `<link>` instead of `next/font`.
- سپس `npx next build` خروجی `out/` را می‌سازد که در `main/ic-sim/` قرار می‌گیرد.
  Then `npx next build` produces `out/`, which is copied to `main/ic-sim/`.

---

## 🗂️ ساختار پروژه &nbsp;|&nbsp; Project structure

```
src/
├── app/
│   ├── layout.tsx          # چیدمان ریشه + فونت Vazirmatn + I18nProvider
│   ├── page.tsx            # صفحهٔ اصلی: هیرو + همهٔ بخش‌ها
│   └── globals.css         # پوستهٔ تیرهٔ راکتور
├── components/
│   ├── sim/                # کامپوننت‌های مشترک شبیه‌ساز
│   └── sections/           # هفت بخش تعاملی + واژه‌نامه
└── lib/
    ├── translations.ts     # همهٔ رشته‌ها به انگلیسی و فارسی
    ├── format.ts           # ابزار قالب‌بندی اعداد
    └── utils.ts
```

---

## 👩‍🔬 سازنده &nbsp;|&nbsp; Creator

**Fatemeh Shams — فاطمه شمس** · PhD Researcher, IASBS
- GitHub: <https://github.com/Fatemeh1203>
- LinkedIn: <https://www.linkedin.com/in/fatemeh-shams/>
- ResearchGate: <https://www.researchgate.net/profile/Fatemeh-Shams-3>

---

## 📖 منابع &nbsp;|&nbsp; Sources

- IEC 61226, IEC 60880, IEC 61468, IEC 61513, IEC 63096, IEC 62645
- IEC 61850, IEC 62351 · ISO 23247 · IEEE 7-4.3.2
- IAEA-TECDOC on Digital Twins in Nuclear
- Kalman, R.E. (1960) — "A New Approach to Linear Filtering"

بر اساس فصل مشترک با دکتر بهمن ظهوری دربارهٔ سامانه‌های I&C برای شبکه‌های هوشمند با AI/ML/DL.
Based on the joint chapter with Dr. Bahman Zahouri on I&C systems for smart grids with AI/ML/DL.

---

## 📄 مجوز &nbsp;|&nbsp; License

منتشر شده تحت مجوز موجود در فایل [LICENSE](LICENSE).
Released under the license in [LICENSE](LICENSE).

<div align="center">
<br>
<sub>ساخته شده برای پژوهش و آموزش &nbsp;·&nbsp; Built for research and teaching</sub>
</div>
