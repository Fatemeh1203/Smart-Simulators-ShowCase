import { LABS } from "../data/labsMeta";

interface Node {
  label: string;
  labId: string;
}

function Branch({ title, nodes, onNavigate, color }: { title: string; nodes: Node[]; onNavigate: (id: string) => void; color: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5">
      <h4 className={`mb-1 text-xs font-extrabold ${color}`}>{title}</h4>
      {nodes.map((n, i) => (
        <div key={n.label} className="flex flex-col items-center">
          <button
            onClick={() => onNavigate(n.labId)}
            className="w-40 rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-center text-xs font-bold text-slate-100 shadow transition hover:-translate-y-0.5 hover:border-sky-400 hover:bg-slate-700"
          >
            {n.label}
          </button>
          {i < nodes.length - 1 && <span className="text-slate-500">↓</span>}
        </div>
      ))}
    </div>
  );
}

export function ConceptMap({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5">
      <h3 className="mb-1 text-lg font-extrabold text-white">🗺️ نقشهٔ مفهومی الکترومغناطیس</h3>
      <p className="mb-5 text-xs text-slate-400">روی هر جعبه کلیک کن تا مستقیماً وارد آزمایشگاه مرتبط با آن مفهوم شوی.</p>
      <div className="flex flex-col gap-6 sm:flex-row">
        <Branch
          color="text-rose-300"
          title="بار الکتریکی"
          onNavigate={onNavigate}
          nodes={[
            { label: "Charge — بار", labId: "efield" },
            { label: "Electric Field — میدان E", labId: "efield" },
            { label: "Force — نیرو", labId: "force" },
            { label: "Potential / Energy — پتانسیل و انرژی", labId: "potential" },
          ]}
        />
        <Branch
          color="text-sky-300"
          title="جریان الکتریکی"
          onNavigate={onNavigate}
          nodes={[
            { label: "Current — جریان", labId: "circuit" },
            { label: "Magnetic Field — میدان B", labId: "bfield" },
            { label: "Magnetic Force — نیروی مغناطیسی", labId: "magforce" },
          ]}
        />
        <Branch
          color="text-amber-300"
          title="القای الکترومغناطیسی"
          onNavigate={onNavigate}
          nodes={[
            { label: "Changing Flux — تغییر شار", labId: "induction" },
            { label: "Induced EMF — ولتاژ القایی", labId: "induction" },
            { label: "Current — جریان القایی", labId: "circuit" },
          ]}
        />
        <Branch
          color="text-fuchsia-300"
          title="امواج و تشعشع"
          onNavigate={onNavigate}
          nodes={[
            { label: "Changing E & B — میدان‌های متغیر", labId: "waves" },
            { label: "EM Waves — امواج", labId: "waves" },
            { label: "Antenna — آنتن", labId: "antenna" },
            { label: "Radiation → Receiver — گیرنده", labId: "antenna" },
          ]}
        />
      </div>
      <p className="mt-5 text-center text-[11px] text-slate-500">
        همهٔ این چهار مسیر در واقع یک داستان واحدند: بار ⟶ میدان ⟶ نیرو/انرژی، و جریان ⟶ میدان مغناطیسی ⟶ نیرو، و تغییر یکی از میدان‌ها ⟶ ایجاد دیگری ⟶ در نهایت موج و تشعشع.
      </p>
    </div>
  );
}

export function labCount() {
  return LABS.length;
}
