import { cn } from "../utils/cn";

export interface GuessOption {
  id: string;
  label: string;
  emoji: string;
}

interface Props {
  question: string;
  options: GuessOption[];
  correctId?: string; // اگر مشخص باشد بعد از انتخاب، درست/غلط را نشان می‌دهد (پس از آزمایش)
  chosen: string | null;
  revealed: boolean;
  onChoose: (id: string) => void;
}

export default function GuessBox({ question, options, correctId, chosen, revealed, onChoose }: Props) {
  return (
    <div className="rounded-2xl bg-gradient-to-l from-fuchsia-600/30 to-violet-600/30 border border-fuchsia-300/30 p-3">
      <div className="font-black text-fuchsia-100 mb-2">🤔 اول حدس بزن!</div>
      <p className="text-sm leading-6 mb-2">{question}</p>
      <div className="grid gap-2">
        {options.map((o) => {
          const isChosen = chosen === o.id;
          const isCorrect = revealed && correctId === o.id;
          const isWrong = revealed && isChosen && correctId !== o.id;
          return (
            <button
              key={o.id}
              onClick={() => !revealed && onChoose(o.id)}
              className={cn(
                "text-right rounded-xl px-3 py-2 font-bold transition-all border",
                isCorrect
                  ? "bg-green-500/40 border-green-300"
                  : isWrong
                  ? "bg-rose-500/40 border-rose-300"
                  : isChosen
                  ? "bg-white/25 border-white/60 scale-[1.02]"
                  : "bg-white/10 border-white/10 hover:bg-white/20"
              )}
            >
              {o.emoji} {o.label} {isCorrect && "✅"} {isWrong && "❌"}
            </button>
          );
        })}
      </div>
      {chosen && !revealed && <p className="text-xs mt-2 text-fuchsia-100">👍 حالا آزمایش کن و ببین حدست درست بود یا نه!</p>}
      {revealed && chosen && (
        <p className="text-sm mt-2 font-bold">
          {chosen === correctId ? "🎉 آفرین! حدست درست بود." : "😊 اشکالی ندارد! حالا با آزمایش یاد گرفتی."}
        </p>
      )}
    </div>
  );
}
