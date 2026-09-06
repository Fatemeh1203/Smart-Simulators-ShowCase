import { useMemo, useState } from "react";
import { useApp } from "../context";
import { Btn, Icon, I } from "../components/UI";
import heroLab from "../assets/hero-lab.jpg";

function FloatingMath() {
  const items = useMemo(
    () => [
      { t: "y = mx + b", x: "8%", y: "18%", d: "0s" },
      { t: "m = Δy / Δx", x: "72%", y: "22%", d: "1.2s" },
      { t: "A(2, 3)", x: "14%", y: "72%", d: "0.6s" },
      { t: "شیب مثبت", x: "78%", y: "70%", d: "1.8s" },
      { t: "Δx", x: "48%", y: "12%", d: "0.3s" },
      { t: "Δy", x: "58%", y: "80%", d: "2s" },
    ],
    []
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((it) => (
        <div
          key={it.t}
          className="float absolute rounded-2xl border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80 backdrop-blur-md"
          style={{ left: it.x, top: it.y, animationDelay: it.d }}
        >
          <span className="ltr font-medium">{it.t}</span>
        </div>
      ))}
      <div className="scene-3d absolute left-1/2 top-[18%] h-56 w-56 -translate-x-1/2 opacity-70">
        <div className="plane-3d relative h-full w-full">
          <div className="absolute inset-6 rounded-xl border border-cyan-300/30 bg-cyan-400/5" style={{ transform: "rotateX(70deg)" }} />
          <div className="absolute left-1/2 top-4 h-44 w-[2px] bg-gradient-to-b from-cyan-300 to-transparent" />
          <div className="absolute left-6 top-1/2 h-[2px] w-44 bg-gradient-to-l from-indigo-400 to-transparent" />
          <div className="absolute left-8 top-10 h-[2px] w-40 origin-left bg-fuchsia-400/80" style={{ transform: "rotate(-28deg)" }} />
          <div className="absolute left-[42%] top-[38%] h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_16px_#22d3ee]" />
          <div className="absolute left-[62%] top-[28%] h-3 w-3 rounded-full bg-violet-400 shadow-[0_0_16px_#8b5cf6]" />
        </div>
      </div>
    </div>
  );
}

export function Landing() {
  const { login, theme, toggleTheme } = useApp();
  const [name, setName] = useState("");
  const [err, setErr] = useState("");

  const go = (role: "student" | "teacher") => {
    if (!name.trim()) {
      setErr("لطفاً نام خود را وارد کنید.");
      return;
    }
    login(name, role);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b16] text-white">
      <img src={heroLab} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#070b16]/30 via-[#070b16]/55 to-[#070b16]" />
      <FloatingMath />

      <header className="relative z-10 flex items-center justify-between px-5 py-4 md:px-10">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/30">
            <Icon d={I.slope} className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold">آزمایشگاه خط</div>
            <div className="text-[11px] text-white/60">ریاضی پایه نهم</div>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className="focus-ring rounded-2xl border border-white/15 bg-white/10 p-2.5 backdrop-blur"
          aria-label="تغییر پوسته"
        >
          <Icon d={theme === "dark" ? I.sun : I.moon} />
        </button>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-5xl flex-col items-center justify-center px-5 pb-16 pt-6 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-cyan-200 backdrop-blur">
          <Icon d={I.spark} className="h-4 w-4" />
          یادگیری با کشف، نه با حفظ کردن
        </div>
        <h1 className="max-w-3xl text-3xl font-black leading-tight md:text-6xl">آزمایشگاه خط و معادله‌های خطی</h1>
        <p className="mt-4 text-base text-white/70 md:text-xl">ریاضی پایه نهم · شیب، معادله و نمودار را با دست خودت بساز</p>

        <div className="mt-8 w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-5 text-right backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <label className="block text-sm text-white/80">
            نام شما
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErr("");
              }}
              placeholder="نام را وارد کنید"
              className="focus-ring mt-2 w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/35"
            />
          </label>
          {err && <p className="mt-2 text-sm text-rose-300">{err}</p>}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Btn onClick={() => go("student")} className="w-full py-3">
              <Icon d={I.spark} className="h-4 w-4" />
              ورود به عنوان دانش‌آموز
            </Btn>
            <Btn variant="ghost" onClick={() => go("teacher")} className="w-full border-white/20 py-3 text-white hover:bg-white/10">
              <Icon d={I.book} className="h-4 w-4" />
              ورود به عنوان معلم
            </Btn>
          </div>
        </div>

        <div className="mt-10 grid w-full max-w-3xl grid-cols-3 gap-3 text-xs text-white/70">
          {[
            ["۱۳ مرحله", "مسیر یادگیری تعاملی"],
            ["آزمایش زنده", "شیب و معادله در لحظه"],
            ["کلاس معلم", "تحلیل و آزمون‌ساز"],
          ].map(([a, b]) => (
            <div key={a} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
              <div className="font-bold text-white">{a}</div>
              <div className="mt-1 hidden sm:block">{b}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
