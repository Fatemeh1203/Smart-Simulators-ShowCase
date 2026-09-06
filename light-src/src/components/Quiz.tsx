import { useState } from "react";
import { playChime } from "../lab/store";
import { KidButton } from "./ui";

export interface QuizOption {
  text: string;
  emoji: string;
  correct?: boolean;
}
export interface QuizData {
  question: string;
  options: QuizOption[];
  afterCorrect: string;
  afterWrong: string;
}

export default function Quiz({ quiz, onDone }: { quiz: QuizData; onDone: (wasCorrect: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const correct = picked !== null && !!quiz.options[picked].correct;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/70 p-4 backdrop-blur-sm">
      <div className="bounce-in w-full max-w-lg rounded-[32px] border-8 border-yellow-300 bg-white p-6 shadow-2xl">
        <div className="mb-1 text-center text-sm font-black text-purple-500">🤔 حالت «حدس بزن»</div>
        <h2 className="mb-5 text-center text-2xl font-black leading-10 text-slate-800">{quiz.question}</h2>
        <div className="space-y-3">
          {quiz.options.map((op, i) => {
            const isPicked = picked === i;
            let cls = "border-slate-200 bg-slate-50 hover:bg-yellow-50 hover:border-yellow-300";
            if (picked !== null) {
              if (op.correct) cls = "border-green-400 bg-green-100";
              else if (isPicked) cls = "border-rose-400 bg-rose-100";
              else cls = "border-slate-200 bg-slate-50 opacity-60";
            }
            return (
              <button
                key={i}
                type="button"
                disabled={picked !== null}
                onClick={() => {
                  setPicked(i);
                  playChime(op.correct ? "success" : "wrong");
                }}
                className={`flex w-full items-center gap-3 rounded-2xl border-4 p-3 text-right text-lg font-bold text-slate-700 transition ${cls}`}
              >
                <span className="text-3xl">{op.emoji}</span>
                {op.text}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <div className="bounce-in mt-5 text-center">
            <p className={`rounded-2xl p-3 text-base font-bold ${correct ? "bg-green-50 text-green-800" : "bg-orange-50 text-orange-800"}`}>
              {correct ? `✅ ${quiz.afterCorrect}` : `🔍 ${quiz.afterWrong}`}
            </p>
            <KidButton onClick={() => onDone(correct)} color="bg-purple-500 text-white" className="mt-4">
              🧪 برویم آزمایش کنیم!
            </KidButton>
          </div>
        )}
      </div>
    </div>
  );
}
