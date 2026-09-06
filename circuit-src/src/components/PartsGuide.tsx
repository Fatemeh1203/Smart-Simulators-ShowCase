import { useState } from "react";
import { PartInfo, partsInfo } from "../data/parts";
import { Modal } from "./Modal";

function Demo({ kind }: { kind: PartInfo["kind"] }) {
  const common = { stroke: "#475569", strokeWidth: 5, strokeLinecap: "round" as const, fill: "none" };
  return (
    <svg viewBox="-120 -70 240 140" className="w-full max-w-sm mx-auto" style={{ height: 180 }}>
      {kind === "battery" && (
        <g>
          <rect x={-40} y={-20} width={80} height={40} rx={8} fill="#fdba74" stroke="#ea580c" strokeWidth={3} />
          <rect x={-40} y={-20} width={18} height={40} rx={8} fill="#ea580c" />
          <text x={-31} y={6} textAnchor="middle" fontSize={18} fontWeight={900} fill="#fff">+</text>
          <text x={28} y={7} textAnchor="middle" fontSize={22} fontWeight={900} fill="#ea580c">−</text>
          <line x1={-100} y1={0} x2={-42} y2={0} {...common} />
          <line x1={42} y1={0} x2={100} y2={0} {...common} />
          {[0, 1, 2].map((i) => (
            <text key={i} className="demo-battery" x={-95} y={-30} fontSize={20} style={{ animationDelay: `${i * 0.45}s` }}>⚡</text>
          ))}
          <text x={0} y={52} textAnchor="middle" fontSize={13} fontWeight={800} fill="#9a3412">انرژی را در مدار هُل می‌دهد</text>
        </g>
      )}
      {kind === "bulb" && (
        <g>
          <line x1={-100} y1={30} x2={-20} y2={30} {...common} />
          <line x1={20} y1={30} x2={100} y2={30} {...common} />
          <circle cx={0} cy={-10} r={60} fill="#fde047" opacity={0.35} className="demo-bulb" />
          <circle cx={0} cy={-10} r={30} fill="#fef08a" stroke="#eab308" strokeWidth={3} />
          <circle cx={0} cy={-10} r={30} fill="#fde047" className="demo-bulb" />
          <rect x={-18} y={14} width={36} height={20} rx={4} fill="#94a3b8" stroke="#475569" strokeWidth={2} />
          <polyline points="-10,10 -10,-10 -5,-20 0,-8 5,-20 10,-10 10,10" fill="none" stroke="#f97316" strokeWidth={3} />
          <path d="M-100 30 L100 30" className="demo-flow" stroke="#fff59d" strokeWidth={6} fill="none" />
          <text x={0} y={58} textAnchor="middle" fontSize={13} fontWeight={800} fill="#854d0e">جریان می‌آید → لامپ روشن می‌شود</text>
        </g>
      )}
      {kind === "switch" && (
        <g>
          <line x1={-100} y1={0} x2={-30} y2={0} {...common} />
          <line x1={30} y1={0} x2={100} y2={0} {...common} />
          <circle cx={-22} cy={0} r={6} fill="#475569" />
          <circle cx={22} cy={0} r={6} fill="#475569" />
          <g className="demo-switch">
            <line x1={-22} y1={0} x2={26} y2={0} stroke="#16a34a" strokeWidth={7} strokeLinecap="round" />
            <circle cx={26} cy={0} r={7} fill="#22c55e" stroke="#fff" strokeWidth={2} />
          </g>
          <g className="demo-bulb">
            <path d="M-100 0 L100 0" className="demo-flow" stroke="#fff59d" strokeWidth={6} fill="none" />
          </g>
          <text x={0} y={-40} textAnchor="middle" fontSize={13} fontWeight={800} fill="#166534">بسته 🟢 = جریان می‌گذرد</text>
          <text x={0} y={50} textAnchor="middle" fontSize={13} fontWeight={800} fill="#991b1b">باز 🔴 = جریان قطع می‌شود</text>
        </g>
      )}
      {kind === "wire" && (
        <g>
          <path d="M-100 20 C -50 -60, 50 60, 100 -20" stroke="#c2410c" strokeWidth={11} fill="none" strokeLinecap="round" />
          <path d="M-100 20 C -50 -60, 50 60, 100 -20" stroke="#fb923c" strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M-100 20 C -50 -60, 50 60, 100 -20" className="demo-flow" stroke="#fff59d" strokeWidth={7} fill="none" />
          <text x={0} y={55} textAnchor="middle" fontSize={13} fontWeight={800} fill="#1e40af">جاده‌ای برای عبور جریان</text>
        </g>
      )}
      {kind === "resistor" && (
        <g>
          <line x1={-100} y1={0} x2={-45} y2={0} {...common} />
          <line x1={45} y1={0} x2={100} y2={0} {...common} />
          <rect x={-45} y={-18} width={90} height={36} rx={12} fill="#fde68a" stroke="#b45309" strokeWidth={3} />
          <rect x={-25} y={-18} width={14} height={36} fill="#ef4444" />
          <rect x={-7} y={-18} width={14} height={36} fill="#ef4444" />
          <rect x={11} y={-18} width={14} height={36} fill="#ef4444" />
          <path d="M-100 0 L-45 0" className="demo-flow" stroke="#fff59d" strokeWidth={7} fill="none" />
          <path d="M-45 0 L45 0" className="demo-flow slow" stroke="#fff59d" strokeWidth={7} fill="none" />
          <path d="M45 0 L100 0" className="demo-flow slow" stroke="#fff59d" strokeWidth={7} fill="none" />
          <text x={0} y={52} textAnchor="middle" fontSize={13} fontWeight={800} fill="#6b21a8">جریان اینجا سخت‌تر رد می‌شود</text>
        </g>
      )}
    </svg>
  );
}

