export type Lang = "en" | "fa";

export interface Translation {
  // Top bar / brand
  brand: { name: string; tagline: string };
  creator: { label: string; role: string };
  langToggle: { toFa: string; toEn: string };

  // Hero
  hero: {
    badge: string;
    title1: string;
    title2: string;
    description: string;
    startBtn: string;
    glossaryBtn: string;
    stats: { sections: string; sources: string; standards: string };
    features: { num: string; title: string; desc: string }[];
  };

  // Section common
  whatIs: string;
  sources: string;

  // Section 1
  sec1: {
    number: string;
    title: string;
    en: string;
    whatIs: string;
    analogy: string;
    cardParams: string;
    slider: string;
    bias: string;
    gain: string;
    drift: string;
    noise: string;
    scenarioCalibrated: string;
    scenarioAged: string;
    scenarioFailed: string;
    sampleNew: string;
    chartTitle: string;
    legendTrue: string;
    legendMeasured: string;
    statTrue: string;
    statRead: string;
    statError: string;
    note: string;
    source: string;
  };

  // Section 2
  sec2: {
    number: string;
    title: string;
    en: string;
    whatIs: string;
    analogy: string;
    cardParams: string;
    Q: string;
    R: string;
    speed: string;
    play: string;
    pause: string;
    reset: string;
    trustSensor: string;
    trustModel: string;
    jump: string;
    chartTitle: string;
    legendTrue: string;
    legendMeasured: string;
    legendEstimate: string;
    statK: string;
    statErr: string;
    statStep: string;
    note: string;
    source: string;
  };

  // Section 3
  sec3: {
    number: string;
    title: string;
    en: string;
    whatIs: string;
    analogy: string;
    cardControl: string;
    power: string;
    rate: string;
    play: string;
    pause: string;
    startup: string;
    steady: string;
    scram: string;
    chartTitle: string;
    legendIncore: string;
    legendExcore: string;
    statIncore: string;
    statExcore: string;
    statStatus: string;
    statusStable: string;
    statusChanging: string;
    statusScram: string;
    incoreDesc: string;
    excoreDesc: string;
    scramDesc: string;
    note: string;
    source: string;
  };

  // Section 4
  sec4: {
    number: string;
    title: string;
    en: string;
    whatIs: string;
    analogy: string;
    cardParams: string;
    temp: string;
    strain: string;
    nidx: string;
    play: string;
    pause: string;
    normal: string;
    hot: string;
    stressed: string;
    chartTitle: string;
    statShift: string;
    statDepth: string;
    note: string;
    source: string;
    fiberLabel: string;
  };

  // Section 5
  sec5: {
    number: string;
    title: string;
    en: string;
    whatIs: string;
    analogy: string;
    streaming: string;
    batch: string;
    pipelineTitle: string;
    stage1: string;
    stage2: string;
    stage3: string;
    stage4: string;
    stage5: string;
    statLatency: string;
    statRate: string;
    statResidual: string;
    statSync: string;
    syncActive: string;
    syncDiverged: string;
    chartTitle: string;
    play: string;
    pause: string;
    scenarioNormal: string;
    scenarioDrift: string;
    scenarioAttack: string;
    freqTitle: string;
    freqLabel: string;
    freqFast: string;
    freqMed: string;
    freqSlow: string;
    note: string;
    source: string;
  };

  // Section 6
  sec6: {
    number: string;
    title: string;
    en: string;
    whatIs: string;
    cardTitle: string;
    levelStation: string;
    levelBay: string;
    levelProcess: string;
    stationDesc: string;
    bayDesc: string;
    processDesc: string;
    detailTitle: string;
    protocol: string;
    equipment: string;
    latency: string;
    role: string;
    forYou: string;
    station: { protocol: string; equipment: string; latency: string; role: string; forYou: string };
    bay: { protocol: string; equipment: string; latency: string; role: string; forYou: string };
    process: { protocol: string; equipment: string; latency: string; role: string; forYou: string };
    note: string;
    source: string;
  };

  // Section 7
  sec7: {
    number: string;
    title: string;
    en: string;
    whatIs: string;
    colDim: string;
    colNuclear: string;
    colSmart: string;
    safety: string;
    nuclearSafety: string;
    smartSafety: string;
    software: string;
    nuclearSoftware: string;
    smartSoftware: string;
    protocol: string;
    nuclearProtocol: string;
    smartProtocol: string;
    cybersec: string;
    nuclearCyber: string;
    smartCyber: string;
    twin: string;
    nuclearTwin: string;
    smartTwin: string;
    opportunity: string;
    source: string;
  };

  // Glossary
  glossary: {
    number: string;
    title: string;
    en: string;
    intro: string;
    items: { fa: string; en: string; def: string; source: string }[];
  };

  // Footer
  footer: {
    basedOn: string;
    sourcesTitle: string;
    copyright: string;
  };
}

