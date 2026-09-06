import type { Organism } from "../genetics/data";
import { isDominantExpressed, type Genotype } from "../genetics/engine";

interface Props {
  organism: Organism;
  genotype: Genotype; // full genotype (all traits); traits not active fall back to defaults
  activeTraitIds: string[];
  size?: number;
  className?: string;
}

/** Resolve the phenotype flags/colors for all 4 trait slots. Inactive traits use the dominant look. */
function resolve(organism: Organism, genotype: Genotype, active: string[]) {
  const out: Record<string, { dom: boolean; color: string; active: boolean }> = {};
  for (const t of organism.traits) {
    const g = genotype[t.id];
    const isActive = active.includes(t.id);
    const dom = isActive ? isDominantExpressed(g) : true;
    out[t.id] = { dom, color: dom ? t.dominant.color : t.recessive.color, active: isActive };
  }
  return out;
}

export default function Avatar({ organism, genotype, activeTraitIds, size = 120, className = "" }: Props) {
  const p = resolve(organism, genotype, activeTraitIds);
  const color = p.color;
  const height = p.height;
  const leaf = p.leaf;
  const seed = p.seed;

  if (organism.id === "flower" || organism.id === "pea") {
    const stemH = height.dom ? 70 : 38;
    const top = 110 - stemH;
    const petal = color.color;
    const isPea = organism.id === "pea";
    const leafColor = isPea ? "#16a34a" : leaf.color;
    return (
      <svg viewBox="0 0 120 130" width={size} height={size * 1.08} className={className}>
        <ellipse cx="60" cy="118" rx="34" ry="6" fill="#d6d3d1" opacity="0.6" />
        <g className="sway">
          <rect x="57" y={top} width="6" height={stemH + 8} rx="3" fill="#15803d" />
          <ellipse cx="44" cy={top + stemH * 0.55} rx="14" ry="6" fill={leafColor} transform={`rotate(-25 44 ${top + stemH * 0.55})`} />
          <ellipse cx="76" cy={top + stemH * 0.35} rx="14" ry="6" fill={leafColor} transform={`rotate(25 76 ${top + stemH * 0.35})`} />
          {isPea ? (
            <g>
              <path d={`M 60 ${top + 4} c -22 0 -22 30 0 32 c 22 -2 22 -32 0 -32 z`} fill={petal} stroke="#334155" strokeWidth="1.5" />
              <path d={`M 60 ${top + 4} c -12 6 -12 22 0 30`} fill="none" stroke="#33415588" strokeWidth="1.5" />
              <circle cx="60" cy={top + 20} r="4" fill="#fde047" />
            </g>
          ) : (
            <g>
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <ellipse key={deg} cx="60" cy={top - 8} rx="8" ry="15" fill={petal} stroke="#33415566" strokeWidth="1" transform={`rotate(${deg} 60 ${top + 6})`} />
              ))}
              <circle cx="60" cy={top + 6} r="8" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
            </g>
          )}
        </g>
        {/* seeds */}
        {[0, 1, 2].map((i) => {
          const x = 30 + i * 14;
          const seedColor = isPea ? leaf.color : seed.color;
          const fill = isPea ? (leaf.active ? seedColor : "#eab308") : seed.dom ? "#b45309" : "#92400e";
          return seed.dom ? (
            <circle key={i} cx={x} cy="122" r="5" fill={fill} stroke="#57534e" strokeWidth="1" />
          ) : (
            <path key={i} d={`M ${x - 5} 122 q 2 -6 5 -3 q 3 -4 5 2 q -2 6 -5 3 q -3 4 -5 -2 z`} fill={fill} stroke="#57534e" strokeWidth="1" />
          );
        })}
      </svg>
    );
  }

  if (organism.id === "rabbit") {
    const fur = color.color;
    const scale = height.dom ? 1 : 0.8;
    const earH = leaf.dom ? 34 : 16;
    const eye = seed.color;
    return (
      <svg viewBox="0 0 120 130" width={size} height={size * 1.08} className={className}>
        <ellipse cx="60" cy="120" rx="36" ry="6" fill="#d6d3d1" opacity="0.6" />
        <g transform={`translate(60 118) scale(${scale}) translate(-60 -118)`}>
          <ellipse cx="60" cy="96" rx="30" ry="24" fill={fur} stroke="#475569" strokeWidth="1.5" />
          <ellipse cx="46" cy={54 - earH / 2} rx="7" ry={earH / 2 + 6} fill={fur} stroke="#475569" strokeWidth="1.5" />
          <ellipse cx="74" cy={54 - earH / 2} rx="7" ry={earH / 2 + 6} fill={fur} stroke="#475569" strokeWidth="1.5" />
          <ellipse cx="46" cy={54 - earH / 2} rx="3" ry={earH / 2} fill="#fda4af" />
          <ellipse cx="74" cy={54 - earH / 2} rx="3" ry={earH / 2} fill="#fda4af" />
          <circle cx="60" cy="66" r="20" fill={fur} stroke="#475569" strokeWidth="1.5" />
          <circle cx="52" cy="63" r="3.5" fill={eye} />
          <circle cx="68" cy="63" r="3.5" fill={eye} />
          <circle cx="53" cy="62" r="1" fill="#fff" />
          <circle cx="69" cy="62" r="1" fill="#fff" />
          <ellipse cx="60" cy="72" rx="3" ry="2" fill="#f472b6" />
          <path d="M 57 75 q 3 3 6 0" stroke="#475569" strokeWidth="1.2" fill="none" />
          <circle cx="86" cy="100" r="6" fill="#fff" stroke="#475569" strokeWidth="1" />
        </g>
      </svg>
    );
  }

  // creature
  const body = color.color;
  const horns = height.dom;
  const wings = leaf.dom;
  const spots = seed.dom;
  return (
    <svg viewBox="0 0 120 130" width={size} height={size * 1.08} className={className}>
      <ellipse cx="60" cy="120" rx="34" ry="6" fill="#d6d3d1" opacity="0.6" />
      {wings && (
        <g>
          <path d="M 32 80 q -28 -20 -14 -44 q 10 20 20 30 z" fill="#a5f3fc" stroke="#0e7490" strokeWidth="1.5" />
          <path d="M 88 80 q 28 -20 14 -44 q -10 20 -20 30 z" fill="#a5f3fc" stroke="#0e7490" strokeWidth="1.5" />
        </g>
      )}
      {horns && (
        <g>
          <path d="M 44 46 l -8 -22 l 14 14 z" fill="#c4b5fd" stroke="#6d28d9" strokeWidth="1.5" />
          <path d="M 76 46 l 8 -22 l -14 14 z" fill="#c4b5fd" stroke="#6d28d9" strokeWidth="1.5" />
        </g>
      )}
      <path d="M 60 40 c 30 0 36 30 32 56 c -3 18 -61 18 -64 0 c -4 -26 2 -56 32 -56 z" fill={body} stroke="#1e293b" strokeWidth="1.5" />
      {spots && (
        <g fill="#fbcfe8" stroke="#be185d" strokeWidth="1">
          <circle cx="44" cy="90" r="5" />
          <circle cx="72" cy="98" r="4" />
          <circle cx="60" cy="80" r="3" />
          <circle cx="80" cy="76" r="3.5" />
        </g>
      )}
      <circle cx="50" cy="64" r="7" fill="#fff" stroke="#1e293b" strokeWidth="1" />
      <circle cx="70" cy="64" r="7" fill="#fff" stroke="#1e293b" strokeWidth="1" />
      <circle cx="51" cy="65" r="3" fill="#1e293b" />
      <circle cx="71" cy="65" r="3" fill="#1e293b" />
      <path d="M 50 84 q 10 8 20 0" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
