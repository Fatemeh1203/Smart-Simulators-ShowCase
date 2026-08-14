// SVG schematic diagrams of the laboratory setups (one per phase)
import type { ReactNode } from "react";

const W = 760;
const H = 230;

function Box({
  x,
  y,
  w,
  h,
  fill,
  stroke,
  children,
  label,
  sub,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  stroke: string;
  children?: ReactNode;
  label: string;
  sub?: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
      />
      {children}
      <text
        x={x + w / 2}
        y={y + h / 2 + (sub ? -4 : 5)}
        textAnchor="middle"
        fontSize={12}
        fontWeight={700}
        fill="#e2e8f0"
      >
        {label}
      </text>
      {sub && (
        <text
          x={x + w / 2}
          y={y + h / 2 + 13}
          textAnchor="middle"
          fontSize={9}
          fill="#94a3b8"
        >
          {sub}
        </text>
      )}
    </g>
  );
}

function Coil({
  x,
  y,
  r = 30,
  label,
}: {
  x: number;
  y: number;
  r?: number;
  label: string;
}) {
  const coils = [];
  for (let i = 0; i < 6; i++) {
    coils.push(
      <ellipse
        key={i}
        cx={x + i * 4 - 10}
        cy={y}
        rx={5}
        ry={r}
        fill="none"
        stroke="#fb7185"
        strokeWidth={1.6}
        opacity={0.85}
      />
    );
  }
  return (
    <g>
      {coils}
      <text
        x={x}
        y={y + r + 14}
        textAnchor="middle"
        fontSize={10}
        fill="#fda4af"
      >
        {label}
      </text>
    </g>
  );
}

function Wire({
  d,
  color = "#22d3ee",
}: {
  d: string;
  color?: string;
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
    />
  );
}

// -----------------------------------------------------------
//  PHASE 1 setup
// -----------------------------------------------------------
export function SchematicP1({ fieldOn }: { fieldOn: boolean }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* fiber baseline */}
      <Wire d="M40 120 H720" color={fieldOn ? "#f472b6" : "#38bdf8"} />
      {/* laser */}
      <Box
        x={20}
        y={100}
        w={64}
        h={40}
        fill="#0b3b4a"
        stroke="#22d3ee"
        label="لیزر"
        sub="830 nm"
      />
      {/* polarizer */}
      <Box
        x={104}
        y={100}
        w={50}
        h={40}
        fill="#1e293b"
        stroke="#94a3b8"
        label="قطبشگر"
      />
      {/* mode filter */}
      <Box
        x={170}
        y={100}
        w={58}
        h={40}
        fill="#1e293b"
        stroke="#94a3b8"
        label="فیلتر مد"
      />
      {/* two-mode fiber + microbend */}
      <Box
        x={250}
        y={92}
        w={300}
        h={56}
        fill="#10172a"
        stroke="#818cf8"
        label="فیبر دو‌مدی (TMF)"
        sub="LP₀₁ / LP₁₁"
      />
      {/* microbend teeth */}
      <g>
        {Array.from({ length: 16 }).map((_, i) => (
          <g key={i}>
            <rect
              x={262 + i * 17}
              y={84}
              width={9}
              height={12}
              fill="#f59e0b"
            />
            <rect
              x={262 + i * 17}
              y={148}
              width={9}
              height={12}
              fill="#f59e0b"
            />
          </g>
        ))}
      </g>
      <text x={400} y={174} textAnchor="middle" fontSize={9} fill="#fbbf24">
        میکروخمش Λ≈0.4 mm
      </text>
      {/* Helmholtz / solenoid */}
      <Coil x={350} y={120} r={46} label="سیم‌پیچ (میدان)" />
      {fieldOn && (
        <text x={350} y={68} textAnchor="middle" fontSize={10} fill="#fb7185">
          B ON
        </text>
      )}
      {/* detector */}
      <Box
        x={572}
        y={100}
        w={58}
        h={40}
        fill="#3b2a0b"
        stroke="#f59e0b"
        label="آشکارساز"
      />
      {/* oscilloscope */}
      <Box
        x={650}
        y={86}
        w={70}
        h={66}
        fill="#0b2e3b"
        stroke="#22d3ee"
        label="اسیلوسکوپ"
      />
      <Wire d={`M602 120 H650`} />
      <Wire d={`M685 152 V188 H560 V190`} color="#64748b" />
    </svg>
  );
}

