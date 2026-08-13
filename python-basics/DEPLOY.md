# Publishing guide / راهنمای انتشار

You do **not** need to know how to code to publish this. Pick one option below.
برای انتشار **نیازی به برنامه‌نویسی نیست**. یکی از روش‌های زیر را انتخاب کنید.

---

## Option A — Netlify Drop (easiest / ساده‌ترین)
1. Go to **https://app.netlify.com/drop**
2. Drag the whole `python-basics` folder onto the page.
3. You instantly get a public link like `https://your-name.netlify.app`.

۱. به آدرس بالا بروید. ۲. کل پوشه را روی صفحه بکشید و رها کنید. ۳. بلافاصله یک لینک عمومی می‌گیرید.

---

## Option B — GitHub Pages (free & permanent / رایگان و دائمی)
1. Create a free account at **https://github.com**.
2. Click **New repository**, name it e.g. `python-basics`, make it **Public**, create.
3. Click **Add file → Upload files**, drag in `index.html` (and the other files), then **Commit**.
4. Go to **Settings → Pages**.
5. Under **Branch**, choose `main` and folder `/ (root)`, then **Save**.
6. After a minute your course is live at:
   `https://YOUR-USERNAME.github.io/python-basics/`

۱. حساب رایگان بسازید. ۲. یک ریپازیتوریِ Public جدید بسازید. ۳. فایل‌ها را آپلود و Commit کنید. ۴. از Settings وارد Pages شوید. ۵. شاخه‌ی `main` و پوشه‌ی root را انتخاب و ذخیره کنید. ۶. لینک دوره تا یک دقیقه فعال می‌شود.

---

## Option C — Vercel / Cloudflare Pages
Same idea: create an account, drag-and-drop or connect the folder, get a link.
همان روش: حساب بسازید، پوشه را بکشید و رها کنید یا وصل کنید، لینک بگیرید.

---

## Option D — Your school server / سرور مدرسه
Copy the `python-basics` folder into the web root (e.g. `public_html`). The course is then at
`https://your-domain/python-basics/`.
پوشه را در ریشه‌ی وب سرور کپی کنید.

---

## Sharing offline / اشتراک‌گذاری آفلاین
You can also just send students the single `index.html` file (email, USB, messaging app).
They double-click it — lessons, examples, quizzes, and the report card all work without internet;
only the live **Run** button needs a connection.

می‌توانید فقط فایل `index.html` را برای دانش‌آموزان بفرستید. با دوبار کلیک باز می‌شود؛ همه‌چیز آفلاین کار می‌کند و فقط دکمه‌ی «اجرا» به اینترنت نیاز دارد.

---

## Tip / نکته
Rename `index.html` if you like, but on GitHub Pages / Netlify keep it named **`index.html`**
so it opens automatically as the homepage.
روی GitHub Pages و Netlify نام فایل را `index.html` نگه دارید تا خودکار به‌عنوان صفحه‌ی اصلی باز شود.
