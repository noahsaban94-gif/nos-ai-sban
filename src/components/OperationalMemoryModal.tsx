import React, { useState, useMemo } from 'react';
import {
  Brain,
  X,
  Plus,
  Trash2,
  Sparkles,
  Shield,
  Truck,
  MapPin,
  Building2,
  Search,
  Tag,
  Hash,
  Check
} from 'lucide-react';
import { OperationalMemoryItem } from '../types';

interface OperationalMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: OperationalMemoryItem[];
  onAddMemory: (category: OperationalMemoryItem['category'], text: string, tags?: string[]) => void;
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
  const [tagInput, setTagInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract all unique tags dynamically across existing memories + core system tags
  const allUniqueTags = useMemo(() => {
    const tagSet = new Set<string>();
    // Preload top core tags for quick filtering
    ['נהגים', 'חכמת', 'עלי', 'סניף 4 החרש', 'סניף 1 התלמיד', 'לקוחות', 'הנהלה', 'הנה"ח', 'פקדונות'].forEach(t => tagSet.add(t));
    
    memories.forEach((m) => {
      // Add category itself as a discoverable tag
      tagSet.add(m.category === 'לקוחות ואתרים' ? 'לקוחות' : m.category === 'הנהלה וחשבונות' ? 'הנהלה' : m.category);
      if (m.tags && Array.isArray(m.tags)) {
        m.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet);
  }, [memories]);

  // Combined Search & Filter Logic (Search text + Category + Tag filter)
  const filteredMemories = useMemo(() => {
    return memories.filter((m) => {
      // 1. Category filter
      if (filterCategory !== 'all' && m.category !== filterCategory) {
        return false;
      }

      // 2. Tag filter
      if (selectedTag) {
        const itemTags = (m.tags || []).map((t) => t.toLowerCase());
        const catName = m.category.toLowerCase();
        const searchTag = selectedTag.toLowerCase();
        const matchTag =
          itemTags.includes(searchTag) ||
          catName.includes(searchTag) ||
          (searchTag === 'נהגים' && catName.includes('נהגים')) ||
          (searchTag === 'לקוחות' && catName.includes('לקוחות')) ||
          (searchTag === 'הנהלה' && catName.includes('הנהלה'));

        if (!matchTag) {
          return false;
        }
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const textMatch = m.text.toLowerCase().includes(q);
        const catMatch = m.category.toLowerCase().includes(q);
        const tagMatch = (m.tags || []).some((t) => t.toLowerCase().includes(q));
        return textMatch || catMatch || tagMatch;
      }

      return true;
    });
  }, [memories, filterCategory, selectedTag, searchQuery]);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    // Parse comma or space separated tags
    const customTags = tagInput
      .split(/[,#\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    onAddMemory(selectedCategory, noteText.trim(), customTags.length > 0 ? customTags : undefined);
    setNoteText('');
    setTagInput('');
  };

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

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedTag(null);
    setFilterCategory('all');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-l from-sky-900 via-sky-800 to-slate-900 text-white flex items-center justify-between flex-shrink-0">
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
            className="p-1.5 rounded-lg text-sky-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="סגור חלון"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
          {/* Quick info note */}
          <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-950 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">איך זה עובד בצ׳אט?</div>
              <div className="text-[11px] text-sky-800 mt-0.5 leading-relaxed">
                תוכל לכתוב לנועה בצ׳אט: <em>"תזכרי ש..."</em> או <em>"תייקי בזיכרון ש..."</em> והיא תתייק את המידע אוטומטית,
                או לחפש ולסנן כאן ישירות לפי תגיות ומילות מפתח.
              </div>
            </div>
          </div>

          {/* Search & Tag Filter Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חיפוש חופשי בפנקס (לפי שם נהג, לקוח, רחוב, סניף, פקדון...)"
                className="w-full bg-white border border-slate-300 rounded-xl pr-9 pl-8 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Tags Cloud Filter */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3 text-sky-600" />
                  <span>סינון מהיר לפי תגיות:</span>
                </span>
                {(selectedTag || searchQuery || filterCategory !== 'all') && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-sky-700 hover:underline font-bold text-[10px] cursor-pointer"
                  >
                    נקה את כל הסינונים ✕
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {allUniqueTags.map((tag) => {
                  const isSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(isSelected ? null : tag)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-sky-700 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <Hash className={`w-2.5 h-2.5 ${isSelected ? 'text-sky-200' : 'text-slate-400'}`} />
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Add New Memory Form */}
          <form onSubmit={handleAdd} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>➕ הוספת עובדה לוגיסטית חדשה:</span>
              <div className="flex gap-1">
                {(['נהגים', 'לקוחות ואתרים', 'הנהלה וחשבונות', 'כללי'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
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
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="למשל: רחוב הגליל ברעננה צר מאוד — לשבץ רק מנוף קדמי מוקדם בבוקר..."
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="תגיות (מופרדות בפסיקים/רווח)"
                className="w-full sm:w-44 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              />
              <button
                type="submit"
                disabled={!noteText.trim()}
                className="px-4 py-2 bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>שמור לפנקס</span>
              </button>
            </div>
          </form>

          {/* Category Tabs & Counter */}
          <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2 pt-1">
            <span className="font-bold text-slate-700">
              תוצאות ({filteredMemories.length} מתוך {memories.length}):
            </span>
            <div className="flex gap-1 text-[11px] overflow-x-auto">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-2 py-0.5 rounded-md font-bold cursor-pointer ${
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
                    className={`px-2 py-0.5 rounded-md font-bold cursor-pointer ${
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
              <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
                <Search className="w-6 h-6 text-slate-300 mx-auto" />
                <div className="text-xs text-slate-600 font-bold">
                  לא נמצאו עובדות מתאימות לחיפוש או לתגית שנבחרה.
                </div>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-sky-700 font-bold hover:underline cursor-pointer"
                >
                  אפס סינונים והצג את כל הפנקס
                </button>
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
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-black flex items-center gap-1 ${badge.bg}`}>
                          {badge.icon}
                          <span>{item.category}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.timestamp}
                        </span>
                        {/* Display tags */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mr-1">
                            {item.tags.map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                                className={`px-1.5 py-0.2 rounded text-[9px] font-bold border transition cursor-pointer ${
                                  selectedTag === t
                                    ? 'bg-sky-100 text-sky-900 border-sky-300'
                                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                }`}
                              >
                                #{t}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-slate-900 font-bold leading-relaxed text-[13px]">
                        {item.text}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <button
                        type="button"
                        onClick={() => onDeleteMemory(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
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
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs flex-shrink-0">
          <button
            type="button"
            onClick={onResetDefaults}
            className="text-[11px] font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
          >
            איפוס לעובדות ברירת מחדל של ח. סבן
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition cursor-pointer"
          >
            סגור פנקס
          </button>
        </div>
      </div>
    </div>
  );
};
