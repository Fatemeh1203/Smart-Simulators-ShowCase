import { useMemo, useState } from "react";
import Plot, { type PlotlyLayout } from "../Plot";
import { Card, Slider, Select, FieldToggle, Stat, Analysis, Refs, ControlPanel } from "../ui";
import { Surface3D, Heatmap2D } from "../FieldViews";
import { SchematicP3 } from "../Schematics";
import * as P3 from "../../lib/physics3";
import * as P2 from "../../lib/physics2";
import { p3ToP2 } from "../../lib/physics3";
import { linspace } from "../../lib/core";

const NO = "#22d3ee";
const FLD = "#fb7185";
const ag = { gridcolor: "#1e293b", zerolinecolor: "#334155" };
const lay = (o: Partial<PlotlyLayout> = {}): PlotlyLayout => ({ ...o });

export default function Phase3() {
  const [p, setP] = useState<P3.P3Params>(P3.P3_DEFAULT);
  const [fieldOn, setFieldOn] = useState(true);
  const set = (k: keyof P3.P3Params, v: number) => setP((s) => ({ ...s, [k]: v }));

  const d = useMemo(() => {
    const B = P2.helmholtzB(p3ToP2(p));
    const dnFluid = P3.fluidDn(p);
    const dnPe = P3.photoelasticDn(p);
    const dnTot = P3.totalDnEff(p);
    const press = P3.magneticPressure(p);
    const sens = P3.sensitivityNmPerA(p);
    const shift = P2.spectralShift(p3ToP2(p), dnTot);
    const mag = P3.magnetization(p);
    // MMI: no field (plain) vs with NP+field
    const dnP2 = P2.effectiveDn(p3ToP2(p)); // plain silica (phase-2 level)
    const mmiNo = P2.mmiField(p3ToP2(p), 0, 0);
    const mmiF = P2.mmiField(p3ToP2(p), 0, dnTot);
    const radialNo = P2.outputProfile(p3ToP2(p), 0, 0);
    const radialF = P2.outputProfile(p3ToP2(p), 0, dnTot);
    // transverse 2D output field with/without
    const field2Dno = P2.outputField2D(p3ToP2(p), 0, 0);
    const field2Df = P2.outputField2D(p3ToP2(p), 0, dnTot);
    // multi-current radial comparison
    const currents3 = [0, 10, 30, 60, 100, 150];
    const radialCur = currents3.map((i) => {
      const pr = P2.outputProfile(p3ToP2({ ...p, I_A: i }), 0, P3.totalDnEff({ ...p, I_A: i }, i));
      return { i, r: pr.r_um, I: pr.I };
    });
    // pressure, dn, magnetization vs current
    const Iarr = linspace(0, 150, 121);
    const pressI = Iarr.map((i) => P3.magneticPressure(p, i));
    const dnPeI = Iarr.map((i) => P3.photoelasticDn(p, i));
    const dnTotI = Iarr.map((i) => P3.totalDnEff(p, i));
    const magI = Iarr.map((i) => P3.magnetization(p, i) / 1000); // kA/m
    // ferrofluid Δn vs B for all 3 materials
    const barr = linspace(0, 2, 81);
    const fluidCurves = {
      ferrofluid: P3.fluidDnVsB("ferrofluid", barr),
      Fe3O4: P3.fluidDnVsB("Fe3O4", barr),
      gFe2O3: P3.fluidDnVsB("gFe2O3", barr),
    };
    // sensitivity sweeps
    const phiArr = linspace(0.01, 0.15, 29);
    const sensPhi = P3.sensitivityVsConc(p, phiArr);
    const lamBArr = linspace(200, 3000, 60);
    const sensLam = P3.sensitivityVsPeriod(p, lamBArr);
    const Lb = P3.mbBeatUm(p);
    // spectral shift vs current
    const shiftI = Iarr.map((i) => shiftAt(p, i));
    // comparison spectrum: SMS simple vs SMS+NP
    const lam0 = p.lambdaNm;
    const win = p.lambdaNm < 1100 ? 12 : 25;
    const lam = linspace(lam0 - win, lam0 + win, 420);
    const Tsimple = P2.transmissionVsLambda(p3ToP2(p), lam, 0, dnP2);
    const Tnp = P2.transmissionVsLambda(p3ToP2(p), lam, 0, dnTot);
    // transmission vs length
    const zL = linspace(0, p.Lmmf_mm, 200);
    const TLno = P2.transmissionVsLength(p3ToP2(p), zL, 0, 0);
    const TLf = P2.transmissionVsLength(p3ToP2(p), zL, 0, dnTot);
    // long vs trans
    const Lm = p.Lmmf_mm / 1000;
    const longTh = Iarr.map((i) => shiftAt(p, i));
    const transCM = Iarr.map((i) => 1e3 * 4.5e-15 * P2.helmholtzB(p3ToP2(p), i) ** 2 * Lm / (p.lambdaNm * 1e-9));
    return {
      B, dnFluid, dnPe, dnTot, press, sens, shift, dnP2, mag,
      mmiNo, mmiF, radialNo, radialF, field2Dno, field2Df, radialCur, currents3,
      Iarr, pressI, dnPeI, dnTotI, magI, barr, fluidCurves,
      phiArr, sensPhi, lamBArr, sensLam, Lb, shiftI,
      lam, Tsimple, Tnp, zL, TLno, TLf, longTh, transCM,
    };
  }, [p]);

  function shiftAt(pp: P3.P3Params, i: number): number {
    const dn = P3.totalDnEff(pp, i);
    return P2.spectralShift(p3ToP2(pp), dn);
  }

  const {
    dnFluid, dnPe, dnTot, press, sens, shift, dnP2, mag,
    mmiNo, mmiF, radialNo, radialF, field2Dno, field2Df, radialCur, currents3,
    Iarr, pressI, dnPeI, dnTotI, magI, barr, fluidCurves,
    phiArr, sensPhi, lamBArr, sensLam, Lb, shiftI,
    lam, Tsimple, Tnp, zL, TLno, TLf, longTh, transCM,
  } = d;

  const mat = P3.NP_MATERIALS[p.np];

  return (
    <div className="space-y-5">
      <Card
        title="فاز ۳ — SMS + میکروخمش + نانوذرات مغناطیسی"
        subtitle="دندانه‌های پلیمری (~10cm) با Ferrofluid تزریق‌شده. میدان هلمهولتز نانوذرات را به زنجیر تبدیل می‌کند، فشار وارد کرده و Δn_eff را به‌شدت تغییر می‌دهد."
        badge={<FieldToggle on={fieldOn} onChange={setFieldOn} />}
      >
        <div className="rounded-xl border border-slate-700/40 bg-slate-950/40 p-2">
          <SchematicP3 fieldOn={fieldOn} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="مغناطش M" value={(mag / 1000).toFixed(1)} unit="kA/m" tone="rose" />
          <Stat label="فشار مغناطیسی" value={press.toFixed(0)} unit="Pa" tone="rose" />
          <Stat label="Δn فتوالاستیک" value={(dnPe * 1e7).toFixed(2)} unit="×10⁻⁷" tone="amber" />
          <Stat label="Δn سیال مغناطیسی" value={(dnFluid * 1000).toFixed(2)} unit="×10⁻³" tone="violet" />
          <Stat label="Δn_eff کل" value={(dnTot * 1000).toFixed(2)} unit="×10⁻³" tone="emerald" />
          <Stat label="حساسیت" value={sens.toFixed(3)} unit="nm/A" tone="cyan" />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[300px_1fr]">
        <ControlPanel>
          <Select
            label="نوع نانوذره"
            value={p.np}
            options={[
              { value: "ferrofluid", label: "Ferrofluid (Fe₃O₄)" },
              { value: "Fe3O4", label: "Fe₃O₄ — مگنتیت" },
              { value: "gFe2O3", label: "γ-Fe₂O₃ — ماگمیت" },
            ]}
            onChange={(v) => set("np" as keyof P3.P3Params, v as unknown as number)}
          />
          <Slider label="غلظت (کسر حجمی φ)" value={p.phi} min={0.01} max={0.15} step={0.005} onChange={(v) => set("phi", v)} />
          <Slider label="جریان هلمهولتز I" value={p.I_A} min={0} max={150} step={0.5} unit="A" onChange={(v) => set("I_A", v)} />
          <Slider label="طول MMF" value={p.Lmmf_mm} min={40} max={120} step={1} unit="mm" onChange={(v) => set("Lmmf_mm", v)} />
          <Slider label="طول میکروخمش" value={p.Lmb_mm} min={40} max={150} step={5} unit="mm" onChange={(v) => set("Lmb_mm", v)} />
          <Slider label="گام میکروخمش Λ" value={p.Lambda_mb_um} min={500} max={3000} step={50} unit="µm" onChange={(v) => set("Lambda_mb_um", v)} />
          <Slider label="ضریب جفت‌شدگی تبخیری η" value={p.eta} min={0.05} max={0.6} step={0.01} onChange={(v) => set("eta", v)} />
          <Slider label="تمرکز میدان در فاصله‌ها" value={p.concen} min={1} max={8} step={0.1} onChange={(v) => set("concen", v)} />
        </ControlPanel>

        <div className="space-y-5">
          {/* Nanoparticle selection analysis */}
          <Analysis tone="rose" title={`تحلیل نانوذره انتخاب‌شده: ${mat.label}`}>
            <p>
              {mat.note} مغناطش اشباع ذره <b className="text-rose-200">{mat.Ms} kA/m</b>. مکانیسم اصلی:
              <b> نیروی مغناطیسی (Kelvin force)</b> نه مغناضیس‌وارش. رابطه فشار
              <code className="mx-1 rounded bg-slate-800 px-1">P = ½·μ₀·M²·concen</code>
              و تغییر ضریب شکست ناشی از سیال مغناطیسی (tunable cladding)
              <code className="mx-1 rounded bg-slate-800 px-1">Δn_fluid = Δn_max·tanh(B/B_sat)</code>.
              <b> Ferrofluid بهینه است</b> زیرا سیال است، در ساختار میکروخمش تزریق می‌شود، غلظت قابل‌تنظیم است
              و بالاترین Δn_max را دارد. Fe₃O₄ مغناطش بیشتری برای نیرو دارد اما غیرسیال است.
            </p>
          </Analysis>

          {/* Pressure + photoelastic */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card title="فشار وارده توسط نانوذرات در برابر جریان" subtitle="P = ½·μ₀·M(I)²·concen">
              <Plot
                data={[{ x: Iarr, y: pressI, name: "P (Pa)", line: { color: FLD, width: 3 }, fill: "tozeroy" }]}
                layout={lay({
                  xaxis: { title: { text: "I (A)" }, ...ag },
                  yaxis: { title: { text: "فشار (Pa)" }, ...ag },
                })}
              />
            </Card>
            <Card title="تغییر ضریب شکست مؤثر — اثر فوتوالاستیک + سیال" subtitle="Δn_eff = η·Δn_fluid + Cpe·P">
              <Plot
                data={[
                  { x: Iarr, y: dnTotI.map((v) => v * 1000), name: "Δn_eff کل (×10⁻³)", line: { color: FLD, width: 3 } },
                  { x: Iarr, y: dnPeI.map((v) => v * 1000), name: "Δn فتوالاستیک", line: { color: "#fbbf24", width: 2, dash: "dot" } },
                ]}
                layout={lay({
                  xaxis: { title: { text: "I (A)" }, ...ag },
                  yaxis: { title: { text: "Δn (×10⁻³)" }, ...ag },
                })}
              />
            </Card>
          </div>

          {/* KEY comparison: SMS simple vs SMS+NP spectrum */}
          <Card
            title="مقایسه طیف انتقال: SMS ساده vs SMS + میکروخمش + نانوذره"
            subtitle="جابجایی طیفی در SMS+NP به‌مراتب بزرگ‌تر است (تقویت چند هزار برابری)."
          >
            <Plot
              data={[
                { x: lam, y: Tsimple, name: "SMS ساده (Δn≈faraday)", line: { color: NO, width: 2, dash: "dash" } },
                { x: lam, y: Tnp, name: "SMS + نانوذره", line: { color: FLD, width: 2.5 } },
              ]}
              layout={lay({
                xaxis: { title: { text: "طول موج (nm)" }, ...ag },
                yaxis: { title: { text: "انتقال" }, ...ag },
                annotations: [
                  { x: p.lambdaNm, y: 0.5, text: `Δλ≈${shift.toFixed(1)} nm`, font: { color: "#fbbf24", size: 11 }, showarrow: true, arrowcolor: "#fbbf24", ay: 40 },
                ],
              })}
            />
            <Analysis tone="emerald">
              <p>
                جابجایی طیفی از <b className="text-cyan-300">≈{(P2.spectralShift(p3ToP2(p), dnP2) * 1000).toFixed(2)} pm</b> (SMS ساده) به
                <b className="text-rose-300"> ≈{shift.toFixed(1)} nm</b> (SMS+NP) می‌رسد؛ یعنی تقویب حدود
                <b> {(shift / Math.max(1e-9, P2.spectralShift(p3ToP2(p), dnP2))).toFixed(0).slice(0, 4)}× برابر</b>.
                حساسیت به <b className="text-cyan-300">{sens.toFixed(3)} nm/A</b> می‌رسد.
              </p>
            </Analysis>
          </Card>

          {/* MMI with/without field — now LARGE change */}
          <Card title="الگوی MMI — با میدان و بدون میدان (تغییر واضح با نانوذره)" subtitle="Δn_eff بزرگ، الگو کاملاً جابه‌جا می‌شود">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <Plot
                data={[{ type: "heatmap", x: mmiNo.r_um, y: mmiNo.z_mm, z: mmiNo.I, colorscale: "Portland", zmin: 0, zmax: 1, colorbar: { thickness: 10 } }]}
                layout={lay({ title: { text: "بدون میدان", font: { size: 12, color: NO } }, xaxis: { title: { text: "r µm" }, ...ag }, yaxis: { title: { text: "z mm" }, ...ag }, margin: { l: 50, r: 8, t: 38, b: 42 } })}
              />
              <Plot
                data={[{ type: "heatmap", x: mmiF.r_um, y: mmiF.z_mm, z: mmiF.I, colorscale: "Portland", zmin: 0, zmax: 1, colorbar: { thickness: 10 } }]}
                layout={lay({ title: { text: `با میدان (I=${p.I_A} A)`, font: { size: 12, color: FLD } }, xaxis: { title: { text: "r µm" }, ...ag }, yaxis: { title: { text: "z mm" }, ...ag }, margin: { l: 50, r: 8, t: 38, b: 42 } })}
              />
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
              <Plot
                data={[
                  { x: radialNo.r_um, y: radialNo.I, name: "بدون میدان", line: { color: NO, width: 2, dash: "dash" } },
                  { x: radialF.r_um, y: radialF.I, name: "با میدان", line: { color: FLD, width: 2.5 } },
                ]}
                layout={lay({ title: { text: "پروفایل شعاعی خروجی", font: { size: 12 } }, xaxis: { title: { text: "r µm" }, ...ag }, yaxis: { title: { text: "|E|²" }, ...ag } })}
              />
              <Surface3D x={mmiF.r_um} y={mmiF.z_mm} z={mmiF.I} title="نمای سه‌بعدی MMI — با میدان" />
            </div>
            <Analysis tone="rose">
              <p>
                <b>چرا فاز ۳ به‌مراتب قوی‌تر از فاز ۲ است؟</b> در فاز ۲ تنها پوشش مغناطیسی-نوری ضعیفی (∼ چند×10⁻³)
                وجود دارد. اما در فاز ۳، نانوذرات تحت میدان، هم Δn سیال مغناطیسی و هم فشار مغناطیسی (نیروی Kelvin)
                را اضافه می‌کنند، در نتیجه Δn_eff کل ≈ <b className="text-rose-200">{(dnTot * 1000).toFixed(1)}×10⁻³</b> می‌شود.
                این اختلاف فازی بزرگ، الگوی تداخل را در طول MMF به‌طور کامل جابه‌جا و بازآرایی می‌کند؛ به همین دلیل
                پروفایل شدت فاز ۳ با فاز ۲ متفاوت است و با افزایش جریان به‌روشنی تغییر می‌کند.
              </p>
              <p className="mt-2">
                در I={p.I_A} A، جابه‌جایی فازی نسبی میان LP₀₁ و LP₀₂ حدود
                {(2 * Math.PI * dnTot * p.Lmmf_mm * 1000 * 0.006 / (p.lambdaNm * 1e-3)).toFixed(0)} رادیان (چندین فرینج کامل) است.
              </p>
            </Analysis>
          </Card>

          {/* Transverse field 2D/3D with/without */}
          <Card
            title="توزیع میدان مقطعی (دوبعدی و سه‌بعدی) در خروجی — با/بدون میدان"
            subtitle="الگوی تداخل حلقوی |E(x,y,L)|² با اعمال میدان کاملاً جابه‌جا می‌شود."
          >
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <Heatmap2D x={field2Dno.x} y={field2Dno.y} z={field2Dno.z} title="مقطع — بدون میدان" tone="no" />
              <Heatmap2D x={field2Df.x} y={field2Df.y} z={field2Df.z} title={`مقطع — با میدان (I=${p.I_A} A)`} tone="field" />
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
              <Surface3D x={field2Dno.x} y={field2Dno.y} z={field2Dno.z} title="سه‌بعدی — بدون میدان" />
              <Surface3D x={field2Df.x} y={field2Df.y} z={field2Df.z} title="سه‌بعدی — با میدان" />
            </div>
            <Analysis>
              <p>
                حلقه‌های روشن/تاریک متناظر با تداخل مدهای LP₀ₘ هستند. با میدان، Δn_eff≈{(dnTot * 1000).toFixed(1)}×10⁻³
                اختلاف فاز نسبی مدها را به‌شدت تغییر می‌دهد، در نتیجه جای حلقه‌ها جابه‌جا می‌شود — اثر میدان کاملاً مشهود است.
              </p>
            </Analysis>
          </Card>

          {/* Multi-current radial */}
          <Card title="پروفایل شعاعی خروجی — مقایسه جریان‌ها" subtitle={`|E(r,L)|² برای I = ${currents3.join(", ")} A`}>
            <Plot
              data={radialCur.map((rp, j) => ({
                x: rp.r, y: rp.I,
                name: `I=${rp.i} A`,
                line: {
                  color: ["#22d3ee", "#34d399", "#fbbf24", "#fb923c", "#f87171", "#fb7185"][j],
                  width: rp.i === 0 ? 2 : 3,
                  dash: rp.i === 0 ? "dash" : "solid",
                },
              }))}
              layout={lay({ xaxis: { title: { text: "شعاع r (µm)" }, ...ag }, yaxis: { title: { text: "|E(r,L)|² (نرمال)" }, ...ag } })}
            />
            <Analysis tone="cyan">
              <p>
                هر جریان منحنی متفاوتی می‌سازد: در I={currents3[1]} A جابه‌جایی آغاز می‌شود و در I=150 A چند فرینج کامل شیفت می‌کند.
                این پاسخ قوی، نتیجه مستقیم مکانیسم نانوذره (نیروی مغناطیسی + سیال مغناطیسی) است.
              </p>
            </Analysis>
          </Card>

          {/* Magnetization + ferrofluid Δn */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card title="مغناطش نانوذره در برابر جریان" subtitle="M(I) با اشباع لانژوین؛ M ∝ φ و نوع ذره">
              <Plot
                data={[{ x: Iarr, y: magI, name: "M (kA/m)", line: { color: FLD, width: 3 }, fill: "tozeroy" }]}
                layout={lay({ xaxis: { title: { text: "I (A)" }, ...ag }, yaxis: { title: { text: "M (kA/m)" }, ...ag } })}
              />
              <Analysis>
                <p>مغناطش از {(magI[0]).toFixed(0)} به {(magI[magI.length - 1]).toFixed(0)} kA/m می‌رسد و سپس اشباع می‌شود.</p>
              </Analysis>
            </Card>
            <Card title="Δn سیال مغناطیسی در برابر B — مقایسه ذرات" subtitle="Ferrofluid بالاترین Δn_max را دارد">
              <Plot
                data={[
                  { x: barr.map((b) => b * 1000), y: fluidCurves.ferrofluid, name: "Ferrofluid", line: { color: FLD, width: 3 } },
                  { x: barr.map((b) => b * 1000), y: fluidCurves.Fe3O4, name: "Fe₃O₄", line: { color: "#fbbf24", width: 2 } },
                  { x: barr.map((b) => b * 1000), y: fluidCurves.gFe2O3, name: "γ-Fe₂O₃", line: { color: NO, width: 2, dash: "dash" } },
                ]}
                layout={lay({ xaxis: { title: { text: "B (mT)" }, ...ag }, yaxis: { title: { text: "Δn_fluid" }, ...ag } })}
              />
            </Card>
          </div>

          {/* Spectral shift vs current */}
          <Card title="جابجایی طیفی Δλ در برابر جریان" subtitle="پاسخ مستقیم حسگر SMS+NP">
            <Plot
              data={[{ x: Iarr, y: shiftI, name: "Δλ (nm)", line: { color: "#34d399", width: 3 }, fill: "tozeroy" }]}
              layout={lay({
                xaxis: { title: { text: "I (A)" }, ...ag },
                yaxis: { title: { text: "Δλ (nm)" }, ...ag },
                annotations: [{ x: p.I_A, y: shift, text: `I=${p.I_A}A → Δλ=${shift.toFixed(2)}nm`, font: { color: "#fbbf24", size: 10 }, showarrow: true, arrowcolor: "#fbbf24", ay: -30 }],
              })}
            />
          </Card>

          {/* Sensitivity sweeps */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card title="حساسیت در برابر غلظت φ" subtitle="افزایش φ → فشار بیشتر → حساسیت بالاتر (با اشباع)">
              <Plot
                data={[{ x: phiArr, y: sensPhi, name: "dλ/dI (nm/A)", line: { color: FLD, width: 3 }, marker: { size: 4 } }]}
                layout={lay({ xaxis: { title: { text: "کسر حجمی φ" }, ...ag }, yaxis: { title: { text: "حساسیت (nm/A)" }, ...ag } })}
              />
            </Card>
            <Card title="حساسیت در برابر گام میکروخمش Λ" subtitle={`بیشینه در Λ منطبق بر دوره ضربان (Λ*≈${(Lb / 1000).toFixed(2)} mm)`}>
              <Plot
                data={[{ x: lamBArr.map((l) => l / 1000), y: sensLam, name: "dλ/dI", line: { color: NO, width: 2.5 }, fill: "tozeroy" }]}
                layout={lay({
                  xaxis: { title: { text: "Λ (mm)" }, ...ag },
                  yaxis: { title: { text: "حساسیت نسبی" }, ...ag },
                  shapes: [{ type: "line", x0: Lb / 1000, x1: Lb / 1000, y0: 0, y1: 1, yref: "paper", line: { color: "#fbbf24", dash: "dot" } }],
                })}
              />
            </Card>
          </div>

          {/* T(L) and long vs trans */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card title="انتقال SMS+NP در برابر طول MMF" subtitle="قله‌های بازتصویری با میدان جابه‌جا می‌شوند">
              <Plot
                data={[
                  { x: zL, y: TLno, name: "بدون میدان", line: { color: NO, width: 2, dash: "dash" } },
                  { x: zL, y: TLf, name: "با میدان", line: { color: FLD, width: 2.5 } },
                ]}
                layout={lay({ xaxis: { title: { text: "طول MMF (mm)" }, ...ag }, yaxis: { title: { text: "انتقال" }, ...ag } })}
              />
            </Card>
            <Card title="اثر میدان طولی vs عرضی (SMS+NP)" subtitle="طولی: فارادی+نیرو؛ عرضی: کاتن-موتون">
              <Plot
                data={[
                  { x: Iarr, y: longTh, name: "طولی Δλ (nm)", line: { color: FLD, width: 3 } },
                  { x: Iarr, y: transCM, name: "عرضی (C-M)", line: { color: NO, width: 2, dash: "dash" } },
                ]}
                layout={lay({ xaxis: { title: { text: "I (A)" }, ...ag }, yaxis: { title: { text: "پاسخ" }, ...ag } })}
              />
            </Card>
          </div>

          <Analysis tone="emerald" title="فاز پیشنهادی اصلاحی (فاز ۳)">
            <p>
              <b>بهینه‌سازی:</b> Ferrofluid با φ≈۰.۰۶–۰.۱۰ و گام میکروخمش Λ منطبق بر دوره بازتصویری،
              حساسیتی تا {sens.toFixed(2)} nm/A می‌دهد. برای کاهش نویح حرارتی، از Ferrofluid پایدار در
              محدوده دمایی آزمایش و کالیبراسیون دما استفاده کنید. ترکیب با حسگر دمای مرجع (FBG) توصیه
              می‌شود.
            </p>
          </Analysis>

          <Refs
            items={[
              "Sensors and Actuators A/B — حسگرهای فیبری مبتنی بر سیال مغناطیسی و تداخل چندمدی.",
              "IEEE Photonics J. — تأثیر Ferrofluid بر ضریب شکست و طیف انتقال SMS.",
              "Optica / OSA Continuum — حسگرهای میدان/جریان با نانوذرات Fe₃O₄ و γ-Fe₂O₃.",
              "Rosensweig R. E., Ferrohydrodynamics (Cambridge) — نیروی مغناطیسی و فشار Kelvin در سیال مغناطیسی.",
            ]}
          />
        </div>
      </div>
    </div>
  );
}
