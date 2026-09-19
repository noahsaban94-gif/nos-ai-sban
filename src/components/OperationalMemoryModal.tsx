import React, { useState } from 'react';
import { Brain, X, Plus, Trash2, Check, Sparkles, Shield, Truck, MapPin, Building2 } from 'lucide-react';
import { OperationalMemoryItem } from '../types';

interface OperationalMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: OperationalMemoryItem[];
  onAddMemory: (category: OperationalMemoryItem['category'], text: string) => void;
  onDeleteMemory: (id: string) => void;
  onResetDefaults: () => void;
}

export const OperationalMemoryModal: React.FC<OperationalMemoryModalProps> = ({
  isOpen,
  onClose,
  memories,
  onAddMemory,
  onDeleteMemory,
  onResetDefaults,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<OperationalMemoryItem['category']>('נהגים');
  const [noteText, setNoteText] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    onAddMemory(selectedCategory, noteText.trim());
    setNoteText('');
  };

  const filteredMemories = filterCategory === 'all'
    ? memories
    : memories.filter((m) => m.category === filterCategory);

  const getCategoryBadge = (cat: OperationalMemoryItem['category']) => {
    switch (cat) {
      case 'נהגים':
        return {
          icon: <Truck className="w-3 h-3 text-sky-700" />,
          bg: 'bg-sky-50 text-sky-900 border-sky-200',
        };
      case 'לקוחות ואתרים':
        return {
          icon: <MapPin className="w-3 h-3 text-amber-700" />,
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
        };
      case 'הנהלה וחשבונות':
        return {
          icon: <Building2 className="w-3 h-3 text-emerald-700" />,
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
        };
      default:
        return {
          icon: <Shield className="w-3 h-3 text-slate-700" />,
          bg: 'bg-slate-100 text-slate-900 border-slate-300',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-l from-sky-900 via-sky-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Brain className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight flex items-center gap-1.5">
                <span>פנקס הזיכרון הלוגיסטי של ראמי</span>
                <span className="text-[10px] bg-sky-400/25 border border-sky-300/40 text-sky-100 px-2 py-0.5 rounded-full font-bold">
                  {memories.length} עובדות פעילות
                </span>
              </h2>
              <p className="text-[11px] text-sky-200 font-medium">
                נועה שולפת עובדות אלו באופן יזום בכל מענה, שיבוץ הזמנה ושאילתה
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-sky-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Quick info note */}
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-950 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">איך זה עובד בצ׳אט?</div>
              <div className="text-[11px] text-sky-800 mt-0.5 leading-relaxed">
                תוכל לכתוב לנועה בצ׳אט: <em>"תזכרי ש..."</em> או <em>"תייקי בזיכרון ש..."</em> והיא תתייק את המידע אוטומטית,
                או להזין ישירות כאן בפנקס.
              </div>
            </div>
          </div>

          {/* Add New Memory Form */}
          <form onSubmit={handleAdd} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>➕ הוספת עובדה או העדפה לוגיסטית חדשה:</span>
              <div className="flex gap-1">
                {(['נהגים', 'לקוחות ואתרים', 'הנהלה וחשבונות', 'כללי'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition ${
                      selectedCategory === cat
                        ? 'bg-sky-700 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="למשל: רחוב הגליל ברעננה צר מאוד — לשבץ רק מנוף קדמי מוקדם בבוקר..."
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              />
              <button
                type="submit"
                disabled={!noteText.trim()}
                className="px-4 py-2 bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>שמור לפנקס</span>
              </button>
            </div>
          </form>

          {/* Filter Bar */}
          <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-700">רשימת עובדות מתועדות ({filteredMemories.length}):</span>
            <div className="flex gap-1 text-[11px]">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-2 py-0.5 rounded-md font-bold ${
                  filterCategory === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                הכל ({memories.length})
              </button>
              {(['נהגים', 'לקוחות ואתרים', 'הנהלה וחשבונות', 'כללי'] as const).map((cat) => {
                const count = memories.filter((m) => m.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-2 py-0.5 rounded-md font-bold ${
                      filterCategory === cat ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Memory Items List */}
          <div className="space-y-2.5">
            {filteredMemories.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 font-bold">
                אין עדיין עובדות בקטגוריה זו.
              </div>
            ) : (
              filteredMemories.map((item) => {
                const badge = getCategoryBadge(item.category);
                return (
                  <div
                    key={item.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-black flex items-center gap-1 ${badge.bg}`}>
                          {badge.icon}
                          <span>{item.category}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.timestamp}
                        </span>
                      </div>
                      <div className="text-slate-800 font-semibold leading-relaxed">
                        {item.text}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <button
                        type="button"
                        onClick={() => onDeleteMemory(item.id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="מחק מהפנקס"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onResetDefaults}
            className="text-[11px] font-bold text-slate-600 hover:text-slate-900 underline"
          >
            איפוס לעובדות ברירת מחדל של ח. סבן
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition"
          >
            סגור פנקס
          </button>
        </div>
      </div>
    </div>
  );
};