export const en: Translation = {
  brand: { name: "I&C Simulator", tagline: "Fiber Optic · Kalman · Digital Twin" },
  creator: { label: "Creator", role: "PhD Researcher, IASBS" },
  langToggle: { toFa: "فارسی", toEn: "English" },

  hero: {
    badge: "Interactive I&C Simulator",
    title1: "From Fiber Optics to Digital Twin:",
    title2: "How Reactors Become Intelligent",
    description:
      "An interactive simulator that brings seven key concepts of instrumentation & control systems to life. Each section begins with a simple analogy, then lets you touch the concept through sliders, scenarios, and live charts. No prior knowledge required.",
    startBtn: "Start Simulation",
    glossaryBtn: "Concept Reference",
    stats: { sections: "Interactive Sections", sources: "Scientific Sources", standards: "IEC/ISO Standards" },
    features: [
      { num: "01", title: "Sensor Errors", desc: "Bias · Gain · Drift" },
      { num: "02", title: "Kalman Filter", desc: "Predict · Update · K" },
      { num: "03", title: "Neutron Flux", desc: "Incore · Excore · SCRAM" },
      { num: "04", title: "Fiber Optic Sensor", desc: "Modal Interference" },
      { num: "05", title: "Digital Twin", desc: "Streaming · Residual" },
      { num: "06", title: "IEC 61850", desc: "Process · Bay · Station" },
      { num: "07", title: "Standards Map", desc: "Nuclear vs Smart Grid" },
    ],
  },

  whatIs: "WHAT IS IT?",
  sources: "Sources",

  sec1: {
    number: "01 / Sensor Errors",
    title: "Sensor Errors: Why Raw Numbers Lie",
    en: "Bias · Gain Error · Drift",
    whatIs:
      "A sensor never gives the true value directly. Raw output = true value + random noise + systematic errors. You can remove noise by averaging, but systematic errors stay in place and can only be tracked through state estimation.",
    analogy: "Like a kitchen scale that always reads 50g light — even if you weigh a hundred times, those 50g stay put. That's bias.",
    cardParams: "Parameters",
    slider: "slider",
    bias: "Bias — Constant Error",
    gain: "Gain Error",
    drift: "Drift — Time Change",
    noise: "Noise (σ)",
    scenarioCalibrated: "Calibrated",
    scenarioAged: "Aged Sensor",
    scenarioFailed: "Failure",
    sampleNew: "New Sample",
    chartTitle: "True Value vs Sensor Reading",
    legendTrue: "True Value",
    legendMeasured: "Sensor Reading",
    statTrue: "True Value",
    statRead: "Reading",
    statError: "Total Error",
    note: "Gain error grows with signal magnitude (proportional), but bias stays constant. This is why [Φ, b, g] are jointly estimated in state-space models.",
    source: "Kay, S.M. 'Fundamentals of Statistical Signal Processing' · IEC 61468 · IAEA-TECDOC on I&C",
  },

  sec2: {
    number: "02 / Kalman Filter",
    title: "Kalman Filter: Two Sources, One Better Estimate",
    en: "Predict · Update · Kalman Gain",
    whatIs:
      "You have two sources: a physics model says 'five minutes ago it was 22°, so probably 22.5° now', and a thermometer says 23° (but noisy). Kalman filter takes a weighted average — the weight depends on how much you trust each one.",
    analogy: "Like two friends: one says 10:00, the other 10:15 — if you trust them equally, you say 10:07; if the first is always 5 min fast, you weight the second more. K is that weight.",
    cardParams: "Filter Parameters",
    Q: "Model Uncertainty (Q)",
    R: "Sensor Uncertainty (R)",
    speed: "Sampling Rate",
    play: "Play",
    pause: "Pause",
    reset: "Reset",
    trustSensor: "Trust Sensor",
    trustModel: "Trust Model",
    jump: "Sudden Jump",
    chartTitle: "Live Chart: True / Measured / Estimate",
    legendTrue: "True Value",
    legendMeasured: "Measurement",
    legendEstimate: "Kalman Estimate",
    statK: "Gain K",
    statErr: "Est. Error",
    statStep: "Step",
    note: "Golden rule: K → 1 means trust the sensor (model uncertain). K → 0 means trust the model (sensor noisy). K is recomputed every step.",
    source: "Kalman, R.E. (1960) · Wan & Van der Merwe 'The Unscented Kalman Filter' · Maybeck, 'Stochastic Models, Estimation, and Control'",
  },

  sec3: {
    number: "03 / Neutron Flux",
    title: "Neutron Flux: The Reactor's Heartbeat",
    en: "Neutron Flux · Reactor Power · Incore/Excore",
    whatIs:
      "Neutron flux = number of neutrons crossing a unit area per unit time. It's directly tied to reactor power: higher flux means a stronger chain reaction. Incore sensors sit inside the core, Excore sensors sit outside — both report to the control room.",
    analogy: "Like a car's speedometer: the number on the dashboard results from thousands of events per second. A faulty speedo means wrong decisions — in a reactor, that threatens safety.",
    cardControl: "Reactor Control",
    power: "Target Power (%)",
    rate: "Rate of Change (ρ/s)",
    play: "Play",
    pause: "Pause",
    startup: "Startup",
    steady: "Steady",
    scram: "SCRAM",
    chartTitle: "Neutron Flux Over Time",
    legendIncore: "Incore",
    legendExcore: "Excore",
    statIncore: "Incore Flux",
    statExcore: "Excore Flux",
    statStatus: "Status",
    statusStable: "Stable",
    statusChanging: "Changing",
    statusScram: "SCRAM!",
    incoreDesc: "Inside the core — high accuracy, exposed to intense radiation",
    excoreDesc: "Outside the core — safer, indirect reading",
    scramDesc: "Emergency shutdown — flux drops in milliseconds",
    note: "Neutron flux is the reactor's foundational safety number. Per IEC 61226, incore flux sensors typically support Category A safety functions — the strictest design requirements.",
    source: "IEC 61468 (In-core neutron flux) · IEC 61226 (Safety classification) · IAEA NSS-G-1",
  },

  sec4: {
    number: "04 / Fiber Optic Sensor",
    title: "Fiber Optic Sensor: Reading Phenomena Through Light Spectra",
    en: "Modal Interference · FBG · Spectrum",
    whatIs:
      "Multiple optical modes travel through a fiber at slightly different speeds. When temperature or strain affects the fiber, the relative phase of these modes shifts. At the fiber end, their interference creates a spectral pattern that carries the signature of all disturbances combined.",
    analogy: "Like throwing stones into a pond — each wave from one point interferes with others, and the final pattern is the sum of all those stones.",
    cardParams: "Environmental Parameters",
    temp: "Temperature (°C)",
    strain: "Strain (με)",
    nidx: "Refractive Index Δn (×10⁻⁴)",
    play: "Play",
    pause: "Pause",
    normal: "Normal",
    hot: "Hot",
    stressed: "Stressed",
    chartTitle: "Interference Spectrum Output",
    statShift: "Peak Shift",
    statDepth: "Modulation Depth",
    note: "Research challenge: separate the contributions of temperature, strain, and refractive index from a single spectrum. This model is the f(Φ) in the Kalman observation function — nonlinear, requiring EKF or UKF.",
    source: "Lee, B. 'Review of optical fiber sensors' (2003) · Othonos 'Fiber Bragg Gratings' · Khan et al. 'Modal Interference Sensors'",
    fiberLabel: "Fiber Core — Modal Interference",
  },

  sec5: {
    number: "05 / Digital Twin",
    title: "Digital Twin: In Step With Reality",
    en: "Streaming · Pipeline · Residual Monitoring",
    whatIs:
      "Digital twin = a fit-for-purpose digital representation of a physical entity, synchronized in real-time. The key difference from batch: raw data is processed at the moment of production, not accumulated then processed later.",
    analogy: "Like a mirror showing your real reflection — not yesterday's photo. If the mirror takes an hour to update, it's no longer a mirror, it's a historical report.",
    streaming: "Streaming (Real-time)",
    batch: "Batch (Accumulated)",
    pipelineTitle: "Data Processing Pipeline",
    stage1: "Message Queue",
    stage2: "Stream Processing",
    stage3: "State Estimation",
    stage4: "Digital Twin",
    stage5: "Feedback / Alert",
    statLatency: "Latency",
    statRate: "Data Rate",
    statResidual: "Residual",
    statSync: "Sync Status",
    syncActive: "Active",
    syncDiverged: "Diverged",
    chartTitle: "Residual Monitoring",
    play: "Play",
    pause: "Pause",
    scenarioNormal: "Normal",
    scenarioDrift: "Model Drift",
    scenarioAttack: "Cyber Attack",
    freqTitle: "Sync Frequency",
    freqLabel: "Update Interval",
    freqFast: "Every 1 ms: heavy compute, suitable for neutron flux",
    freqMed: "Every 100 ms: practical balance, default",
    freqSlow: "Every hour: not a twin anymore, just a historical report",
    note: "Synchronization mechanism = the Kalman Update step. State estimation and model sync are two names for one mechanism.",
    source: "ISO 23247 (Digital Twin Framework) · IAEA-TECDOC on Digital Twins in Nuclear · Tao et al. 'Digital Twin in Industry'",
  },

  sec6: {
    number: "06 / IEC 61850",
    title: "Three-Tier Smart Substation Architecture",
    en: "Process · Bay · Station",
    whatIs:
      "IEC 61850 is the communication standard for digital substations. The architecture is split into three tiers: Process (sensors), Bay (intelligent devices), and Station (SCADA). Your fiber optic sensor naturally sits at the Process level.",
    cardTitle: "Architecture Tiers — Click Each",
    levelStation: "Station Level",
    levelBay: "Bay Level",
    levelProcess: "Process Level",
    stationDesc: "SCADA · HMI · MMS — Heavy compute",
    bayDesc: "PMU · IED · GOOSE — Under 4 ms",
    processDesc: "Sensors · Sampled Values — Fiber's home",
    detailTitle: "Level Details",
    protocol: "Protocol",
    equipment: "Equipment",
    latency: "Latency",
    role: "Role",
    forYou: "For Your Chapter",
    station: {
      protocol: "MMS (Manufacturing Message Specification)",
      equipment: "SCADA, HMI, central database",
      latency: "Hundreds of ms to seconds",
      role: "Control room & reporting",
      forYou: "Natural home for Digital Twin & UKF",
    },
    bay: {
      protocol: "GOOSE (Generic Object Oriented Substation Event)",
      equipment: "PMU (Phasor Measurement Unit) & IED",
      latency: "Under 4 milliseconds",
      role: "Critical event transfer",
      forYou: "Intermediary position, no heavy compute",
    },
    process: {
      protocol: "Sampled Values (IEC 61850-9-2)",
      equipment: "Sensors & transducers",
      latency: "Milliseconds",
      role: "Raw data acquisition",
      forYou: "Natural home for your fiber optic sensor",
    },
    note: "These protocols' security is covered by IEC 62351 — the smart-grid counterpart of IEC 63096 in the nuclear world.",
    source: "IEC 61850 · IEC 61850-8-1 (GOOSE & MMS) · IEC 61850-9-2 (SV) · IEC 62351 (Security)",
  },

  sec7: {
    number: "07 / Standards Map",
    title: "Two Worlds, Side by Side: Nuclear and Smart Grid",
    en: "Nuclear vs Smart Grid",
    whatIs:
      "Your fiber optics & AI expertise is general. But I&C in nuclear plants and power grids have their own rules and vocabularies. Your chapter needs to speak both languages.",
    colDim: "Dimension",
    colNuclear: "Nuclear Industry",
    colSmart: "Smart Grid",
    safety: "Safety Classification",
    nuclearSafety: "Categories A, B, C",
    smartSafety: "None; based on operational reliability",
    software: "Software Requirements",
    nuclearSoftware: "Category A safety software",
    smartSoftware: "No equivalent unified standard",
    protocol: "Communication Protocol",
    nuclearProtocol: "Plant-specific, proprietary",
    smartProtocol: "GOOSE, SV, MMS",
    cybersec: "Cybersecurity",
    nuclearCyber: "Nuclear I&C security controls",
    smartCyber: "GOOSE/SV/MMS security",
    twin: "Digital Twin",
    nuclearTwin: "No established framework — a gap to fill",
    smartTwin: "More mature, inspired by ISO 23247",
    opportunity:
      "Scientific opportunity: combining ISO 23247 with IEC 61513, IEC 60880, and IEC 63096, alongside a fiber optic sensor example with bias-aware state estimation — something no one has yet written coherently. This could be the spine of your chapter.",
    source:
      "IEC 61226:2020 · IEC 60880 · IEC 63096:2020 · IEC 62645 · IEC 61513 · ISO 23247 · IEC 61850 · IEC 62351 · IAEA Reports on Digital Twin in NPP",
  },

  glossary: {
    number: "08 / Glossary",
    title: "Quick Concept Reference",
    en: "Quick Reference",
    intro:
      "This table is for reference, not continuous reading. Every concept explained in the sections above is summarized here in one row.",
    items: [
      { fa: "Bias", en: "Bias", def: "Constant or slowly-varying sensor error, independent of signal magnitude, always in one direction.", source: "Estimation Theory" },
      { fa: "Gain Error", en: "Gain Error", def: "Error proportional to signal magnitude; grows as the value grows.", source: "Estimation Theory" },
      { fa: "Neutron Flux", en: "Neutron Flux", def: "Neutrons crossing unit area per unit time; corresponds to reactor power.", source: "IEC 61468" },
      { fa: "State Vector", en: "State Vector", def: "x = [Φ, b, g] — true value and error parameters estimated jointly.", source: "EKF / UKF" },
      { fa: "Kalman Gain", en: "Kalman Gain K", def: "Weight between prediction and measurement; recomputed each step.", source: "Kalman 1960" },
      { fa: "Observation Function", en: "Observation Function", def: "y = g × f(Φ) + b + noise; f(Φ) is the nonlinear fiber optical model.", source: "Estimation Theory" },
      { fa: "Streaming", en: "Streaming", def: "Processing each record at production time, with ms-to-second latency.", source: "Kafka / Flink" },
      { fa: "Residual Monitoring", en: "Residual Monitoring", def: "Tracking the prediction-measurement gap; growth signals error or anomaly.", source: "ISO 23247" },
      { fa: "IEC 61226", en: "IEC 61226", def: "Classification of plant functions into A, B, C by safety importance.", source: "IEC 61226:2020" },
      { fa: "IEC 60880", en: "IEC 60880", def: "Software requirements for Category A safety functions; US equivalent IEEE 7-4.3.2.", source: "IEC 60880" },
      { fa: "IEC 63096", en: "IEC 63096", def: "Cybersecurity controls for nuclear I&C, including sensors and actuators.", source: "IEC 63096:2020" },
      { fa: "IEC 61850", en: "IEC 61850", def: "Digital substation communication standard with three-tier architecture.", source: "IEC 61850" },
    ],
  },

  footer: {
    basedOn: "Based on the joint chapter with Dr. Bahman Zahouri.",
    sourcesTitle: "Sources",
    copyright: "Built for interactive I&C education · Version 1.0",
  },
};

