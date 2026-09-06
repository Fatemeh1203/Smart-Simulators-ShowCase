import { useState } from "react";

/**
 * Lightweight access gate.
 *
 * NOTE: This is a client-side gate only. Because the whole app is a static
 * bundle, the password below is present in the page source and a determined
 * user can bypass it. It keeps casual visitors out — it is not real security.
 */
const PASSWORD = "project";
const STORAGE_KEY = "prob_unlocked";

export default function Gate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(
    () => typeof sessionStorage !== "undefined" && sessionStorage.getItem(STORAGE_KEY) === "1"
  );
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  if (unlocked) return <>{children}</>;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (value === PASSWORD) {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore storage errors */
      }
      setUnlocked(true);
    } else {
      setError(true);
    }
  }

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950 px-4"
      style={{ fontFamily: "Vazirmatn, system-ui, sans-serif" }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-slate-700/60 bg-slate-900/80 p-7 shadow-2xl">
        <div className="mb-1 text-center text-3xl">🎲</div>
        <h1 className="text-center text-lg font-extrabold text-slate-100">
          آزمایشگاه احتمال
        </h1>
        <p className="mt-1 text-center text-xs text-slate-400">
          Interactive Probability Simulator
        </p>
        <p className="mt-4 text-center text-[13px] leading-6 text-slate-300">
          برای ورود، رمز عبور را وارد کنید.
          <br />
          <span className="text-slate-400">Enter the password to continue.</span>
        </p>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <input
            type="password"
            autoFocus
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(false);
            }}
            placeholder="رمز عبور · Password"
            className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-center text-slate-100 outline-none focus:border-cyan-500"
          />
          {error && (
            <p className="text-center text-[13px] text-rose-400">
              رمز عبور نادرست است · Wrong password
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-bold text-white transition hover:opacity-90"
          >
            ورود · Enter
          </button>
        </form>
      </div>
    </div>
  );
}
