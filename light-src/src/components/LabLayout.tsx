import type { ReactNode } from "react";

interface Props {
  title: string;
  emoji: string;
  subtitle?: string;
  tools?: ReactNode;
  info?: ReactNode;
  children: ReactNode;
  bottom?: ReactNode;
}

export default function LabLayout({ title, emoji, subtitle, tools, info, children, bottom }: Props) {
  return (
    <div className="mx-auto max-w-[1500px] px-3 pb-8">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <span className="text-4xl">{emoji}</span>
        <div>
          <h1 className="text-2xl font-black text-slate-800 md:text-3xl">{title}</h1>
          {subtitle && <p className="text-sm font-bold text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[250px_minmax(0,1fr)_300px]">
        <div className="order-2 space-y-4 xl:order-1">{tools}</div>
        <div className="order-1 xl:order-2">{children}</div>
        <div className="order-3 space-y-4">{info}</div>
      </div>
      {bottom && <div className="mt-4">{bottom}</div>}
    </div>
  );
}