export const fa: Translation = {
  brand: { name: "شبیه‌ساز تعاملی I&C", tagline: "Fiber Optic · Kalman · Digital Twin" },
  creator: { label: "سازنده", role: "پژوهشگر دکتری، IASBS" },
  langToggle: { toFa: "فارسی", toEn: "English" },

  hero: {
    badge: "شبیه‌ساز تعاملی مفاهیم I&C",
    title1: "از فیبر نوری تا دوقلوی دیجیتال:",
    title2: "چطور راکتور را هوشمند می‌کنند",
    description:
      "این شبیه‌ساز هفت مفهوم کلیدی سیستم‌های ابزار دقیق و کنترل را به‌صورت تعاملی نشان می‌دهد. هر بخش با یک تشبیه ساده شروع می‌شود، بعد با اسلایدر و نمودار زنده، آن مفهوم را لمس می‌کنید. هیچ پیش‌دانش لازم نیست.",
    startBtn: "شروع شبیه‌سازی",
    glossaryBtn: "مرجع مفاهیم",
    stats: { sections: "بخش تعاملی", sources: "منابع علمی", standards: "استاندارد IEC/ISO" },
    features: [
      { num: "۰۱", title: "خطاهای سنسور", desc: "Bias · Gain · Drift" },
      { num: "۰۲", title: "فیلتر کالمن", desc: "Predict · Update · K" },
      { num: "۰۳", title: "شار نوترون", desc: "Incore · Excore · SCRAM" },
      { num: "۰۴", title: "حسگر فیبر نوری", desc: "Modal Interference" },
      { num: "۰۵", title: "دوقلوی دیجیتال", desc: "Streaming · Residual" },
      { num: "۰۶", title: "معماری IEC 61850", desc: "Process · Bay · Station" },
      { num: "۰۷", title: "جدول استانداردها", desc: "Nuclear vs Smart Grid" },
    ],
  },

  whatIs: "این چیست؟",
  sources: "منابع",

  sec1: {
    number: "۰۱ / Sensor Errors",
    title: "خطاهای سنسور: چرا عدد خام دروغ می‌گوید؟",
    en: "Bias · Gain Error · Drift",
    whatIs:
      "سنسور هیچ‌وقت مقدار واقعی را مستقیم نمی‌دهد. خروجی خام = مقدار واقعی + نویز تصادفی + خطاهای سیستماتیک. نویز را با میانگین‌گیری حذف می‌کنید، اما خطاهای سیستماتیک سر جای خودشان می‌مانند و فقط با تخمین حالت قابل ردیابی‌اند.",
    analogy: "مثل ترازوی آشپزخانه که همیشه ۵۰ گرم کمتر نشان می‌دهد — حتی اگر صد بار وزن کنید، آن ۵۰ گرم سر جایش است. این همان بایاس است.",
    cardParams: "پارامترها",
    slider: "اسلایدر",
    bias: "بایاس (Bias) — خطای ثابت",
    gain: "خطای گین (Gain Error)",
    drift: "دریفت (Drift) — تغییر در زمان",
    noise: "نویز (Noise σ)",
    scenarioCalibrated: "کالیبره‌شده",
    scenarioAged: "سنسور کهنه",
    scenarioFailed: "خرابی",
    sampleNew: "نمونه‌ی جدید",
    chartTitle: "مقایسه‌ی مقدار واقعی و خوانش سنسور",
    legendTrue: "مقدار واقعی",
    legendMeasured: "خوانش سنسور",
    statTrue: "مقدار واقعی",
    statRead: "خوانش سنسور",
    statError: "خطای کل",
    note: "خطای گین با بزرگ‌تر شدن سیگنال بیشتر می‌شود (متناسب)، اما بایاس ثابت می‌ماند. به همین دلیل است که [Φ, b, g] به‌صورت مشترک تخمین زده می‌شود.",
    source: "Kay, S.M. 'Fundamentals of Statistical Signal Processing' · IEC 61468 · IAEA-TECDOC on I&C",
  },

  sec2: {
    number: "۰۲ / Kalman Filter",
    title: "فیلتر کالمن: دو منبع اطلاعات، یک تخمین بهتر",
    en: "Predict · Update · Kalman Gain",
    whatIs:
      "دو منبع دارید: مدل فیزیکی می‌گوید «پنج دقیقه پیش ۲۲ درجه بود، احتمالاً الان ۲۲٫۵ است» و ترمومتر می‌گوید ۲۳ درجه (ولی نویز دارد). فیلتر کالمن این دو را وزن‌دار میانگین می‌گیرد؛ وزن هرکدام به این بستگی دارد که چقدر به آن مطمئن هستید.",
    analogy: "مثل این است که دوستانتان یکی بگوید ۱۰:۰۰ و دیگری ۱۰:۱۵ — اگر به هر دو مساوی اعتماد دارید، می‌گویید ۱۰:۰۷؛ اگر اولی همیشه ۵ دقیقه جلو باشد، به دومی بیشتر وزن می‌دهید. K همان وزن است.",
    cardParams: "پارامترهای فیلتر",
    Q: "عدم قطعیت مدل (Q)",
    R: "عدم قطعیت سنسور (R)",
    speed: "سرعت نمونه‌برداری",
    play: "پخش",
    pause: "توقف",
    reset: "بازنشانی",
    trustSensor: "اعتماد به سنسور",
    trustModel: "اعتماد به مدل",
    jump: "جهش ناگهانی",
    chartTitle: "نمودار زنده: واقعی / اندازه‌گیری / تخمین",
    legendTrue: "مقدار واقعی",
    legendMeasured: "اندازه‌گیری",
    legendEstimate: "تخمین کالمن",
    statK: "بهره‌ی K",
    statErr: "خطای تخمین",
    statStep: "گام",
    note: "قاعده‌ی طلایی: اگر K → ۱ یعنی فیلتر بیشتر به سنسور تکیه می‌کند (مدل نامطمئن است). اگر K → ۰ یعنی مدل حرف آخر را می‌زند (سنسور نویزی است). K در هر گام دوباره حساب می‌شود.",
    source: "Kalman, R.E. (1960) · Wan & Van der Merwe 'The Unscented Kalman Filter' · Maybeck, 'Stochastic Models, Estimation, and Control'",
  },

  sec3: {
    number: "۰۳ / Neutron Flux",
    title: "شار نوترون: ضربان قلب راکتور",
    en: "Neutron Flux · Reactor Power · Incore/Excore",
    whatIs:
      "شار نوترون = تعداد نوترون‌هایی که در واحد زمان از واحد سطح عبور می‌کنند. مستقیماً با توان راکتور رابطه دارد: هرچه شار بیشتر، واکنش زنجیره‌ای شدیدتر. سنسورهای Incore داخل هسته و Excore بیرون آن را می‌سنجند تا اتاق کنترل بداند راکتور در چه توانی کار می‌کند.",
    analogy: "مثل سرعت‌سنج ماشین: عدد روی صفحه، نتیجه‌ی هزاران اتفاق در ثانیه است. اگر سرعت‌سنج خطا داشته باشد، راننده اشتباه تصمیم می‌گیرد — در راکتور، این تصمیم ایمنی را تهدید می‌کند.",
    cardControl: "کنترل راکتور",
    power: "توان هدف (٪)",
    rate: "نرخ تغییر (ρ/s)",
    play: "پخش",
    pause: "توقف",
    startup: "استارت",
    steady: "پایدار",
    scram: "SCRAM",
    chartTitle: "شار نوترون در زمان",
    legendIncore: "Incore",
    legendExcore: "Excore",
    statIncore: "شار Incore",
    statExcore: "شار Excore",
    statStatus: "وضعیت",
    statusStable: "پایدار",
    statusChanging: "در حال تغییر",
    statusScram: "SCRAM!",
    incoreDesc: "داخل هسته، دقت بالا، در معرض تابش شدید",
    excoreDesc: "بیرون هسته، امن‌تر، خوانش غیرمستقیم",
    scramDesc: "خاموشی اضطراری، شار در میلی‌ثانیه افت می‌کند",
    note: "شار نوترون عدد پایه‌ی ایمنی راکتور است. طبق IEC 61226، سنسورهای شار نوترون Incore معمولاً تابع دسته‌ی A (ایمنی حیاتی) را پشتیبانی می‌کنند، یعنی سخت‌ترین الزامات طراحی.",
    source: "IEC 61468 (In-core neutron flux) · IEC 61226 (Safety classification) · IAEA NSS-G-1",
  },

  sec4: {
    number: "۰۴ / Fiber Optic Sensor",
    title: "حسگر فیبر نوری: خواندن پدیده از روی طیف نور",
    en: "Modal Interference · FBG · Spectrum",
    whatIs:
      "چند مود نوری با سرعت‌های کمی متفاوت در یک فیبر منتشر می‌شوند. وقتی دما یا کرنش روی فیبر اثر می‌گذارد، فاز نسبی این مودها جابه‌جا می‌شود. در انتهای فیبر، تداخل آن‌ها یک الگوی طیفی می‌سازد که اثر همه‌ی اختلال‌ها را با هم حمل می‌کند.",
    analogy: "مثل پرتاب چند سنگ در برکه — هر موجی که از یک نقطه شروع می‌شود با بقیه تداخل می‌کند و الگوی نهایی، حاصل جمع همه‌ی آن سنگ‌هاست.",
    cardParams: "پارامترهای محیطی",
    temp: "دما (Temperature °C)",
    strain: "کرنش (Strain με)",
    nidx: "تغییر ضریب شکست (Δn × ۱۰⁻⁴)",
    play: "پخش",
    pause: "توقف",
    normal: "عادی",
    hot: "داغ",
    stressed: "تحت فشار",
    chartTitle: "طیف تداخلی خروجی (Spectrum)",
    statShift: "جابه‌جایی پیک",
    statDepth: "عمق تداخل",
    note: "چالش پژوهش: از روی یک طیف واحد، سهم دما و کرنش و ضریب شکست را از هم جدا کنید. این مدل، همان f(Φ) در فیلتر کالمن است — یعنی تابع مشاهده‌ی سنسور. برای سیستم غیرخطی به EKF یا UKF نیاز است.",
    source: "Lee, B. 'Review of optical fiber sensors' (2003) · Othonos 'Fiber Bragg Gratings' · Khan et al. 'Modal Interference Sensors'",
    fiberLabel: "Fiber Core — Modal Interference",
  },

  sec5: {
    number: "۰۵ / Digital Twin",
    title: "دوقلوی دیجیتال: هم‌قدم با واقعیت",
    en: "Streaming · Pipeline · Residual Monitoring",
    whatIs:
      "دوقلوی دیجیتال = بازنمایی دیجیتالِ متناسب با هدف از یک عنصر فیزیکی، همراه با هم‌گام‌سازی زمان‌واقعی. تفاوت با batch: داده‌ی خام در لحظه‌ی تولید پردازش می‌شود، نه انباشته و بعد.",
    analogy: "مثل آینه‌ای که جسم واقعی را نشان می‌دهد — نه عکس دیروز. اگر یک ساعت طول بکشد تا آینه آپدیت شود، دیگر آینه نیست، یک گزارش تاریخی است.",
    streaming: "Streaming (زمان‌واقعی)",
    batch: "Batch (انباشتی)",
    pipelineTitle: "پایپلاین پردازش داده",
    stage1: "صف پیام",
    stage2: "پردازش استریم",
    stage3: "تخمین حالت",
    stage4: "دوقلوی دیجیتال",
    stage5: "بازخورد / هشدار",
    statLatency: "تأخیر (Latency)",
    statRate: "نرخ داده",
    statResidual: "باقیمانده (Residual)",
    statSync: "وضعیت هم‌گام‌سازی",
    syncActive: "فعال",
    syncDiverged: "واگرا",
    chartTitle: "پایش باقیمانده (Residual Monitoring)",
    play: "پخش",
    pause: "توقف",
    scenarioNormal: "عادی",
    scenarioDrift: "انحراف مدل",
    scenarioAttack: "حمله‌ی سایبری",
    freqTitle: "فرکانس هم‌گام‌سازی",
    freqLabel: "بازه‌ی به‌روزرسانی",
    freqFast: "هر ۱ ms: محاسبات کمرشکن، برای شار نوترون مناسب",
    freqMed: "هر ۱۰۰ ms: تعادل عملی، پیش‌فرض این شبیه‌ساز",
    freqSlow: "هر ۱ ساعت: دیگر دوقلو نیست، گزارش تاریخی است",
    note: "مکانیزم هم‌گام‌سازی = همان مرحله‌ی Update فیلتر کالمن. تخمین حالت و هم‌گام‌سازی، دو نام برای یک مکانیزم‌اند.",
    source: "ISO 23247 (Digital Twin Framework) · IAEA-TECDOC on Digital Twins in Nuclear · Tao et al. 'Digital Twin in Industry'",
  },

  sec6: {
    number: "۰۶ / IEC 61850",
    title: "معماری سه‌سطحی پست برق هوشمند",
    en: "Process · Bay · Station",
    whatIs:
      "IEC 61850 استاندارد ارتباطی پست برق دیجیتال است. معماری را به سه سطح می‌شکند: فرآیند (سنسورها)، بیز (دستگاه‌های هوشمند) و ایستگاه (SCADA). جایگاه سنسور فیبر نوری شما در سطح فرآیند است.",
    cardTitle: "سطوح معماری — روی هرکدام کلیک کنید",
    levelStation: "سطح ایستگاه (Station)",
    levelBay: "سطح بیز (Bay)",
    levelProcess: "سطح فرآیند (Process)",
    stationDesc: "SCADA · HMI · MMS — جای محاسبات سنگین",
    bayDesc: "PMU · IED · GOOSE — زیر ۴ میلی‌ثانیه",
    processDesc: "سنسورها · Sampled Values — جایگاه فیبر نوری",
    detailTitle: "جزئیات سطح",
    protocol: "پروتکل",
    equipment: "تجهیزات",
    latency: "تأخیر",
    role: "نقش",
    forYou: "برای فصل شما",
    station: {
      protocol: "MMS (Manufacturing Message Specification)",
      equipment: "SCADA، HMI، پایگاه‌داده‌ی مرکزی",
      latency: "صدها میلی‌ثانیه تا ثانیه",
      role: "اتاق کنترل و گزارش‌گیری",
      forYou: "جای طبیعی دوقلوی دیجیتال و UKF",
    },
    bay: {
      protocol: "GOOSE (Generic Object Oriented Substation Event)",
      equipment: "PMU (Phasor Measurement Unit) و IED",
      latency: "زیر ۴ میلی‌ثانیه",
      role: "انتقال رویدادهای بحرانی",
      forYou: "جایگاه واسط، بدون محاسبات سنگین",
    },
    process: {
      protocol: "Sampled Values (IEC 61850-9-2)",
      equipment: "سنسورها و ترانسدیوسرها",
      latency: "میلی‌ثانیه",
      role: "جمع‌آوری داده‌ی خام",
      forYou: "جایگاه طبیعی سنسور فیبر نوری شما",
    },
    note: "امنیت این پروتکل‌ها با IEC 62351 پوشش داده می‌شود — همان نقشی که IEC 63096 در دنیای هسته‌ای بازی می‌کند.",
    source: "IEC 61850 · IEC 61850-8-1 (GOOSE & MMS) · IEC 61850-9-2 (SV) · IEC 62351 (Security)",
  },

  sec7: {
    number: "۰۷ / Standards Map",
    title: "دو دنیا، کنار هم: هسته‌ای و هوشمند",
    en: "Nuclear vs Smart Grid",
    whatIs:
      "تخصص فیبر نوری و هوش مصنوعی شما عمومی است. اما I&C در نیروگاه هسته‌ای و شبکه‌ی برق، هرکدام قواعد و واژگان خودشان را دارند. فصل شما باید با هر دو زبان حرف بزند.",
    colDim: "بُعد",
    colNuclear: "صنعت هسته‌ای",
    colSmart: "شبکه‌ی هوشمند",
    safety: "طبقه‌بندی ایمنی",
    nuclearSafety: "دسته‌های A، B، C",
    smartSafety: "ندارد؛ مبتنی بر قابلیت اطمینان عملیاتی",
    software: "الزامات نرم‌افزار",
    nuclearSoftware: "نرم‌افزار ایمنی دسته A",
    smartSoftware: "استاندارد یکپارچه‌ی مشابهی ندارد",
    protocol: "پروتکل ارتباطی",
    nuclearProtocol: "اختصاصی و داخلی هر نیروگاه",
    smartProtocol: "GOOSE، SV و MMS",
    cybersec: "امنیت سایبری",
    nuclearCyber: "کنترل‌های امنیتی I&C هسته‌ای",
    smartCyber: "امنیت GOOSE، SV و MMS",
    twin: "دوقلوی دیجیتال",
    nuclearTwin: "چارچوب جاافتاده ندارد — خلأ فرصت",
    smartTwin: "بالغ‌تر، با الهام از ISO 23247",
    opportunity:
      "فرصت علمی: ترکیب ISO 23247 با الزامات IEC 61513 و IEC 60880 و IEC 63096، همراه با مثال سنسور فیبر نوری و تخمین حالت bias-aware — چیزی است که هنوز کسی منسجم ننوشته است. این می‌تواند محور اصلی فصل شما باشد.",
    source:
      "IEC 61226:2020 · IEC 60880 · IEC 63096:2020 · IEC 62645 · IEC 61513 · ISO 23247 · IEC 61850 · IEC 62351 · IAEA Reports on Digital Twin in NPP",
  },

  glossary: {
    number: "۰۸ / Glossary",
    title: "مرجع سریع مفاهیم",
    en: "Quick Reference",
    intro:
      "این جدول برای مراجعه است، نه برای خواندن پیوسته. هر مفهوم که در بخش‌های قبل توضیح داده شد، اینجا در یک سطر خلاصه شده است.",
    items: [
      { fa: "بایاس", en: "Bias", def: "خطای ثابت یا کندتغییر سنسور، مستقل از اندازه‌ی سیگنال، همیشه در یک جهت.", source: "Estimation Theory" },
      { fa: "خطای گین", en: "Gain Error", def: "خطای متناسب با اندازه‌ی سیگنال؛ با بزرگ‌تر شدن مقدار، بزرگ‌تر می‌شود.", source: "Estimation Theory" },
      { fa: "شار نوترون", en: "Neutron Flux", def: "نوترون عبوری از واحد سطح در واحد زمان؛ متناظر با توان راکتور.", source: "IEC 61468" },
      { fa: "بردار حالت", en: "State Vector", def: "x = [Φ, b, g] — مقدار واقعی و پارامترهای خطا با هم تخمین زده می‌شوند.", source: "EKF / UKF" },
      { fa: "بهره‌ی کالمن", en: "Kalman Gain K", def: "وزن بین پیش‌بینی و اندازه‌گیری؛ در هر گام دوباره حساب می‌شود.", source: "Kalman 1960" },
      { fa: "تابع مشاهده", en: "Observation Function", def: "y = g × f(Φ) + b + نویز؛ f(Φ) مدل نوری فیبر و غیرخطی است.", source: "Estimation Theory" },
      { fa: "استریمینگ", en: "Streaming", def: "پردازش هر رکورد در لحظه‌ی تولید، با تأخیر میلی‌ثانیه تا چند ثانیه.", source: "Kafka / Flink" },
      { fa: "پایش باقیمانده", en: "Residual Monitoring", def: "رصد فاصله‌ی پیش‌بینی و اندازه‌گیری؛ بزرگ‌شدنش نشانه‌ی خطا یا آنومالی.", source: "ISO 23247" },
      { fa: "IEC 61226", en: "IEC 61226", def: "دسته‌بندی توابع نیروگاه به A، B، C بر اساس اهمیت ایمنی.", source: "IEC 61226:2020" },
      { fa: "IEC 60880", en: "IEC 60880", def: "الزامات نرم‌افزار برای توابع ایمنی دسته A؛ معادل آمریکایی IEEE 7-4.3.2.", source: "IEC 60880" },
      { fa: "IEC 63096", en: "IEC 63096", def: "کنترل‌های امنیت سایبری I&C هسته‌ای، شامل سنسورها و عملگرها.", source: "IEC 63096:2020" },
      { fa: "IEC 61850", en: "IEC 61850", def: "استاندارد ارتباطی پست برق دیجیتال با معماری سه‌سطحی.", source: "IEC 61850" },
    ],
  },

  footer: {
    basedOn: "بر اساس فصل مشترک با دکتر بهمن ظهوری.",
    sourcesTitle: "منابع",
    copyright: "ساخته‌شده برای آموزش تعاملی مفاهیم I&C · نسخه‌ی ۱٫۰",
  },
};

export const translations: Record<Lang, Translation> = { en, fa };