// -----------------------------------------------------------
//  PHASE 2 setup
// -----------------------------------------------------------
export function SchematicP2({ fieldOn }: { fieldOn: boolean }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <Wire d="M40 120 H720" color={fieldOn ? "#f472b6" : "#38bdf8"} />
      <Box
        x={18}
        y={100}
        w={66}
        h={40}
        fill="#0b3b4a"
        stroke="#22d3ee"
        label="منبع پهن‌باند"
        sub="SLED"
      />
      {/* SMF */}
      <Box x={100} y={110} w={96} h={20} fill="#10172a" stroke="#38bdf8" label="" />
      <text x={148} y={150} textAnchor="middle" fontSize={9} fill="#7dd3fc">
        SMF-28 (2 m)
      </text>
      {/* MMF */}
      <Box x={206} y={108} w={300} h={24} fill="#172554" stroke="#818cf8" label="" />
      <text x={356} y={150} textAnchor="middle" fontSize={9} fill="#a5b4fc">
        MMF 62.5/125 (8–10 cm)
      </text>
      <Coil x={356} y={120} r={50} label="زوج هلمهولتز" />
      {fieldOn && (
        <text x={356} y={60} textAnchor="middle" fontSize={10} fill="#fb7185">
          B = 24·I mT  (ON)
        </text>
      )}
      {/* SMF out */}
      <Box x={516} y={110} w={96} h={20} fill="#10172a" stroke="#38bdf8" label="" />
      <text x={564} y={150} textAnchor="middle" fontSize={9} fill="#7dd3fc">
        SMF-28 (2 m)
      </text>
      {/* OSA */}
      <Box x={632} y={92} w={86} h={56} fill="#0b2e3b" stroke="#22d3ee" label="OSA" sub="طیف‌سنج" />
      <Wire d={`M612 120 H632`} />
    </svg>
  );
}

// -----------------------------------------------------------
//  PHASE 3 setup
// -----------------------------------------------------------
export function SchematicP3({ fieldOn }: { fieldOn: boolean }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <Wire d="M40 120 H720" color={fieldOn ? "#f472b6" : "#38bdf8"} />
      <Box
        x={18}
        y={100}
        w={66}
        h={40}
        fill="#0b3b4a"
        stroke="#22d3ee"
        label="منبع پهن‌باند"
        sub="SLED"
      />
      <Box x={100} y={110} w={80} h={20} fill="#10172a" stroke="#38bdf8" label="" />
      <text x={140} y={150} textAnchor="middle" fontSize={9} fill="#7dd3fc">
        SMF
      </text>
      {/* MMF with microbend + ferrofluid */}
      <Box x={190} y={108} w={330} h={24} fill="#172554" stroke="#818cf8" label="" />
      <text x={355} y={166} textAnchor="middle" fontSize={9} fill="#a5b4fc">
        MMF + دندانه پلیمری + نانوذره
      </text>
      {/* polymer teeth + ferrofluid droplets */}
      <g>
        {Array.from({ length: 18 }).map((_, i) => (
          <g key={i}>
            <rect x={200 + i * 17} y={84} width={10} height={12} fill="#34d399" />
            <rect x={200 + i * 17} y={148} width={10} height={12} fill="#34d399" />
            <circle cx={205 + i * 17} cy={130} r={2.2} fill="#ef4444" />
          </g>
        ))}
      </g>
      <Coil x={355} y={120} r={52} label="زوج هلمهولتز" />
      {fieldOn && (
        <text x={355} y={58} textAnchor="middle" fontSize={10} fill="#fb7185">
          نانوذرات: زنجیره مغناطیسی + فشار (ON)
        </text>
      )}
      <Box x={530} y={110} w={80} h={20} fill="#10172a" stroke="#38bdf8" label="" />
      <text x={570} y={150} textAnchor="middle" fontSize={9} fill="#7dd3fc">
        SMF
      </text>
      <Box x={624} y={92} w={94} h={56} fill="#0b2e3b" stroke="#22d3ee" label="OSA" sub="طیف‌سنج" />
      <Wire d={`M610 120 H624`} />
    </svg>
  );
}
