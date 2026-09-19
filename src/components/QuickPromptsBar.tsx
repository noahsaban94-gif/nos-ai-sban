import React from 'react';

interface QuickPromptsBarProps {
  onSelectPrompt: (text: string) => void;
}

const PROMPTS = [
  {
    label: '📋 דוח בוקר מרוכז',
    query: '📋 הפק דוח בוקר יומי מרוכז לסידור',
    hoverBorder: 'hover:border-sky-400',
    hoverBg: 'hover:bg-sky-50',
  },
  {
    label: '🚚 שיבוץ חכמת ועלי',
    query: '🚚 בדוק שיבוץ נהגים וסטטוס רכבים (חכמת ועלי)',
    hoverBorder: 'hover:border-amber-400',
    hoverBg: 'hover:bg-amber-50',
  },
  {
    label: '🛡️ בדיקת פקדונות (1:1)',
    query: '🛡️ מחשבון פקדונות: 4 בלות חול + 40 שק מלט אפור',
    hoverBorder: 'hover:border-emerald-400',
    hoverBg: 'hover:bg-emerald-50',
  },
  {
    label: '💰 הצעת מחיר קומקס',
    query: '💰 הצעת מחיר רשמית: 3 בלות סומסום + 2 בלות טיט + מנוף כפר סבא',
    hoverBorder: 'hover:border-indigo-400',
    hoverBg: 'hover:bg-indigo-50',
  },
  {
    label: '📦 הזמנת שחר שאול (6215454)',
    query: 'הצג פרטי הזמנה 6215454 של שחר שאול תכנון הוד השרון',
    hoverBorder: 'hover:border-purple-400',
    hoverBg: 'hover:bg-purple-50',
  },
  {
    label: '🏭 סניף 4 החרש מול 1 התלמיד',
    query: 'מה החלוקה והמלאי בין סניף 4 החרש לסניף 1 התלמיד?',
    hoverBorder: 'hover:border-teal-400',
    hoverBg: 'hover:bg-teal-50',
  },
];

export const QuickPromptsBar: React.FC<QuickPromptsBarProps> = ({ onSelectPrompt }) => {
  return (
    <div className="bg-[#f0f2f5] border-t border-slate-200/80 px-3 py-2 z-10 flex-shrink-0">
      <div className="max-w-3xl mx-auto flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
        {PROMPTS.map((p) => (
          <button
            key={p.label}
            onClick={() => onSelectPrompt(p.query)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-white text-slate-800 border border-slate-300 shadow-xs transition active:scale-95 flex-shrink-0 ${p.hoverBg} ${p.hoverBorder}`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};
