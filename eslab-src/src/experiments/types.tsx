import React from "react";

export interface ParamDef { id: string; label: string; min: number; max: number; def: number; unit: string }

export interface ExperimentMeta {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  params: ParamDef[];
  prediction: { question: string; options: string[]; correct: number };
  analysis: string[];
  conclusion: React.ReactNode;
  definition: React.ReactNode;
  Component: React.ComponentType;
}

export function ExperimentLayout({ canvas, controls, bottom }: { canvas: React.ReactNode; controls: React.ReactNode; bottom?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-h-[380px] lg:min-h-[460px]">{canvas}</div>
        <div className="glass max-h-[70vh] overflow-y-auto rounded-2xl p-4 lg:max-h-[600px]">
          <div className="space-y-4">{controls}</div>
        </div>
      </div>
      {bottom && <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">{bottom}</div>}
    </div>
  );
}