export default function PartsGuide() {
  const [open, setOpen] = useState<PartInfo | null>(null);
  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-5xl mx-auto p-2 md:p-4">
        <div className="text-center mb-4">
          <h2 className="text-2xl md:text-3xl font-black text-sky-800">📚 قطعات را بشناس</h2>
          <p className="text-slate-600 text-sm md:text-base mt-1">روی هر قطعه بزن تا ببینی چطور کار می‌کند.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {partsInfo.map((p) => (
            <button
              key={p.kind}
              onClick={() => setOpen(p)}
              className={`rounded-3xl bg-gradient-to-br ${p.color} border-4 border-white shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all p-4 text-center`}
            >
              <div className="text-6xl mb-2 float-y">{p.emoji}</div>
              <div className="font-black text-xl text-slate-800">{p.name}</div>
              <div className="text-sm text-slate-700 mt-1 leading-snug">«{p.short}»</div>
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-3xl bg-white border-4 border-sky-200 p-4 md:p-6 shadow">
          <h3 className="font-black text-lg text-sky-800 mb-2">💬 جملهٔ طلایی</h3>
          <p className="text-base md:text-xl font-black text-slate-800 leading-relaxed text-center bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4">
            «برای روشن شدن لامپ باید یک مسیرِ کامل برای عبور جریان داشته باشیم.»
          </p>
          <div className="grid md:grid-cols-6 gap-2 mt-4 text-center text-xs md:text-sm font-black">
            {["🤔 حدس بزن", "🧩 قطعات را بچین", "〰️ سیم‌کشی کن", "🧪 آزمایش کن", "👀 نتیجه را ببین", "🔁 دوباره تغییر بده"].map((s, i) => (
              <div key={i} className="rounded-xl bg-sky-50 border-2 border-sky-200 p-2 text-sky-900">
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      {open && (
        <Modal onClose={() => setOpen(null)}>
          <div className="text-center">
            <div className="text-6xl mb-1">{open.emoji}</div>
            <h3 className="text-2xl font-black text-slate-800">{open.name}</h3>
            <p className="text-base font-black text-sky-800 mt-1">«{open.short}»</p>
            <div className="my-3 rounded-2xl bg-slate-50 border-2 border-slate-200">
              <Demo kind={open.kind} />
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{open.detail}</p>
            <button onClick={() => setOpen(null)} className="mt-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black px-8 py-2 text-base">
              فهمیدم! 👍
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
