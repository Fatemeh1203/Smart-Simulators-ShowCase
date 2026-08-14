import { useMemo, useState } from "react";
import Plot, { type PlotlyData, type PlotlyLayout } from "../Plot";
import {
  Card,
  Slider,
  FieldToggle,
  Stat,
  Analysis,
  Refs,
  ControlPanel,
} from "../ui";
import { Heatmap2D, Surface3D } from "../FieldViews";
import { SchematicP1 } from "../Schematics";
import * as P1 from "../../lib/physics1";
import { linspace, deg, verdetSilica, coilB } from "../../lib/core";

const NO = "#22d3ee";
const FLD = "#fb7185";
const axisGrid = { gridcolor: "#1e293b", zerolinecolor: "#334155" };
const baseLayout = (extra: Partial<PlotlyLayout> = {}): PlotlyLayout => ({
  xaxis: { gridcolor: "#1e293b", ...((extra.xaxis as object) || {}) },
  yaxis: { gridcolor: "#1e293b", ...((extra.yaxis as object) || {}) },
  ...extra,
});

export default function Phase1() {
  const [p, setP] = useState<P1.P1Params>(P1.P1_DEFAULT);
  const [fieldOn, setFieldOn] = useState(true);
  const set = (k: keyof P1.P1Params, v: number) =>
    setP((s) => ({ ...s, [k]: v }));

  const pNo = useMemo(() => ({ ...p, I_A: 0 }), [p]);

  const data = useMemo(() => {
    const V = P1.vNumber(p);
    const mp = P1.modeParams(p);
    const B = coilB(p.I_A, p.kB);
    const theta = P1.faradayRotation(p);
    const sens = P1.sensitivityTheta(p);
    const k = P1.couplingCoeff(p);
    const zRange = Math.max(0.9, p.L_m * 1.5);
    const z = linspace(0, zRange, 260);
    const mpNo = P1.modePowerVsZ(pNo, z);
    const mpF = P1.modePowerVsZ(p, z);
    // mode fields
    const gridNoLP11 = P1.modeFieldGrid(pNo, 0);
    const gridFLP11 = P1.modeFieldGrid(p, theta);
    // mode indices with field (R/L circular split)
    const mIdx = P1.modeIndicesWithField(p);
    // spectra
    const lam = linspace(815, 845, 360);
    const specNo = P1.tmodeSpectrum(pNo, lam);
    const specF = P1.tmodeSpectrum(p, lam);
    // phase matching
    const lamB = linspace(100, 700, 300);
    const pmNo = P1.phaseMatchVsLambda(pNo, lamB);
    const pmF = P1.phaseMatchVsLambda(p, lamB);
    // faraday vs current (silica / Tb / PM)
    const Iarr = linspace(0, 150, 121);
    const L = p.L_m;
    const thSilica = Iarr.map((i) => deg(verdetSilica(p.lambdaNm) * coilB(i, p.kB) * L));
    const thTb = Iarr.map((i) => deg(24 * coilB(i, p.kB) * L));
    const thPM = Iarr.map((i) => deg(0.6 * coilB(i, p.kB) * L));
    // circular birefringence (n_R − n_L) vs current
    const dncVsI = Iarr.map((i) => P1.circularBirefringence({ ...p, I_A: i }) * 1e6);
    // Verdet-constant analysis: rotation vs current for several materials
    const verdetTheta = P1.VERDET_MATERIALS.map((m) => ({
      ...m,
      y: Iarr.map((i) => deg(m.V * coilB(i, p.kB) * L)),
    }));
    // amplification by coiling N turns around the conductor (θ = N·V·μ₀·I)
    const Narr = linspace(0, 1000, 51);
    const turnsSilica = Narr.map((n) => deg(P1.coiledFaraday(2.05, n, p.I_A)));
    const turnsTb = Narr.map((n) => deg(P1.coiledFaraday(24, n, p.I_A)));
    const turnsTGG = Narr.map((n) => deg(P1.coiledFaraday(78, n, p.I_A)));
    // analyzer observable output for plain silica (45° analyzer)
    const anaT = Iarr.map((i) => {
      const th = verdetSilica(p.lambdaNm) * coilB(i, p.kB) * L;
      return 50 + 50 * Math.sin(2 * th);
    });
    // sensitivity vs length
    const Larr = linspace(0.05, 1.0, 40);
    const sensL = Larr.map((Lm) => verdetSilica(p.lambdaNm) * p.kB * Lm * 1000);
    // longitudinal vs transverse (theta vs I, and CM retardance)
    const trCM = Iarr.map((i) => deg(P1.K_COTTON_MOUTON_SILICA * coilB(i, p.kB) ** 2 * L * 2 * Math.PI)); // tiny
    // magnetic field profile along fiber (solenoid-like, uniform mid, edge fall-off)
    const zf = linspace(-1.2 * L, 2.2 * L, 160);
    const Bprofile = zf.map((zz) => {
      const a = L * 0.6; // coil half-length
      const u = (zz - 0.5 * L);
      return B * 0.5 * (Math.tanh(8 * (u + a) / L) - Math.tanh(8 * (u - a) / L));
    });
    const thetaCum = zf.map((_, j) => deg(verdetSilica(p.lambdaNm) * B * (zf[j] - zf[0]) * 1));
    // polarization helix 3D
    const zh = linspace(0, L, 120);
    const helixField: PlotlyData = {
      type: "scatter3d",
      mode: "lines",
      x: zh.map((zv) => zv * 1000),
      y: zh.map((zv) => Math.cos(verdetSilica(p.lambdaNm) * B * zv)),
      z: zh.map((zv) => Math.sin(verdetSilica(p.lambdaNm) * B * zv)),
      line: { color: FLD, width: 5 },
      name: "با میدان",
    };
    const helixNo: PlotlyData = {
      type: "scatter3d",
      mode: "lines",
      x: zh.map((zv) => zv * 1000),
      y: zh.map(() => 1),
      z: zh.map(() => 0),
      line: { color: NO, width: 3, dash: "dash" },
      name: "بدون میدان",
    };
    return {
      V, mp, B, theta, sens, k, z, mpNo, mpF,
      gridNoLP11, gridFLP11, lam, specNo, specF,
      lamB, pmNo, pmF, Iarr, thSilica, thTb, thPM, dncVsI,
      verdetTheta, Narr, turnsSilica, turnsTb, turnsTGG, anaT,
      Larr, sensL, trCM, zf, Bprofile, thetaCum,
      helixField, helixNo, mIdx,
    };
  }, [p, pNo]);

  const {
    V, mp, B, theta, sens, k, z, mpNo, mpF,
    gridNoLP11, gridFLP11, lam, specNo, specF,
    lamB, pmNo, pmF, Iarr, thSilica, thTb, thPM, dncVsI,
    verdetTheta, Narr, turnsSilica, turnsTb, turnsTGG, anaT,
    Larr, sensL, trCM, zf, Bprofile, thetaCum,
    helixField, helixNo, mIdx,
  } = data;

  const thetaDeg = deg(theta);
  const dnMO = (verdetSilica(p.lambdaNm) * B * p.lambdaNm * 1e-9) / Math.PI;

  return (
    <div className="space-y-5">
      <Card
        title="فاز ۱ — حسگر جریان مبتنی بر اثر فارادی + میکروخمش در فیبر دو‌مدی"
        subtitle="لیزر ۸۳۰ nm ← قطبشگر ← فیلتر مد ← فیبر دو‌مدی با میکروخمش (Λ≈۰.۴ mm) ← آشکارساز. میدان مغناطیسی، صفحه قطبش را می‌چرخاند و کوپلینگ LP₀₁↔LP₁₁ را تغییر می‌دهد."
        badge={<FieldToggle on={fieldOn} onChange={setFieldOn} />}
      >
        <div className="rounded-xl border border-slate-700/40 bg-slate-950/40 p-2">
          <SchematicP1 fieldOn={fieldOn} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="عدد V" value={V.toFixed(2)} tone={V < 2.405 ? "rose" : V > 3.83 ? "rose" : "emerald"} />
          <Stat label="میدان B" value={(B * 1000).toFixed(1)} unit="mT" tone="amber" />
          <Stat label="θ_Faraday" value={thetaDeg.toFixed(2)} unit="°" tone="rose" />
          <Stat label="dθ/dI" value={(sens * 1000).toFixed(2)} unit="mrad/A" tone="violet" />
          <Stat label="n_eff LP₀₁" value={mp.neff01.toFixed(4)} tone="cyan" />
          <Stat label="Δn_MO" value={(dnMO * 1e6).toFixed(2)} unit="×10⁻⁶" tone="slate" />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[300px_1fr]">
        <ControlPanel>
          <Slider label="جریان اعمالی I" value={p.I_A} min={0} max={150} step={0.5} unit="A" onChange={(v) => set("I_A", v)} />
          <Slider label="طول برهم‌کنش L" value={p.L_m} min={0.05} max={1.0} step={0.01} unit="m" onChange={(v) => set("L_m", v)} />
          <Slider label="گام میکروخمش Λ" value={p.Lambda_um} min={100} max={700} step={10} unit="µm" onChange={(v) => set("Lambda_um", v)} />
          <Slider label="طول موج λ" value={p.lambdaNm} min={600} max={1000} step={10} unit="nm" onChange={(v) => set("lambdaNm", v)} />
          <Slider label="شعاع هسته a" value={p.a_um} min={2} max={5} step={0.05} unit="µm" onChange={(v) => set("a_um", v)} />
          <Slider label="عدد گشودگی NA" value={p.NA} min={0.08} max={0.18} step={0.005} onChange={(v) => set("NA", v)} />
          <Slider label="κ₀ کوپلینگ پایه" value={p.kappa0} min={1} max={12} step={0.1} unit="rad/m" onChange={(v) => set("kappa0", v)} />
          <div className="rounded-lg bg-slate-900/60 p-2 text-[11px] leading-5 text-slate-400">
            ثابت وردت سیلیکا در λ={p.lambdaNm} nm برابر است با
            <span className="font-bold text-cyan-300"> V={verdetSilica(p.lambdaNm).toFixed(2)} rad/(T·m)</span> (اسمیت، ۱۹۷۸؛ V∝1/λ²).
          </div>
        </ControlPanel>

        <div className="space-y-5">
          {/* Coupling chart — THE key chart */}
          <Card
            title="کوپلینگ مدی LP₀₁ ↔ LP₁₁ در طول فیبر"
            subtitle="انتقال توان بین دو مد به‌صورت نوسانی (توان یکی بالا می‌رود، دیگری پایین). مقایسه با/بدون میدان."
          >
            <Plot
              data={[
                { x: z.map((zz) => zz * 100), y: mpNo.p01, name: "P(LP₀۱) — بدون میدان", line: { color: NO, width: 2, dash: "dash" } },
                { x: z.map((zz) => zz * 100), y: mpNo.p11, name: "P(LP₁۱) — بدون میدان", line: { color: "#fbbf24", width: 2, dash: "dash" } },
                { x: z.map((zz) => zz * 100), y: mpF.p01, name: "P(LP₀۱) — با میدان", line: { color: "#60a5fa", width: 3 } },
                { x: z.map((zz) => zz * 100), y: mpF.p11, name: "P(LP₁۱) — با میدان", line: { color: FLD, width: 3 } },
              ]}
              layout={baseLayout({
                xaxis: { title: { text: "موقعیت محوری z (cm)" }, ...axisGrid },
                yaxis: { title: { text: "توان نسبی هر مد" }, ...axisGrid, range: [0, 1.05] },
                shapes: [
                  {
                    type: "line", x0: p.L_m * 100, x1: p.L_m * 100, y0: 0, y1: 1,
                    line: { color: "#fbbf24", width: 1.5, dash: "dot" },
                  },
                ],
                annotations: [
                  {
                    x: p.L_m * 100, y: 1.02, text: `نقطه کاری L=${p.L_m} m`,
                    font: { color: "#fbbf24", size: 10 }, showarrow: false,
                  },
                ],
              })}
            />
            <Analysis tone="cyan">
              <p>
                این نمودار دقیقاً نشان می‌دهد که توان بین دو مد <b>جابه‌جا می‌شود</b>: هرگاه
                P(LP₀۱) کاهش یابد، P(LP₁۱) به همان اندازه افزایش می‌یابد (π پیوسته).
                در <b>بدون میدان</b> انتقال تا ≈{(mpNo.transferMax * 100).toFixed(0)}٪ و در
                <b> I={p.I_A} A</b> به ≈{(mpF.transferMax * 100).toFixed(0)}٪ می‌رسد.
                ضریب کوپلینگ مؤثر از κ={mpNo.kappa.toFixed(1)} به κ={(k).toFixed(1)} rad/m افزایش می‌یابد
                چون پدیده فارادی به پدیده میکروخمش اضافه می‌شود.
              </p>
            </Analysis>
          </Card>

          {/* Mode fields 2D + 3D */}
          <Card
            title="توزیع شدت میدان مدها — LP₀۱ و LP₁۱: با و بدون میدان"
            subtitle="LP₀۱ متقارنِ دورانی است (دایره)؛ چرخش، دایره را به خودش می‌چرخاند پس در |E|² دیده نمی‌شود. LP₁۱ دو‌لبه‌ای است و چرخش قطبش، لبه‌ها را می‌چرخاند."
          >
            <div className="mb-1 text-xs font-semibold text-slate-300">
              مد LP₀۱ (متقارن دورانی) — با/بدون میدان ظاهرش یکسان است (دلیل: تقارن دایره‌ای)
            </div>
            <div className="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
              <Heatmap2D x={gridNoLP11.x} y={gridNoLP11.y} z={gridNoLP11.LP01} title="LP₀۱ — بدون میدان" tone="no" />
              <Heatmap2D x={gridFLP11.x} y={gridFLP11.y} z={gridFLP11.LP01} title="LP₀۱ — با میدان (ظاهر یکسان)" tone="field" />
            </div>
            <div className="mb-1 text-xs font-semibold text-slate-300">
              مد LP₁۱ (دولبه‌ای) — با میدان به اندازه θ_F می‌چرخد
            </div>
            <div className="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
              <Heatmap2D x={gridNoLP11.x} y={gridNoLP11.y} z={gridNoLP11.LP11} title="LP₁۱ — بدون میدان (θ=0)" tone="no" />
              <Heatmap2D x={gridFLP11.x} y={gridFLP11.y} z={gridFLP11.LP11} title={`LP₁۱ — با میدان (چرخش ${thetaDeg.toFixed(1)}°)`} tone="field" />
            </div>
            <div className="mb-1 text-xs font-semibold text-slate-300">
              الگوی میدان کل در خروجی (نسبت توان دو مد با کوپلینگ)
            </div>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              <Heatmap2D x={gridNoLP11.x} y={gridNoLP11.y} z={gridNoLP11.total} title="کل — بدون میدان" tone="no" />
              <Heatmap2D x={gridFLP11.x} y={gridFLP11.y} z={gridFLP11.total} title="کل — با میدان" tone="field" />
              <Surface3D x={gridFLP11.x} y={gridFLP11.y} z={gridFLP11.total} title="نمای سه‌بعدی — با میدان" />
            </div>
            <Analysis tone="violet">
              <p>
                <b>چرا LP₀۱ «بی‌تغییر» به‌نظر می‌رسد؟</b> مد LP₀۱ متقارنِ دورانی است؛ اثر فارادی صفحه قطبش را
                می‌چرخاند، اما چرخاندنِ یک الگویِ متقارنِ دورانی همان الگو را می‌دهد. یعنی <b>حالت قطبش</b>
                LP₀₁ تغییر می‌کند (LP₀₁ˣ ↔ LP₀₁ʸ جفت می‌شوند) ولی الگوی شدت |E|² تغییر نمی‌کند؛ برای دیدنش
                باید از یک <b>آنالایزر</b> استفاده کرد. در مقابل، الگوی دو‌لبه LP₁۱ نامتقارن است و چرخش قطبش،
                لبه‌ها را به‌روشنی می‌چرخاند.
              </p>
              <p className="mt-2">
                بدون میدان نسبت توان LP₀۱:LP₁۱ ≈
                {((1 - mpNo.p11[mpNo.p11.length - 1]) * 100).toFixed(0)}:{(mpNo.p11[mpNo.p11.length - 1] * 100).toFixed(0)}؛
                با میدان به ≈{((1 - mpF.p11[mpF.p11.length - 1]) * 100).toFixed(0)}:{(mpF.p11[mpF.p11.length - 1] * 100).toFixed(0)} می‌رسد.
              </p>
            </Analysis>
          </Card>

          {/* Faraday physics + mode indices */}
          <Card
            title="اثر فارادی در سطح مدی — دوگانگی دایروی و تغییر ضریب شکست"
            subtitle="میدان طولی، ضریب شکست را به دو شاخه دایره‌قطبیده تقسیم می‌کند: n_R ≠ n_L"
          >
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <Plot
                data={[
                  { x: ["n_L(LP₀₁)", "n_eff(LP₀₁)", "n_R(LP₀₁)"], y: [mIdx.nL01, mIdx.neff01, mIdx.nR01], type: "bar", name: "LP₀₁", marker: { color: NO } },
                  { x: ["n_L(LP₁₁)", "n_eff(LP₁۱)", "n_R(LP₁۱)"], y: [mIdx.nL11, mIdx.neff11, mIdx.nR11], type: "bar", name: "LP₁₁", marker: { color: FLD } },
                ]}
                layout={baseLayout({
                  title: { text: "شاخه‌های دایره‌ای ضریب شکست (بزرگ‌نمایی)", font: { size: 12 } },
                  yaxis: { title: { text: "n_eff" }, ...axisGrid, range: [mIdx.neff11 - 0.0012, mIdx.neff01 + 0.0012] },
                  margin: { l: 64, r: 16, t: 44, b: 40 },
                  showlegend: false,
                })}
              />
              <Plot
                data={[
                  { x: Iarr, y: dncVsI, name: "Δn_c = n_R−n_L (×10⁻⁶)", line: { color: FLD, width: 3 }, fill: "tozeroy" },
                  { x: Iarr, y: thSilica, name: "θ فارادی (°)", line: { color: NO, width: 2, dash: "dot" }, yaxis: "y2" },
                ]}
                layout={baseLayout({
                  title: { text: "دوگانگی دایروی و چرخش در برابر جریان", font: { size: 12 } },
                  xaxis: { title: { text: "جریان I (A)" }, ...axisGrid },
                  yaxis: { title: { text: "Δn_c (×10⁻⁶)" }, ...axisGrid, side: "left" },
                  yaxis2: { title: { text: "θ (°)" }, overlaying: "y", side: "right", gridcolor: "#155e75" },
                  margin: { l: 56, r: 56, t: 44, b: 44 },
                })}
              />
            </div>
            <Analysis tone="rose" title="علت چرخش فارادی — به‌صورت کامل با روابط">
              <p><b>۱) تجزیه:</b> نور خطی‌قطبیده = مجموع دو حالت دایره‌قطبیده راست‌گرد (R) و چپ‌گرد (L).</p>
              <p><b>۲) تانسور دی‌الکتریک ژیروتروپیک</b> در میدان طولی B به n±² = ε ∓ gB منجر می‌شود، پس n± ≈ n₀ ± gB/(2n₀).</p>
              <pre className="my-1 overflow-x-auto rounded-lg bg-slate-900 p-2 text-[11px] leading-5 text-emerald-200">{"ε̂ = | ε      i·gB   0 |\n    | −i·gB   ε     0 |   ⇒   n_R − n_L = gB/n₀ = V·B·λ/π\n    | 0      0     ε |"}</pre>
              <p><b>۳) دوگانگی دایروی:</b> اختلاف ضریب شکست دو شاخه
                <code className="mx-1 rounded bg-slate-800 px-1">Δn_c = n_R − n_L = V·B·λ/π</code>
                در λ={p.lambdaNm} nm و I={p.I_A} A برابر ≈ <b className="text-rose-200">{(mIdx.dnc * 1e6).toFixed(3)}×10⁻⁶</b>.
              </p>
              <p><b>۴) چرخش صفحه قطبش:</b> اختلاف فاز دو مؤلفه دایره‌ای، جمع آن‌ها را می‌چرخاند:</p>
              <pre className="my-1 overflow-x-auto rounded-lg bg-slate-900 p-2 text-[11px] leading-5 text-emerald-200">{"θ = ½·Δφ = (π/λ)·Δn_c·L = (π/λ)·(V·B·λ/π)·L = V·B·L"}</pre>
              <p>
                <b>۵) چه بلایی سر ضریب شکست مدهای انتشاری می‌آید؟</b> هر مد (LP₀₁ و LP₁₁) به دو شاخه
                دایره‌قطبیده R/L با n_R و n_L تجزیه می‌شود (نمودار چپ). این تغییر <b>مشترک</b> است (برای هر دو مد
                تقریباً یکسان)، پس الگوی شدت |E|² را تغییر نمی‌دهد، بلکه <b>حالت قطبش</b> را می‌چرخاند. به‌علاوه،
                میدان کوپلینگ LP₀₁↔LP₁₁ را تقویت می‌کند (κ از {mpNo.kappa.toFixed(1)} به {k.toFixed(1)} rad/m) که
                این بخش، نسبت توان مدها و الگوی کل را تغییر می‌دهد.
              </p>
            </Analysis>
          </Card>

          {/* Verdet constant role + amplification */}
          <Card
            title="نقش ثابت وردت V و راه‌های تقویت برای دیدن تغییرات"
            subtitle="θ = V·B·L: شیب پاسخ مستقیماً با V متناسب است. سیلیکا ضعیف است ولی با تقویت کاملاً قابل‌مشاهده می‌شود."
          >
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <Plot
                data={[
                  {
                    type: "bar",
                    x: verdetTheta.map((m) => m.label),
                    y: verdetTheta.map((m) => m.V * p.kB * p.L_m * (180 / Math.PI)),
                    marker: { color: verdetTheta.map((m) => m.color) },
                    text: verdetTheta.map((m) => (m.V * p.kB * p.L_m * (180 / Math.PI)).toFixed(2)),
                    textposition: "outside",
                    name: "dθ/dI",
                  },
                ]}
                layout={baseLayout({
                  title: { text: "حساسیت dθ/dI ∝ V (درجه/A) برای هر ماده", font: { size: 12 } },
                  xaxis: { ...axisGrid, automargin: true },
                  yaxis: { title: { text: "dθ/dI (°/A)" }, ...axisGrid, type: "log" },
                  margin: { l: 52, r: 12, t: 44, b: 90 },
                  showlegend: false,
                })}
              />
              <Plot
                data={[
                  { x: Narr, y: turnsSilica, name: "سیلیکا (V=2.05)", line: { color: "#22d3ee", width: 3 } },
                  { x: Narr, y: turnsTb, name: "Tb-دوپه (V=24)", line: { color: "#fbbf24", width: 2.5 } },
                  { x: Narr, y: turnsTGG, name: "TGG (V=78)", line: { color: "#fb7185", width: 2.5 } },
                ]}
                layout={baseLayout({
                  title: { text: "تقویت با پیچیدن N دور فیبر حول هادی (θ=N·V·μ₀·I)", font: { size: 12 } },
                  xaxis: { title: { text: "تعداد دور N" }, ...axisGrid },
                  yaxis: { title: { text: "θ (درجه)" }, ...axisGrid },
                  margin: { l: 52, r: 12, t: 44, b: 44 },
                })}
              />
            </div>
            <div className="mt-3">
              <Plot
                data={[
                  { x: Iarr, y: anaT, name: "T آنالایزر ۴۵° برای سیلیکا (%)", line: { color: FLD, width: 3 }, fill: "tozeroy" },
                ]}
                layout={baseLayout({
                  title: { text: "خروجی قابل‌مشاهده‌ی حسگر سیلیکا (آنالایزر ۴۵°، T=½(1+sin2θ))", font: { size: 12 } },
                  xaxis: { title: { text: "جریان I (A)" }, ...axisGrid },
                  yaxis: { title: { text: "توان خروجی (%)" }, ...axisGrid, range: [0, 100] },
                  margin: { l: 52, r: 12, t: 44, b: 44 },
                })}
              />
            </div>
            <Analysis tone="amber" title="تحلیل ثابت وردت و تقویت">
              <p>
                <b>برای فیبر معمولی (سیلیکا، V≈۲.۰۵):</b> در λ={p.lambdaNm} nm و I={p.I_A} A و L={p.L_m} m، چرخش
                θ={thetaDeg.toFixed(2)}° است. این مقدار <b>کوچک اما قابل‌مشاهده</b> است؛ با یک آنالایزر در ۴۵°،
                توان خروجی از ۵۰٪ به ≈<b>{anaT[Iarr.findIndex((v) => v >= p.I_A)].toFixed(1)}</b>٪ تغییر می‌کند (نمودار بالا)
                که با یک آشکارساز معمولی قابل اندازه‌گیری است. اما <b>تغییر ضریب شکست</b> (Δn_c≈{(mIdx.dnc * 1e6).toFixed(2)}×10⁻۶)
                بسیار کوچک است و در الگوی مدی دیده نمی‌شود.
              </p>
              <p className="mt-2"><b>راه‌های تقویت برای دیدن تغییرات بزرگ‌تر:</b></p>
              <ul className="list-disc space-y-1 pr-5">
                <li><b>افزایش V (ماده):</b> شیشه دوپه با تربیم (V≈۲۴) یا TGG (V≈۷۸) → تقویت ۱۲ تا ۳۸ برابری (نمودار چپ).</li>
                <li><b>افزایش N (تعداد دور):</b> پیچیدن فیبر به‌صورت حلقه حول هادی؛ θ=N·V·μ₀·I. برای سیلیکا، N≈۳۰۰–۱۰۰۰ دور لازم است (نمودار راست).</li>
                <li><b>افزایش L و B:</b> فیبر طولانی‌تر یا میدان قوی‌تر (سولنوئید/هلمهولتز با I بالاتر).</li>
                <li><b>آنالایزر ۴۵° + قفل‌فازی (lock-in):</b> بیشینه شیب خطی و حذف نویز → آشکارسازی تغییرات کوچک.</li>
              </ul>
            </Analysis>
          </Card>

          {/* Faraday rotation 2D & 3D */}
          <Card
            title="چرخش صفحه قطبش — θ = V·B·L (دوبعدی و سه‌بعدی)"
            subtitle="مقایسه فیبر سیلیکا، فیبر دوپه‌تربیم و فیبر قطبش‌نگهدار (PM)."
          >
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <Plot
                data={[
                  { x: Iarr, y: thSilica, name: "سیلیکا (V≈2.05)", line: { color: NO, width: 3 } },
                  { x: Iarr, y: thTb, name: "Tb-دوپه (V≈24)", line: { color: FLD, width: 3 } },
                  { x: Iarr, y: thPM, name: "PM/PANDA (V≈0.6)", line: { color: "#a78bfa", width: 2, dash: "dash" } },
                ]}
                layout={baseLayout({
                  title: { text: "چرخش قطبش در برابر جریان", font: { size: 13 } },
                  xaxis: { title: { text: "جریان I (A)" }, ...axisGrid },
                  yaxis: { title: { text: "θ (درجه)" }, ...axisGrid },
                })}
              />
              <Plot
                data={[helixNo, helixField]}
                layout={{
                  title: { text: "پیچش بردار قطبش در طول فیبر", font: { size: 13 } },
                  scene: {
                    xaxis: { title: "z mm" }, yaxis: { title: "Ex" }, zaxis: { title: "Ey" },
                    camera: { eye: { x: 1.7, y: -1.4, z: 0.8 } },
                  },
                  margin: { l: 0, r: 0, t: 40, b: 0 },
                }}
              />
            </div>
            <Analysis tone="rose">
              <p>
                در سیلیکا، θ={thetaDeg.toFixed(2)}° در I={p.I_A} A؛ در فیبر Tb-دوپه حدود ۱۲ برابر
                بیشتر است که آن را برای حسگر جریان ایده‌آل می‌کند. در نمودار سه‌بعدی، بردار قطبش
                در طول فیبر می‌پیچد (نرخ پیچش = V·B)؛ بدون میدان خط مستقیم است.
              </p>
            </Analysis>
          </Card>

          {/* Magnetic field distribution */}
          <Card title="توزیع میدان مغناطیسی در طول فیبر" subtitle="پروفایل B(z) و چرخش انباشته θ(z)">
            <Plot
              data={[
                { x: zf.map((zz) => zz * 100), y: Bprofile.map((b) => b * 1000), name: "B(z)", line: { color: FLD, width: 3 }, yaxis: "y" },
                { x: zf.map((zz) => zz * 100), y: thetaCum, name: "θ انباشته (deg)", line: { color: "#34d399", width: 2, dash: "dot" }, yaxis: "y2" },
              ]}
              layout={baseLayout({
                xaxis: { title: { text: "z (cm)" }, ...axisGrid },
                yaxis: { title: { text: "B (mT)" }, ...axisGrid, side: "left" },
                yaxis2: { title: { text: "θ (°)" }, overlaying: "y", side: "right", gridcolor: "#14532d" },
              })}
            />
          </Card>

          {/* Two more: spectrum, phase match */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card title="طیف انتقال فیبر دو‌مدی" subtitle="تداخل ضربان LP₀۱–LP₁₁؛ با میدان عمق قله‌ها و فاز تغییر می‌کند.">
              <Plot
                data={[
                  { x: lam, y: specNo, name: "بدون میدان", line: { color: NO, width: 2, dash: "dash" } },
                  { x: lam, y: specF, name: "با میدان", line: { color: FLD, width: 2.5 } },
                ]}
                layout={baseLayout({
                  xaxis: { title: { text: "طول موج (nm)" }, ...axisGrid },
                  yaxis: { title: { text: "انتقال نسبی" }, ...axisGrid },
                })}
              />
            </Card>
            <Card title="تطبیق فاز کوپلینگ در برابر گام Λ" subtitle="بیشینه کوپلینگ در Λ ضربان = λ/Δn_eff">
              <Plot
                data={[
                  { x: lamB, y: pmNo, name: "بدون میدان", line: { color: NO, width: 2, dash: "dash" } },
                  { x: lamB, y: pmF, name: "با میدان", line: { color: FLD, width: 2.5 } },
                ]}
                layout={baseLayout({
                  xaxis: { title: { text: "Λ میکروخمش (µm)" }, ...axisGrid },
                  yaxis: { title: { text: "بازده کوپلینگ" }, ...axisGrid },
                  shapes: [{ type: "line", x0: mp.Lambda_beat_um, x1: mp.Lambda_beat_um, y0: 0, y1: 1, line: { color: "#fbbf24", dash: "dot" } }],
                  annotations: [{ x: mp.Lambda_beat_um, y: 0.9, text: `Λ*=${mp.Lambda_beat_um.toFixed(0)}µm`, font: { color: "#fbbf24", size: 10 }, showarrow: false }],
                })}
              />
            </Card>
          </div>

          {/* Sensitivity + long vs trans */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card title="حساسیت حسگر — dθ/dI در برابر طول" subtitle="حساسیت خطی با طول افزایش می‌یابد.">
              <Plot
                data={[{ x: Larr, y: sensL, name: "dθ/dI", line: { color: "#a78bfa", width: 3 }, fill: "tozeroy" }]}
                layout={baseLayout({
                  xaxis: { title: { text: "طول فیبر L (m)" }, ...axisGrid },
                  yaxis: { title: { text: "dθ/dI (mrad/A)" }, ...axisGrid },
                })}
              />
            </Card>
            <Card title="میدان طولی (فارادی) vs میدان عرضی (کاتن–موتون)" subtitle="اثر عرضی در سیلیکا چندین مرتبه ضعیف‌تر است.">
              <Plot
                data={[
                  { x: Iarr, y: thSilica, name: "طولی: فارادی θ", line: { color: FLD, width: 3 } },
                  { x: Iarr, y: trCM, name: "عرضی: کاتن-موتون", line: { color: NO, width: 2, dash: "dash" } },
                ]}
                layout={baseLayout({
                  xaxis: { title: { text: "I (A)" }, ...axisGrid },
                  yaxis: { title: { text: "پاسخ (درجه)" }, ...axisGrid },
                })}
              />
            </Card>
          </div>

          <Analysis tone="emerald" title="چالش‌ها و فاز پیشنهادی اصلاحی (فاز ۱)">
            <p>
              <b>چالش:</b> در سیلیکا خالص، Δn_MO≈{(dnMO * 1e6).toFixed(1)}×10⁻⁶ بسیار کوچک است، پس
              انتقال توان به میدان وابسته اما محدود است. <b>راه‌حل پیشنهادی:</b> استفاده از فیبر
              دوپه‌تربیم (V≈۲۴، افزایش ~۱۲ برابر)، یا پیچیدن فیبر به‌صورت چنددور حول هادی (افزایش L)،
              و قراردادن آنالایزر در زاویه ۴۵° برای بیشینه حساسیت خطی.
            </p>
          </Analysis>

          <Refs
            items={[
              "Smith A. M., Appl. Opt. 17(1), 52 (1978) — ثابت وردت فیبر تک‌مدی سیلیکا: ۳.۶۱ @632.8 nm، ۲.۰۵ @830 nm.",
              "Sensors 17, 1899 (2017) — اندازه‌گیری ثابت وردت و وابستگی V∝1/λ².",
              "Yariv, Optical Electronics — تئوری مد-جفت‌شده و انتقال توان بین مدها.",
              "R. P. de Paula & E. L. Moore, Proc. SPIE — حسگرهای میکروخمش دو‌مدی.",
            ]}
          />
        </div>
      </div>
    </div>
  );
}
