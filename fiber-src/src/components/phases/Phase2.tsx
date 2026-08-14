import { useMemo, useState } from "react";
import Plot, { type PlotlyLayout } from "../Plot";
import { Card, Slider, FieldToggle, Stat, Analysis, Refs, ControlPanel } from "../ui";
import { Surface3D } from "../FieldViews";
import { SchematicP2 } from "../Schematics";
import * as P2 from "../../lib/physics2";
import { linspace, deg, verdetSilica } from "../../lib/core";

const NO = "#22d3ee";
const FLD = "#fb7185";
const ag = { gridcolor: "#1e293b", zerolinecolor: "#334155" };
const lay = (o: Partial<PlotlyLayout> = {}): PlotlyLayout => ({ ...o });

export default function Phase2() {
  const [p, setP] = useState<P2.P2Params>(P2.P2_DEFAULT);
  const [fieldOn, setFieldOn] = useState(true);
  const set = (k: keyof P2.P2Params, v: number) => setP((s) => ({ ...s, [k]: v }));
  const pNo = useMemo(() => ({ ...p, I_A: 0 }), [p]);

  const d = useMemo(() => {
    const B = P2.helmholtzB(p);
    const theta = P2.smsFaradayRotation(p);
    const dnEff = P2.effectiveDn(p);
    const Vmmf = P2.mmfV(p);
    // MMI field no/field
    const imgPeriodMm = P2.selfImagingPeriodUm(p) / 1000;
    const mmiNo = P2.mmiField(pNo);
    const mmiF = P2.mmiField(p);
    // clean symmetric output profile for several currents (clear differences)
    const currents = [0, 10, 30, 60, 100, 150];
    const radial = currents.map((i) => {
      const pr = P2.outputProfile({ ...p, I_A: i });
      return { i, r: pr.r_um, I: pr.I };
    });
    // transmission vs length
    const zL = linspace(0, p.Lmmf_mm, 220);
    const TLno = P2.transmissionVsLength(pNo, zL);
    const TLf = P2.transmissionVsLength(p, zL);
    // transmission spectrum (adaptive window for clear fringes)
    const lam0 = p.lambdaNm;
    const win = p.lambdaNm < 1100 ? 5 : 12;
    const lam = linspace(lam0 - win, lam0 + win, 320);
    const Tno = P2.transmissionVsLambda(pNo, lam);
    const Tf = P2.transmissionVsLambda(p, lam);
    // analyzer T(I)
    const Iarr = linspace(0, 150, 121);
    const Tana = Iarr.map((i) => P2.analyzerT(P2.smsFaradayRotation(p, i)) * 100);
    const sensI = Iarr.map((i) => {
      const t1 = P2.analyzerT(P2.smsFaradayRotation(p, i - 0.1));
      const t2 = P2.analyzerT(P2.smsFaradayRotation(p, i + 0.1));
      return ((t2 - t1) / 0.2) * 100;
    });
    // Helmholtz axial profile
    const xMm = linspace(-90, 90, 181);
    const sepArr = Array.from({ length: xMm.length }, () => p.R_cm * 10); // optimal sep = R
    const Bprof = P2.helmholtzProfile(p, sepArr, xMm);
    // uniformity vs separation
    const seps = linspace(2, 16, 60);
    const uni = P2.uniformityVsSeparation(p, seps);
    // long vs trans (faraday rotation vs cotton-mouton waves)
    const Lm = p.Lmmf_mm / 1000;
    const longTh = Iarr.map((i) => deg(verdetSilica(p.lambdaNm) * P2.helmholtzB(p, i) * Lm));
    const transCM = Iarr.map((i) => {
      const Bv = P2.helmholtzB(p, i);
      return 1e3 * 4.5e-15 * Bv * Bv * Lm / (p.lambdaNm * 1e-9);
    });
    const dnFar = P2.faradayDn(p);
    const dnClad = P2.moCladDn(p);
    const modeIdx = P2.modeEffectiveIndices(p, 6);
    // effective-index change of each mode vs current (clear mode-dependence)
    const idxVsI = currents.map((i) => {
      const mi = P2.modeEffectiveIndices({ ...p, I_A: i }, 6);
      return { i, dn: mi.modes.map((mm) => mm.neff - mm.neff0) };
    });
    return {
      B, theta, dnEff, Vmmf, imgPeriodMm, mmiNo, mmiF, radial, currents,
      zL, TLno, TLf, lam, Tno, Tf, Iarr, Tana, sensI,
      xMm, Bprof, seps, uni, longTh, transCM, dnFar, dnClad, modeIdx, idxVsI,
    };
  }, [p, pNo]);

  const { B, theta, dnEff, Vmmf, imgPeriodMm, mmiNo, mmiF, radial, currents, zL, TLno, TLf, lam, Tno, Tf, Iarr, Tana, sensI, xMm, Bprof, seps, uni, longTh, transCM, dnFar, dnClad, modeIdx, idxVsI } = d;
  const shiftNm = P2.spectralShift(p, dnEff);

  return (
    <div className="space-y-5">
      <Card
        title="فاز ۲ — ساختار SMS در آزمایشگاه"
        subtitle="SMF-28 (2m) — MMF 62.5/125 (8–10cm) — SMF-28 (2m). پدیده تداخل چندمدی (MMI) و خودتصویری در میدان هلمهولتز."
        badge={<FieldToggle on={fieldOn} onChange={setFieldOn} />}
      >
        <div className="rounded-xl border border-slate-700/40 bg-slate-950/40 p-2">
          <SchematicP2 fieldOn={fieldOn} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="B هلمهولتز" value={(B * 1000).toFixed(1)} unit="mT" tone="amber" />
          <Stat label="θ_Faraday (MMF)" value={deg(theta).toFixed(2)} unit="°" tone="rose" />
          <Stat label="Δn پوشش مغناطیسی-نوری" value={(dnClad * 1e6).toFixed(2)} unit="×10⁻⁶" tone="violet" />
          <Stat label="Δn فارادی (سیلیکا)" value={(dnFar * 1e7).toFixed(2)} unit="×10⁻⁷" tone="slate" />
          <Stat label="دوره خودتصویری" value={imgPeriodMm.toFixed(1)} unit="mm" tone="cyan" />
          <Stat label="عدد V (MMF)" value={Vmmf.toFixed(1)} tone="emerald" />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[300px_1fr]">
        <ControlPanel>
          <Slider label="جریان هلمهولتز I" value={p.I_A} min={0} max={150} step={0.5} unit="A" onChange={(v) => set("I_A", v)} />
          <Slider label="Δn پوشش مغناطیسی-نوری MMF" value={(p.moClad ?? 0.008) * 1e3} min={0} max={20} step={0.1} unit="×10⁻³" onChange={(v) => set("moClad" as keyof P2.P2Params, v * 1e-3)} />
          <Slider label="طول MMF" value={p.Lmmf_mm} min={40} max={120} step={1} unit="mm" onChange={(v) => set("Lmmf_mm", v)} />
          <Slider label="قطر هسته MMF" value={p.D_um} min={50} max={105} step={0.5} unit="µm" onChange={(v) => set("D_um", v)} />
          <Slider label="طول موج λ" value={p.lambdaNm} min={800} max={1700} step={10} unit="nm" onChange={(v) => set("lambdaNm", v)} />
          <Slider label="عدد گشودگی NA" value={p.NA} min={0.1} max={0.39} step={0.005} onChange={(v) => set("NA", v)} />
          <Slider label="شعاع سیم‌پیچ R" value={p.R_cm} min={3} max={10} step={0.5} unit="cm" onChange={(v) => set("R_cm", v)} />
          <div className="rounded-lg bg-slate-900/60 p-2 text-[11px] leading-5 text-slate-400">
            رابطه میدان هلمهولتز: <b className="text-amber-300">B = 0.7155·μ₀NI/R ≈ 24·I mT</b> (N=1600, R=6cm).
            محدوده ایمن پیوسته ۱۵–۲۰ A (R_tot=3Ω → P≈I²R)؛ بازه ۰–۱۵۰ A برای اکتشاف نظری.
          </div>
        </ControlPanel>

        <div className="space-y-5">
          {/* MMI self-imaging 2D + 3D */}
          <Card
            title="الگوی تداخل چندمدی (MMI) در طول MMF — خودتصویری"
            subtitle={`نمایش ~۳ دوره خودتصویری (دوره ≈ ${imgPeriodMm.toFixed(1)} mm) با نمونه‌برداری کامل فرینج‌ها. مقایسه با/بدون میدان.`}
          >
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <Plot
                data={[{
                  type: "heatmap", x: mmiNo.r_um, y: mmiNo.z_mm, z: mmiNo.I,
                  colorscale: "Viridis", zmin: 0, zmax: 1,
                  colorbar: { title: { text: "|E|²", size: 10 }, thickness: 10 },
                  name: "بدون میدان",
                }]}
                layout={lay({
                  title: { text: "بدون میدان", font: { size: 12, color: NO } },
                  xaxis: { title: { text: "r (µm)" }, ...ag },
                  yaxis: { title: { text: "z (mm)" }, ...ag },
                  margin: { l: 52, r: 10, t: 38, b: 42 },
                })}
              />
              <Plot
                data={[{
                  type: "heatmap", x: mmiF.r_um, y: mmiF.z_mm, z: mmiF.I,
                  colorscale: "Viridis", zmin: 0, zmax: 1,
                  colorbar: { title: { text: "|E|²", size: 10 }, thickness: 10 },
                  name: "با میدان",
                }]}
                layout={lay({
                  title: { text: `با میدان (I=${p.I_A} A)`, font: { size: 12, color: FLD } },
                  xaxis: { title: { text: "r (µm)" }, ...ag },
                  yaxis: { title: { text: "z (mm)" }, ...ag },
                  margin: { l: 52, r: 10, t: 38, b: 42 },
                })}
              />
            </div>
            <div className="mt-3">
              <Surface3D x={mmiF.r_um} y={mmiF.z_mm} z={mmiF.I} title="نمای سه‌بعدی الگوی MMI — با میدان" />
            </div>
            <Analysis tone="amber">
              <p>
                بازآفرینی تصویر (Self-Imaging) هر {imgPeriodMm.toFixed(1)} mm رخ می‌دهد.
                <b> توجه فیزیکی مهم:</b> اگر پوشش مغناطیسی-نوری صفر باشد (Δn پوشش = ۰)، دو نقشه «با/بدون میدان»
                تقریباً یکسان می‌شوند — این درست است، زیرا اثر فارادی در سیلیکا یک جابه‌جاییِ مشترک است.
                وقتی Δn پوشش &gt; ۰ (مثلاً {(dnClad * 1e3).toFixed(1)}×10⁻³)، ثابت انتشار مدها به‌صورت
                وابسته به مد تغییر می‌کند و الگوی فرینج‌ها در طول MMF به‌روشنی جابه‌جا می‌شود: نواحی روشن/تاریک
                به سمت بالا/پایین شیفت پیدا می‌کنند. جابه‌جایی فازی میان LP₀₁ و LP₀₂ در I={p.I_A} A حدود
                {(2 * Math.PI * dnClad * p.Lmmf_mm * 1000 * 0.006 / (p.lambdaNm * 1e-3)).toFixed(0)} رادیان است.
              </p>
            </Analysis>
          </Card>

          {/* radial output field multi-current */}
          <Card title="توزیع شدت میدان در خروجی MMF — مقایسه جریان‌ها" subtitle={`پروفایل شعاعی |E(r,L)|² برای I = ${currents.join(", ")} A`}>
            <Plot
              data={radial.map((rp, j) => ({
                x: rp.r, y: rp.I,
                name: `I=${rp.i} A`,
                line: {
                  color: ["#22d3ee", "#34d399", "#fbbf24", "#fb923c", "#f87171", "#fb7185"][j],
                  width: rp.i === 0 ? 2 : 3,
                  dash: rp.i === 0 ? "dash" : "solid",
                },
              }))}
              layout={lay({
                xaxis: { title: { text: "شعاع r (µm)" }, ...ag },
                yaxis: { title: { text: "|E(r,L)|² (نرمال)" }, ...ag },
              })}
            />
            <Analysis tone="cyan">
              <p>
                در سیلیکای خالص اثر فارادی بسیار ضعیف است (Δn_Faraday≈{(dnFar * 1e7).toFixed(1)}×10⁻⁷) و ضمناً
                یک <b>اختلاف شکست دایرویِ مشترک</b> برای همه مدهاست؛ یعنی ضریب شکست همه مدها را تقریباً یکسان
                جابه‌جا می‌کند. چون الگوی شدت |E|² به اختلاف فاز <b>نسبی</b> مدها بستگی دارد، این جابه‌جایی
                مشترک در |E|² تقریباً دیده نمی‌شود — این، فیزیک درست است و دلیلی است که SMS سیلیکای خالص
                به‌تنهایی حسگر میدان خوبی نیست.
              </p>
              <p className="mt-2">
                راه‌حل واقعی حسگرهای مغناطیسی SMS: <b>پوشش MMF با سیال/لایه مغناطیسی-نوری</b> (در این شبیه‌ساز
                با اسلایدر «Δn پوشش» قابل تنظیم). این لایه، ضریب شکست را به‌صورت <b>وابسته به مد</b> تغییر
                می‌دهد (مدهای مرتبه بالاتر سهم تبخیریِ بیشتری در پوشش دارند)، پس اختلاف فاز نسبی تغییر کرده
                و الگو با جریان به‌روشنی جابه‌جا می‌شود.
              </p>
            </Analysis>
          </Card>

          {/* Mode effective indices with field + physics of WHY pattern changes */}
          <Card
            title="ضریب شکست مؤثر مدهای LP₀ₘ — با و بدون میدان"
            subtitle="چرا الگوی MMI با میدان تغییر می‌کند؟ پاسخ: جابه‌جایی وابسته به مدِ n_eff"
          >
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <Plot
                data={[
                  { x: modeIdx.modes.map((m) => `LP₀${m.m}`), y: modeIdx.modes.map((m) => m.neff0), type: "bar", name: "بدون میدان n_eff", marker: { color: NO } },
                  { x: modeIdx.modes.map((m) => `LP₀${m.m}`), y: modeIdx.modes.map((m) => m.neff), type: "bar", name: "با میدان n_eff", marker: { color: FLD } },
                ]}
                layout={lay({
                  title: { text: "n_eff مدها (اختلاف در مقیاس نشان داده شد)", font: { size: 11 } },
                  xaxis: { ...ag },
                  yaxis: { title: { text: "n_eff" }, range: [1.4430, 1.4445], ...ag },
                  barmode: "group",
                  margin: { l: 52, r: 10, t: 40, b: 40 },
                })}
              />
              <Plot
                data={modeIdx.modes.map((m, j) => ({
                  x: idxVsI.map((r) => r.i),
                  y: idxVsI.map((r) => (r.dn[j] ?? 0) * 1e5),
                  name: `LP₀${m.m}`,
                  line: { color: ["#22d3ee", "#34d399", "#fbbf24", "#fb923c", "#f87171", "#fb7185"][j], width: 2 },
                }))}
                layout={lay({
                  title: { text: "Δn_eff هر مد در برابر جریان (×10⁻⁵)", font: { size: 11 } },
                  xaxis: { title: { text: "I (A)" }, ...ag },
                  yaxis: { title: { text: "Δn_eff (×10⁻⁵)" }, ...ag },
                  margin: { l: 52, r: 10, t: 40, b: 40 },
                })}
              />
            </div>
            <Analysis tone="violet">
              <p>
                نمودار سمت چپ: هر مدی دو مقدار n_eff دارد — بدون میدان (آبی) و با میدان (قرمز).
                جابه‌جایی برای LP₀₁ (محدود در هسته) کوچک و برای LP₀₆ (نزدیک cutoff، سهم تبخیری زیاد) بزرگ‌تر است.
                نمودار سمت راست: <b>این تفاوت نسبی</b> است که باعث می‌شود الگوی تداخل با جریان جابه‌جا شود.
                دایری-دوگانگی فارادی (Δn_c≈{(modeIdx.dnc * 1e7).toFixed(1)}×10⁻⁷) مشترک است و در |E|² حذف می‌شود.
              </p>
            </Analysis>
          </Card>

          {/* T(L) and T(lambda) */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card title="انتقال SMS در برابر طول MMF" subtitle="قله‌های بازتصویری دوره‌ای">
              <Plot
                data={[
                  { x: zL, y: TLno, name: "بدون میدان", line: { color: NO, width: 2, dash: "dash" } },
                  { x: zL, y: TLf, name: "با میدان", line: { color: FLD, width: 2.5 } },
                ]}
                layout={lay({
                  xaxis: { title: { text: "طول MMF (mm)" }, ...ag },
                  yaxis: { title: { text: "انتقال" }, ...ag },
                })}
              />
            </Card>
            <Card title="طیف انتقال SMS در برابر طول موج" subtitle="قله‌ها و دره‌های تداخلی؛ جابجایی با میدان">
              <Plot
                data={[
                  { x: lam, y: Tno, name: "بدون میدان", line: { color: NO, width: 2, dash: "dash" } },
                  { x: lam, y: Tf, name: "با میدان", line: { color: FLD, width: 2.5 } },
                ]}
                layout={lay({
                  xaxis: { title: { text: "طول موج (nm)" }, ...ag },
                  yaxis: { title: { text: "انتقال" }, ...ag },
                })}
              />
            </Card>
          </div>

          {/* Helmholtz profile + optimal separation */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card title="توزیع میدان هلمهولتز روی محور" subtitle="منطقه یکنواخت مرکزی">
              <Plot
                data={[{ x: xMm, y: Bprof, name: "B(x)", line: { color: FLD, width: 3 }, fill: "tozeroy" }]}
                layout={lay({
                  xaxis: { title: { text: "x (mm)" }, ...ag },
                  yaxis: { title: { text: "B (mT)" }, ...ag },
                  shapes: [{ type: "rect", x0: -10, x1: 10, y0: 0, y1: Math.max(...Bprof), fillcolor: "rgba(34,211,238,0.08)", line: { width: 0 } }],
                })}
              />
            </Card>
            <Card title="یکنواختی میدان و فاصله بهینه سیم‌پیچ‌ها" subtitle="حداقل نویز در d=R (شرط هلمهولتز)">
              <Plot
                data={[
                  { x: seps, y: uni.map((u) => u.center), name: "B مرکز (mT)", line: { color: FLD, width: 2.5 }, yaxis: "y" },
                  { x: seps, y: uni.map((u) => u.nonUniform), name: "نایکنواختی (% ±1cm)", line: { color: NO, width: 2, dash: "dot" }, yaxis: "y2" },
                ]}
                layout={lay({
                  xaxis: { title: { text: "فاصله سیم‌پیچ‌ها (cm)" }, ...ag },
                  yaxis: { title: { text: "B مرکز (mT)" }, ...ag, side: "left" },
                  yaxis2: { title: { text: "نایکنواختی %" }, overlaying: "y", side: "right", gridcolor: "#155e75" },
                  shapes: [{ type: "line", x0: p.R_cm, x1: p.R_cm, y0: 0, y1: 1, yref: "paper", line: { color: "#fbbf24", dash: "dot" } }],
                  annotations: [{ x: p.R_cm, y: 0.95, yref: "paper", text: "d*=R", font: { color: "#fbbf24", size: 10 }, showarrow: false }],
                })}
              />
            </Card>
          </div>

          {/* sensitivity + long vs trans */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card title="حساسیت حسگر SMS — چرخش فارادی و خواندن آنالایزر ۴۵°" subtitle="θ=V·B·L (سیگنال اصلی فاز ۲) و T=(1+sin2θ)/2">
              <Plot
                data={[
                  { x: Iarr, y: longTh, name: "θ فارادی (درجه)", line: { color: FLD, width: 3 }, yaxis: "y" },
                  { x: Iarr, y: Tana, name: "T آنالایزر ۴۵° (%)", line: { color: NO, width: 2.5 }, yaxis: "y2" },
                  { x: Iarr, y: sensI, name: "dT/dI (%/A)", line: { color: "#34d399", width: 2, dash: "dot" }, yaxis: "y3" },
                ]}
                layout={lay({
                  xaxis: { title: { text: "I (A)" }, ...ag },
                  yaxis: { title: { text: "θ (°)" }, ...ag, side: "left" },
                  yaxis2: { title: { text: "T (%)" }, overlaying: "y", side: "right", gridcolor: "#155e75" },
                  yaxis3: { title: { text: "dT/dI (%/A)" }, overlaying: "y", side: "right", anchor: "free", autoshift: true, gridcolor: "#14532d" },
                })}
              />
            </Card>
            <Card title="اثر میدان طولی vs عرضی بر SMS" subtitle="فارادی (خطی) ≫ کاتن-موتون (درجه ۲)">
              <Plot
                data={[
                  { x: Iarr, y: longTh, name: "طولی (فارادی)", line: { color: FLD, width: 3 } },
                  { x: Iarr, y: transCM, name: "عرضی (C-M)", line: { color: NO, width: 2, dash: "dash" } },
                ]}
                layout={lay({
                  xaxis: { title: { text: "I (A)" }, ...ag },
                  yaxis: { title: { text: "پاسخ" }, ...ag },
                })}
              />
            </Card>
          </div>

          <Analysis tone="amber" title="چگونه جریان را در ساختار SMS اندازه می‌گیریم؟ (معیار اندازه‌گیری)">
            <p>
              یک ساختار SMS، خودِ «جریان‌سنج» مستقیم نیست؛ جریان از طریق <b>میدان مغناطیسی</b> هلمهولتز
              (B=24·I mT) خوانده می‌شود. دو مسیر اندازه‌گیری دارید:
            </p>
            <p className="mt-1">
              <b>مسیر ۱ — قطبش‌سنجی (فارادی):</b> میدان طولی، صفحه قطبش را به اندازه θ=V·B·L می‌چرخاند.
              با قرار دادن یک <b>آنالایزر در ۴۵°</b>، توان خروجی T=(1+sin2θ)/2 تغییر می‌کند. در نمودار حساسیت،
              T از ۵۰٪ (I=0) به ≈<b>{(P2.analyzerT(theta) * 100).toFixed(1)}</b>٪ در I={p.I_A} A
              می‌رسد (θ={deg(theta).toFixed(2)}°). این، <b>معیار اصلی اندازه‌گیری جریان</b> در فاز ۲ است.
            </p>
            <p className="mt-1">
              <b>مسیر ۲ — طیف‌سنجی (جابجایی فرینج):</b> اگر MMF پوشش مغناطیسی-نوری داشته باشد، قله/دره‌ی
              طیف انتقال به اندازه Δλ={shiftNm.toFixed(3)} nm (در I={p.I_A} A) شیفت می‌کند؛ ردیابی این شیفت،
              جریان را کمی می‌کند (حساسیت طیفی).
            </p>
          </Analysis>

          <Analysis tone="emerald" title="چالش‌ها و فاز پیشنهادی اصلاحی (فاز ۲)">
            <p>
              <b>چالش:</b> در سیلیکای خالص، اثر مستقیم میدان بر الگوی MMI بسیار ضعیف است (اثر فارادی مشترک
              است و در |E|² حذف می‌شود). سیگنال قابل‌اعتماد از چرخش فارادی + آنالایزر می‌آید. <b>راه‌حل:</b>
              پوشش MMF با ماده مغناطیسی-نوری (برای مسیر طیفی) و/یا افزودن نانوذره برای تقویت Δn_eff → فاز ۳.
            </p>
          </Analysis>

          <Refs
            items={[
              "Wang Q. & Li Y., J. Lightwave Technol. — ساختار SMS و پدیده خودتصویری (MMI).",
              "Antonio-Lopez J. E. et al., Opt. Express — بازتصویری در MMF ناکور.",
              "Soldano L. B. & Pennings E. C. M., J. Lightwave Technol. 13(4), 615 (1995) — نظریه تداخل چندمدی.",
              "Sensors & Actuators A — حسگرهای مغناطیسی مبتنی بر SMS و سیال مغناطیسی.",
            ]}
          />
        </div>
      </div>
    </div>
  );
}
