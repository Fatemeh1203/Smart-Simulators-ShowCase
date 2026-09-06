import { useState } from "react";
import { Card, Button, Slider, Pill } from "../components/ui";
import { K_COULOMB, MU0, C_LIGHT, ELECTRON_CHARGE, ELECTRON_MASS, fmt } from "../data/constants";

function ChallengeCard({
  title,
  mission,
  children,
  checkOk,
  successMsg,
  failMsg,
  hint,
}: {
  title: string;
  mission: string;
  children: React.ReactNode;
  checkOk: boolean;
  successMsg: string;
  failMsg: string;
  hint: string;
}) {
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  return (
    <Card title={`🎯 ${title}`} className="border-indigo-500/30 bg-indigo-950/10">
      <p className="mb-3 text-sm leading-7 text-slate-300">{mission}</p>
      <div className="space-y-3">{children}</div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={() => setChecked(true)}>
          بررسی پاسخ
        </Button>
        <Button variant="ghost" onClick={() => setShowHint((h) => !h)}>
          {showHint ? "پنهان کردن راهنما" : "راهنما"}
        </Button>
        {checked && <Pill color={checkOk ? "emerald" : "rose"}>{checkOk ? "✅ " + successMsg : "❌ " + failMsg}</Pill>}
      </div>
      {showHint && <p className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">💡 {hint}</p>}
    </Card>
  );
}

export default function ChallengesLab() {
  const [q1, setQ1] = useState(20); // nC
  const targetE = 100;
  const r1 = 2;
  const E1 = (K_COULOMB * (q1 * 1e-9)) / (r1 * r1);
  const ok1 = Math.abs(E1 - targetE) / targetE < 0.05;

  const [B2, setB2] = useState(0.2);
  const v2 = 2e6;
  const targetR2 = 0.1;
  const r2 = (ELECTRON_MASS * v2) / (ELECTRON_CHARGE * B2);
  const ok2 = Math.abs(r2 - targetR2) / targetR2 < 0.05;

  const [L3, setL3] = useState(0.4);
  const f3 = 300e6;
  const idealL3 = C_LIGHT / f3 / 2;
  const ok3 = Math.abs(L3 - idealL3) / idealL3 < 0.05;

  const [I4, setI4] = useState(5);
  const [r4, setR4] = useState(0.05);
  const targetB4 = 0.02;
  const B4 = (MU0 * I4) / (2 * Math.PI * r4);
  const ok4 = Math.abs(B4 - targetB4) / targetB4 < 0.05;

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-16">
      <div>
        <h1 className="text-2xl font-extrabold text-white">🏆 حالت چالش (Challenge Mode)</h1>
        <p className="mt-1 text-sm text-slate-400">
          در این بخش به‌جای تماشای شبیه‌سازی، خودت باید پارامترها را طوری تنظیم کنی که یک هدف مشخص محقق شود. این یعنی به‌کارگیری معکوسِ رابطهٔ ریاضی برای حل یک مسئلهٔ واقعی.
        </p>
      </div>

      <ChallengeCard
        title="چالش ۱: طراحی میدان الکتریکی هدف"
        mission="می‌خواهیم در فاصلهٔ ۲ متری از یک بار نقطه‌ای، شدت میدان الکتریکی دقیقاً ۱۰۰ نیوتن بر کولن باشد. مقدار بار q را پیدا کن."
        checkOk={ok1}
        successMsg={`دقیقاً درست است! با q=${fmt(q1, 3)}nC مقدار E=${fmt(E1, 3)}N/C به‌دست می‌آید.`}
        failMsg={`مقدار فعلی E=${fmt(E1, 3)}N/C است، هدف ۱۰۰ N/C است. q را تنظیم کن.`}
        hint="از رابطهٔ معکوس E=kq/r² استفاده کن: q = E·r²/k."
      >
        <Slider label="بار q" value={q1} min={1} max={60} step={0.5} unit="nC" onChange={setQ1} color="rose" />
        <p className="text-xs text-slate-400">E فعلی در r=2m: <span className="tabular font-bold text-sky-300">{fmt(E1, 3)} N/C</span> (هدف: 100 N/C)</p>
      </ChallengeCard>

      <ChallengeCard
        title="چالش ۲: شعاع مسیر الکترون"
        mission="یک الکترون با سرعت v=2×10⁶ m/s عمود بر میدان مغناطیسی وارد می‌شود. مقدار B را طوری تنظیم کن که شعاع مسیر دایره‌ای آن دقیقاً ۱۰ سانتی‌متر شود."
        checkOk={ok2}
        successMsg={`عالی! با B=${fmt(B2, 3)}T مقدار r=${fmt(r2 * 100, 3)}cm به‌دست می‌آید.`}
        failMsg={`مقدار فعلی r=${fmt(r2 * 100, 3)}cm است، هدف ۱۰ cm است.`}
        hint="از رابطهٔ r=mv/(qB) استفاده کن: B = mv/(q·r)."
      >
        <Slider label="میدان B" value={B2} min={0.02} max={1} step={0.01} unit="T" onChange={setB2} color="sky" />
        <p className="text-xs text-slate-400">r فعلی: <span className="tabular font-bold text-sky-300">{fmt(r2 * 100, 3)} cm</span> (هدف: 10 cm)</p>
      </ChallengeCard>

      <ChallengeCard
        title="چالش ۳: طراحی طول آنتن"
        mission="برای فرستندهٔ رادیویی با فرکانس ۳۰۰ مگاهرتز، طول مناسب یک آنتن دوقطبی نیم‌موج (Half-Wave Dipole) را پیدا کن."
        checkOk={ok3}
        successMsg={`دقیقاً درست! طول ایدئال λ/2 = ${fmt(idealL3, 3)} m است.`}
        failMsg={`طول فعلی L=${fmt(L3, 3)}m است؛ طول ایدئال ${fmt(idealL3, 3)}m است.`}
        hint="ابتدا λ=c/f را حساب کن، سپس L≈λ/2."
      >
        <Slider label="طول آنتن L" value={L3} min={0.05} max={1.2} step={0.01} unit="m" onChange={setL3} color="amber" />
      </ChallengeCard>

      <ChallengeCard
        title="چالش ۴: میدان مغناطیسی سیم"
        mission="با یک سیم حامل جریان، در فاصلهٔ ۵ سانتی‌متری از آن، میدان مغناطیسی ۰.۰۲ تسلا ایجاد کن. جریان I و فاصله r را با هم تنظیم کن (r ثابت است، فقط I را تغییر بده)."
        checkOk={ok4}
        successMsg={`آفرین! با I=${fmt(I4, 3)}A مقدار B=${fmt(B4, 3)}T به‌دست می‌آید.`}
        failMsg={`مقدار فعلی B=${fmt(B4, 3)}T است، هدف ۰.۰۲T است.`}
        hint="از B=μ₀I/(2πr) استفاده کن: I = 2πrB/μ₀."
      >
        <Slider label="جریان I" value={I4} min={0.5} max={30} step={0.5} unit="A" onChange={setI4} color="rose" />
        <Slider label="فاصله r (فقط برای مشاهده)" value={r4} min={0.02} max={0.2} step={0.005} unit="m" onChange={setR4} color="cyan" />
      </ChallengeCard>
    </div>
  );
}
