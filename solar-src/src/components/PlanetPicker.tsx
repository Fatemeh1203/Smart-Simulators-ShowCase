import { PLANETS } from "../data/planets";
import { cn } from "../utils/cn";

interface Props {
  value: string | null;
  onChange: (id: string) => void;
  exclude?: string[];
  small?: boolean;
}

export default function PlanetPicker({ value, onChange, exclude = [], small }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PLANETS.filter((p) => !exclude.includes(p.id)).map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          className={cn(
            "rounded-xl font-bold border transition-all flex items-center gap-1",
            small ? "px-2 py-1 text-xs" : "px-2.5 py-1.5 text-sm",
            value === p.id ? "bg-white text-slate-900 border-white scale-105 shadow-lg" : "bg-white/10 border-white/10 hover:bg-white/20"
          )}
          style={value === p.id ? {} : { borderColor: p.color + "66" }}
        >
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: p.color }} />
          {p.name}
        </button>
      ))}
    </div>
  );
}
