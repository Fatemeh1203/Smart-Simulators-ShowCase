import React, { useState } from 'react';
import { toFaDigit, numberToWordsFa } from '../../utils/numberWords';
import { Sparkles, ArrowDown, RefreshCw, Check, Award } from 'lucide-react';

export const SimChapter1: React.FC = () => {
  // Place value state (7 digits: Millions down to ones)
  const [digits, setDigits] = useState<number[]>([2, 4, 5, 1, 3, 0, 8]);
  
  // Input-Output Machine state
  const [machineInput, setMachineInput] = useState<number>(4);
  const [machineRule, setMachineRule] = useState<string>('add5');
  const [machineOutput, setMachineOutput] = useState<number | null>(9);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Pattern game state
  const [patternStep, setPatternStep] = useState<number>(0);
  const patternQuestions = [
    { series: [3, 6, 9, 12], options: [14, 15, 16], correct: 15, rule: "+۳" },
    { series: [2, 4, 8, 16], options: [24, 30, 32], correct: 32, rule: "×۲" },
    { series: [20, 17, 14, 11], options: [8, 9, 10], correct: 8, rule: "-۳" },
  ];
  const [patternSelected, setPatternSelected] = useState<number | null>(null);
  const [patternSolved, setPatternSolved] = useState<boolean>(false);

  // Calculate total number from digits array
  // digits index: 0->Million, 1->HThous, 2->TThous, 3->Thous, 4->Hund, 5->Tens, 6->Ones
  const totalNumber = digits[0] * 1000000 + 
                      digits[1] * 100000 + 
                      digits[2] * 10000 + 
                      digits[3] * 1000 + 
                      digits[4] * 100 + 
                      digits[5] * 10 + 
                      digits[6];

  const handleDigitChange = (index: number, delta: number) => {
    const newDigits = [...digits];
    let val = newDigits[index] + delta;
    if (val > 9) val = 0;
    if (val < 0) val = 9;
    newDigits[index] = val;
    setDigits(newDigits);
  };

  const calculateMachine = (input: number, rule: string) => {
    setIsCalculating(true);
    setTimeout(() => {
      let res = 0;
      if (rule === 'add5') res = input + 5;
      if (rule === 'mul3') res = input * 3;
      if (rule === 'sub2') res = input - 2;
      setMachineOutput(res);
      setIsCalculating(false);
    }, 600);
  };

  const handleRuleChange = (rule: string) => {
    setMachineRule(rule);
    calculateMachine(machineInput, rule);
  };

  const handleInputChange = (val: number) => {
    if (val < 0) val = 0;
    if (val > 50) val = 50;
    setMachineInput(val);
    calculateMachine(val, machineRule);
  };

  const currentPattern = patternQuestions[patternStep];

  const handlePatternAnswer = (opt: number) => {
    setPatternSelected(opt);
    if (opt === currentPattern.correct) {
      setPatternSolved(true);
    }
  };

  const nextPattern = () => {
    setPatternStep((prev) => (prev + 1) % patternQuestions.length);
    setPatternSelected(null);
    setPatternSolved(false);
  };

  return (
    <div className="space-y-10 py-4">
      {/* SECTION 1: PLACE VALUE TABLE */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-blue-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-md shadow-blue-200">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">جدول ارزش مکانی تا میلیون</h3>
            <p className="text-slate-500 text-sm md:text-base">با کلیک روی دکمه‌های + و - رقم‌ها را تغییر بده و تغییر عدد را ببین!</p>
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[700px] border-4 border-blue-300 rounded-2xl overflow-hidden shadow-inner">
            {/* Headers (Classes) */}
            <div className="grid grid-cols-7 text-center font-bold text-white bg-blue-600 text-lg py-2 border-b-4 border-blue-300">
              <div className="col-span-1 bg-amber-500 py-1 rounded-t-lg mx-1">میلیون</div>
              <div className="col-span-3 bg-teal-600 py-1 rounded-t-lg mx-1">هزار</div>
              <div className="col-span-3 bg-indigo-600 py-1 rounded-t-lg mx-1">یکی‌ها</div>
            </div>

            {/* Subheaders (Place values) */}
            <div className="grid grid-cols-7 text-center font-semibold text-xs md:text-sm bg-blue-50 py-2 border-b-2 border-blue-200 text-slate-700">
              <div className="border-l border-blue-200">یکان میلیون</div>
              <div className="border-l border-blue-200">صدگان هزار</div>
              <div className="border-l border-blue-200">دهگان هزار</div>
              <div className="border-l border-blue-200">یکان هزار</div>
              <div className="border-l border-blue-200">صدگان</div>
              <div className="border-l border-blue-200">دهگان</div>
              <div>یکان</div>
            </div>

            {/* Interactive Digit cells */}
            <div className="grid grid-cols-7 text-center bg-white py-4">
              {digits.map((digit, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center space-y-2 border-l last:border-l-0 border-slate-100 px-2">
                  <button 
                    onClick={() => handleDigitChange(idx, 1)}
                    className="w-10 h-8 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-xl active:scale-95 transition-all text-xl flex items-center justify-center shadow"
                  >
                    +
                  </button>
                  <span className="text-4xl md:text-5xl font-black text-slate-800 my-1 font-['Vazirmatn']">
                    {toFaDigit(digit)}
                  </span>
                  <button 
                    onClick={() => handleDigitChange(idx, -1)}
                    className="w-10 h-8 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded-xl active:scale-95 transition-all text-xl flex items-center justify-center shadow"
                  >
                    -
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Result Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50/70 p-5 rounded-2xl border border-blue-100">
            <span className="text-xs font-bold text-blue-600 bg-blue-200 px-3 py-1 rounded-full mb-2 inline-block">عدد به حروف</span>
            <div className="text-xl md:text-2xl font-bold text-blue-950 mt-2 leading-relaxed">
              {numberToWordsFa(totalNumber)}
            </div>
          </div>

          <div className="bg-indigo-50/70 p-5 rounded-2xl border border-indigo-100">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-200 px-3 py-1 rounded-full mb-2 inline-block">گسترده‌نویسی (باز شده)</span>
            <div className="text-lg md:text-xl font-bold text-indigo-950 mt-2 tracking-wider font-['Vazirmatn']" style={{ direction: 'ltr' }}>
              {digits[0] > 0 && `${toFaDigit(digits[0] * 1000000)} + `}
              {digits[1] > 0 && `${toFaDigit(digits[1] * 100000)} + `}
              {digits[2] > 0 && `${toFaDigit(digits[2] * 10000)} + `}
              {digits[3] > 0 && `${toFaDigit(digits[3] * 1000)} + `}
              {digits[4] > 0 && `${toFaDigit(digits[4] * 100)} + `}
              {digits[5] > 0 && `${toFaDigit(digits[5] * 10)} + `}
              {toFaDigit(digits[6])}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2 & 3: INPUT-OUTPUT MACHINE & PATTERNS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* INPUT-OUTPUT MACHINE */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-amber-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-md shadow-amber-200">
                <RefreshCw className="w-7 h-7 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">ماشین ورودی - خروجی</h3>
                <p className="text-slate-500 text-sm">یک عملیات انتخاب کن و عدد بده تا ماشین حساب کنه!</p>
              </div>
            </div>

            {/* Operation Selector */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <button 
                onClick={() => handleRuleChange('add5')}
                className={`py-3 px-2 rounded-2xl font-bold text-sm md:text-base transition-all ${machineRule === 'add5' ? 'bg-amber-500 text-white shadow-lg shadow-amber-200 scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                + ۵ (جمع با ۵)
              </button>
              <button 
                onClick={() => handleRuleChange('mul3')}
                className={`py-3 px-2 rounded-2xl font-bold text-sm md:text-base transition-all ${machineRule === 'mul3' ? 'bg-amber-500 text-white shadow-lg shadow-amber-200 scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                × ۳ (ضرب در ۳)
              </button>
              <button 
                onClick={() => handleRuleChange('sub2')}
                className={`py-3 px-2 rounded-2xl font-bold text-sm md:text-base transition-all ${machineRule === 'sub2' ? 'bg-amber-500 text-white shadow-lg shadow-amber-200 scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                - ۲ (تفریق ۲)
              </button>
            </div>

            {/* Machine Graphic */}
            <div className="bg-slate-50 border-2 border-dashed border-amber-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="w-full flex items-center justify-around mb-4">
                <div className="text-center">
                  <span className="text-sm font-bold text-slate-500 mb-1 block">عدد ورودی</span>
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow border border-slate-200">
                    <button onClick={() => handleInputChange(machineInput - 1)} className="text-xl font-bold text-rose-500 px-2 hover:bg-rose-50 rounded-lg">-</button>
                    <span className="text-3xl font-black text-slate-800">{toFaDigit(machineInput)}</span>
                    <button onClick={() => handleInputChange(machineInput + 1)} className="text-xl font-bold text-emerald-500 px-2 hover:bg-emerald-50 rounded-lg">+</button>
                  </div>
                </div>

                <ArrowDown className="w-8 h-8 text-amber-500 animate-bounce rotate-90" />

                <div className="text-center">
                  <span className="text-sm font-bold text-slate-500 mb-1 block">عملیات ماشین</span>
                  <div className="bg-amber-100 text-amber-800 font-black text-xl px-6 py-3 rounded-2xl border border-amber-300 shadow-inner">
                    {machineRule === 'add5' && '+ ۵'}
                    {machineRule === 'mul3' && '× ۳'}
                    {machineRule === 'sub2' && '- ۲'}
                  </div>
                </div>

                <ArrowDown className="w-8 h-8 text-amber-500 animate-bounce rotate-90" />

                <div className="text-center">
                  <span className="text-sm font-bold text-slate-500 mb-1 block">عدد خروجی</span>
                  <div className="bg-emerald-500 text-white font-black text-3xl px-6 py-2 rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center min-w-[70px]">
                    {isCalculating ? (
                      <RefreshCw className="w-7 h-7 animate-spin text-white py-1" />
                    ) : (
                      toFaDigit(machineOutput ?? 0)
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-2">دستگاه محاسباتی هوشمند چهارم دبستان</p>
            </div>
          </div>
        </div>

        {/* PATTERN DETECTOR GAME */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-teal-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-teal-500 text-white rounded-2xl shadow-md shadow-teal-200">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">کارگاه کشف الگوها</h3>
                <p className="text-slate-500 text-sm">عدد بعدی الگو را حدس بزن و امتیاز بگیر!</p>
              </div>
            </div>

            {/* Pattern Display */}
            <div className="bg-teal-50/60 border border-teal-200 rounded-3xl p-6 text-center mb-6">
              <span className="text-xs font-bold bg-teal-100 text-teal-800 px-4 py-1 rounded-full mb-4 inline-block">
                قانون الگو: {currentPattern.rule}
              </span>
              <div className="flex items-center justify-center gap-2 md:gap-4 text-2xl md:text-4xl font-black text-teal-950 my-2 direction-ltr" style={{ direction: 'ltr' }}>
                {currentPattern.series.map((n, i) => (
                  <React.Fragment key={i}>
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl shadow-md flex items-center justify-center border-2 border-teal-300">
                      {toFaDigit(n)}
                    </div>
                    <span className="text-teal-400 text-lg md:text-2xl font-bold">,</span>
                  </React.Fragment>
                ))}
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl shadow-md flex items-center justify-center border-2 transition-all ${patternSolved ? 'bg-emerald-500 text-white border-emerald-600 animate-bounce' : 'bg-amber-100 text-amber-700 border-dashed border-amber-400'}`}>
                  {patternSolved ? toFaDigit(currentPattern.correct) : '؟'}
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {currentPattern.options.map((opt, index) => {
                const isSelected = patternSelected === opt;
                const isCorrect = opt === currentPattern.correct;
                let btnStyle = "bg-slate-100 hover:bg-slate-200 text-slate-700";
                
                if (patternSelected !== null) {
                  if (isCorrect) btnStyle = "bg-emerald-500 text-white shadow-lg shadow-emerald-200 animate-pulse";
                  else if (isSelected) btnStyle = "bg-rose-500 text-white animate-wiggle";
                }

                return (
                  <button 
                    key={index}
                    disabled={patternSolved}
                    onClick={() => handlePatternAnswer(opt)}
                    className={`py-4 rounded-2xl font-black text-2xl md:text-3xl transition-all shadow ${btnStyle}`}
                  >
                    {toFaDigit(opt)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback & Next Button */}
          {patternSelected !== null && (
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2">
                {patternSolved ? (
                  <>
                    <div className="p-2 bg-emerald-500 text-white rounded-xl"><Check className="w-5 h-5" /></div>
                    <span className="font-bold text-emerald-700 text-base md:text-lg">آفرین! کاملاً درست گفتی!</span>
                  </>
                ) : (
                  <span className="font-bold text-rose-600 text-base md:text-lg">اشکالی نداره، دوباره تلاش کن!</span>
                )}
              </div>
              {patternSolved && (
                <button 
                  onClick={nextPattern}
                  className="btn-3d-green text-white px-6 py-2 rounded-xl font-bold text-sm md:text-base shadow-lg shadow-emerald-200"
                >
                  الگوی بعدی
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
