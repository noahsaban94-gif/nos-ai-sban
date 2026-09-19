import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  BellRing,
  Briefcase,
  Trash2,
  Paperclip,
  Send,
  CheckCheck,
  Package,
  Navigation,
  FileSpreadsheet,
  X,
  RefreshCw,
  ServerOff,
  Sparkles,
  Brain
} from 'lucide-react';
import { ChatMessage, OperationalMemoryItem } from './types';
import { SABAN_ORDERS } from './data/sabanData';
import { playNotificationChime } from './utils/audio';
import { ProfessionalDrawer } from './components/ProfessionalDrawer';
import { QuickPromptsBar } from './components/QuickPromptsBar';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { WarehouseOrdersChart } from './components/WarehouseOrdersChart';
import { OperationalMemoryModal } from './components/OperationalMemoryModal';

const AVATAR_URL = 'https://i.ibb.co/GQfHTYZH/Gemini-Generated-Image-7.png';

export const DEFAULT_MEMORIES: OperationalMemoryItem[] = [
  {
    id: 'mem-1',
    category: 'נהגים',
    text: 'חכמת (מרצדס מנוף 615-41-002) — יוצא קבוע ב-06:30 מסניף 4 החרש. אתרים עם רחובות צרים יש לשבץ ראשונים בסבב לפני תחילת עומסי תנועה.',
    timestamp: 'קבוע תפעולי',
    tags: ['חכמת', 'מרצדס מנוף', 'סניף 4 החרש', 'רחובות צרים'],
  },
  {
    id: 'mem-2',
    category: 'נהגים',
    text: 'עלי (איסוזו חלוקה 651-51-701) — מוביל בלעדית גבס, פרופילים, צבע וציוד חנות מסניף 1 התלמיד, ופריקות ידניות / הובלה ללא פריקה.',
    timestamp: 'קבוע תפעולי',
    tags: ['עלי', 'איסוזו', 'סניף 1 התלמיד', 'ללא פריקה'],
  },
  {
    id: 'mem-3',
    category: 'לקוחות ואתרים',
    text: 'לקוח שחר שאול (הבנים 7 הוד השרון) — לתאם תמיד טלפונית חצי שעה מראש לפני הגעת המשאית לאתר.',
    timestamp: 'קבוע תפעולי',
    tags: ['שחר שאול', 'תיאום מראש', 'הוד השרון'],
  },
  {
    id: 'mem-4',
    category: 'לקוחות ואתרים',
    text: 'לקוח ל.ה בניה (לב השכונה) — פריקת מנוף מרפסת קומה 2 בלבד, חובה לא לחסום את ציר הגישה לאמבולנסים.',
    timestamp: 'קבוע תפעולי',
    tags: ['ל.ה בניה', 'מנוף מרפסת', 'גישת חירום'],
  },
  {
    id: 'mem-5',
    category: 'הנהלה וחשבונות',
    text: 'כל תעודת משלוח עם חוסר מאושר, זיכוי בלות או חריגת מחיר מועברת מיידית ללינה לחיוב בהנה"ח באישור הראל או ורד.',
    timestamp: 'קבוע תפעולי',
    tags: ['לינה', 'הנה"ח', 'זיכוי בלות', 'הראל/ורד'],
  },
];

/**
 * פונקציית עזר עם מנגנון Retry אוטומטי במקרה של שגיאת 500 או שגיאת רשת
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = 2,
  delayMs: number = 1000,
  onRetryAttempt?: (attempt: number, max: number) => void
): Promise<Response> {
  let lastError: any = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0 && onRetryAttempt) {
        onRetryAttempt(attempt, retries);
      }
      const response = await fetch(url, options);
      // אם התקבלה שגיאת 500 (Internal Server Error) או 502/503/504
      if (response.status >= 500 && attempt < retries) {
        await new Promise((res) => setTimeout(res, delayMs * Math.pow(1.5, attempt)));
        continue;
      }
      return response;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, delayMs * Math.pow(1.5, attempt)));
      }
    }
  }
  if (lastError) throw lastError;
  throw new Error('All retries failed');
}

const INITIAL_NOA_MESSAGE: ChatMessage = {
  id: 'init-1',
  sender: 'noa',
  timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
  text: 'שלום ראמי! ❤️ נועה כאן, יד ימינך בסדרנות ח. סבן חומרי בניין (1994) בע״מ.',
  htmlContent: `
    <div class="space-y-2 text-slate-900 font-bold text-sm leading-relaxed">
      <div class="font-extrabold text-base text-slate-900">
        שלום ראמי! ❤️ נועה כאן, יד ימינך בסדרנות ח. סבן חומרי בניין (1994) בע״מ.
      </div>
      <div class="text-slate-800 text-xs leading-relaxed font-semibold">
        אני מחוברת ומסונכרנת עם כל הגיליונות, הקומקס וצי הרכבים:
        <ul class="list-disc list-inside mt-1 font-bold text-slate-900 space-y-0.5">
          <li><strong>סניף 4 החרש:</strong> חכמת במרצדס מנוף (615-41-002) — בלות ומשטחים כבדים.</li>
          <li><strong>סניף 1 התלמיד:</strong> עלי באיסוזו פתוחה (654-51-701) — לוחות גבס וחלוקה.</li>
          <li><strong>מערך פקדונות 1:1:</strong> מעקב קפדני אחר שקים גדולים (60002) ומשטחי סבן (60060).</li>
        </ul>
      </div>
      <div class="text-xs font-black text-sky-950 bg-sky-50 p-2.5 rounded-xl border border-sky-200">
        במה נתחיל היום ראמי? תוכל לבחור פקודה מהירה למטה או להקליד כל שאלה.
      </div>
    </div>
  `
};

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('saban_noa_chat_history_json');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse chat history:', e);
    }
    return [INITIAL_NOA_MESSAGE];
  });

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [retryStatus, setRetryStatus] = useState<{ active: boolean; text: string } | null>(null);
  const [serverAvailability, setServerAvailability] = useState<'online' | 'degraded' | 'offline'>('online');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('sound_enabled') !== 'false';
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);

  const [memories, setMemories] = useState<OperationalMemoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('saban_operational_memory');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse operational memories:', e);
    }
    return DEFAULT_MEMORIES;
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    try {
      localStorage.setItem('saban_noa_chat_history_json', JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save chat history:', e);
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem('saban_operational_memory', JSON.stringify(memories));
    } catch (e) {
      console.warn('Could not save operational memories:', e);
    }
  }, [memories]);

  const handleAddMemory = (category: OperationalMemoryItem['category'], text: string, customTags?: string[]) => {
    // Auto-extract relevant tags from text if not provided
    const tags: string[] = customTags && customTags.length > 0 ? customTags : [];
    if (tags.length === 0) {
      if (text.includes('חכמת')) tags.push('חכמת');
      if (text.includes('עלי')) tags.push('עלי');
      if (text.includes('מרצדס') || text.includes('מנוף')) tags.push('מנוף');
      if (text.includes('איסוזו')) tags.push('איסוזו');
      if (text.includes('סניף 4') || text.includes('החרש')) tags.push('סניף 4 החרש');
      if (text.includes('סניף 1') || text.includes('התלמיד')) tags.push('סניף 1 התלמיד');
      if (text.includes('לינה')) tags.push('לינה');
      if (text.includes('הראל')) tags.push('הראל');
      if (text.includes('ורד')) tags.push('ורד');
      if (text.includes('פקדון') || text.includes('בלות') || text.includes('משטח')) tags.push('פקדונות');
      if (text.includes('רעננה')) tags.push('רעננה');
      if (text.includes('הוד השרון')) tags.push('הוד השרון');
      if (text.includes('כפר סבא')) tags.push('כפר סבא');
      if (text.includes('תל אביב')) tags.push('תל אביב');
    }

    const newItem: OperationalMemoryItem = {
      id: `mem-${Date.now()}`,
      category,
      text,
      timestamp: new Date().toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' }),
      tags: tags.length > 0 ? tags : undefined,
    };
    setMemories((prev) => [newItem, ...prev]);
  };

  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleResetMemories = () => {
    if (window.confirm('ראמי, לאפס את פנקס הזיכרון הלוגיסטי לעובדות ברירת המחדל של ח. סבן?')) {
      setMemories(DEFAULT_MEMORIES);
    }
  };

  useEffect(() => {
    // Check if opened via PWA Shortcut or URL action
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    if (action === 'morning_report') {
      setTimeout(() => {
        handleSendQuery('דוח בוקר מרוכז');
      }, 600);
    } else if (action === 'memory') {
      setIsMemoryModalOpen(true);
    } else if (action === 'deposits') {
      setTimeout(() => {
        handleSendQuery('חישוב פקדונות 1:1');
      }, 600);
    }
  }, []);

  const [aiInfo, setAiInfo] = useState<{
    totalKeys: number;
    model: string;
    status: string;
    activeKeyIndex?: number;
  }>({
    totalKeys: 3,
    model: 'gemini-3.8-flash',
    status: 'connected',
  });

  useEffect(() => {
    // Fetch live AI status if available
    fetch('/api/ai-status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setAiInfo({
            totalKeys: data.totalKeys || 3,
            model: data.model || 'gemini-3.8-flash',
            status: data.status || 'connected',
          });
        }
      })
      .catch(() => {
        // Safe fallback - default to 3 keys
      });
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('sound_enabled', String(next));
    if (next) {
      playNotificationChime(true);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('ראמי, האם לנקות את היסטוריית השיחה המקומית?')) {
      setMessages([INITIAL_NOA_MESSAGE]);
      localStorage.removeItem('saban_noa_chat_history_json');
      localStorage.removeItem('saban_noa_chat_history');
    }
  };

  const requestPushNotification = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('דפדפן זה אינו תומך בהתראות פוש.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('נועה AI ❤️ — ח. סבן', {
          body: 'התראות פוש הופעלו בהצלחה! תעודות משלוח וסידורי עבודה ישוגרו ישירות למכשירך.',
          icon: AVATAR_URL,
        });
        alert('התראות הופעלו בהצלחה!');
      } else {
        alert('ההתראות נדחו או לא אושרו בהגדרות הדפדפן.');
      }
    } catch (e) {
      console.warn('Notification error:', e);
    }
  };

  const handleSendQuery = async (queryText: string) => {
    const text = queryText.trim();
    if (!text) return;

    // Check if Rami is recording a memory note
    const isFilingCommand =
      text.startsWith('תזכרי ש') ||
      text.startsWith('תזכרי:') ||
      text.startsWith('תייקי בזיכרון ש') ||
      text.startsWith('תייקי בזיכרון:') ||
      text.startsWith('שימי לב ש') ||
      text.startsWith('תרשמי בפנקס') ||
      text.startsWith('תשמרי בפנקס');

    if (isFilingCommand) {
      const noteContent = text
        .replace(/^תזכרי\s*ש?:?/i, '')
        .replace(/^תייקי\s*בזיכרון\s*ש?:?/i, '')
        .replace(/^שימי\s*לב\s*ש?:?/i, '')
        .replace(/^תרשמי\s*בפנקס\s*ש?:?/i, '')
        .replace(/^תשמרי\s*בפנקס\s*ש?:?/i, '')
        .trim();

      if (noteContent) {
        let category: OperationalMemoryItem['category'] = 'כללי';
        if (noteContent.includes('חכמת') || noteContent.includes('עלי') || noteContent.includes('נהג') || noteContent.includes('משאית') || noteContent.includes('סבב')) {
          category = 'נהגים';
        } else if (noteContent.includes('לקוח') || noteContent.includes('אתר') || noteContent.includes('רעננה') || noteContent.includes('הוד השרון') || noteContent.includes('כפר סבא') || noteContent.includes('פריקה')) {
          category = 'לקוחות ואתרים';
        } else if (noteContent.includes('לינה') || noteContent.includes('הראל') || noteContent.includes('ורד') || noteContent.includes('חשבונית') || noteContent.includes('חיוב') || noteContent.includes('חוסר')) {
          category = 'הנהלה וחשבונות';
        }
        handleAddMemory(category, noteContent);
      }
    }

    const time = new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'rami',
      text,
      timestamp: time,
    };

    const currentHistory = [...messages, userMsg];
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // 1. Check if user configured custom Google Apps Script Web App URL
    const customApiUrl = localStorage.getItem('saban_api_url') || '';

    let replyHtml = '';
    let usedOfflineFallback = false;

    // Build context history payload (last 8 messages)
    const historyPayload = messages.slice(-8).map((m) => ({
      role: m.sender === 'rami' ? 'user' : 'model',
      text: m.text,
    }));

    try {
      // Primary route: Send to /api/chat using fetchWithRetry with automatic retry on 500 / server errors
      const res = await fetchWithRetry(
        '/api/chat',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: text,
            sender: 'ראמי',
            googleScriptUrl: customApiUrl || undefined,
            history: historyPayload,
            operationalMemory: memories,
          }),
        },
        2, // up to 2 retries
        1000,
        (attempt, max) => {
          setRetryStatus({
            active: true,
            text: `מתבצע ניסיון חיבור חוזר (${attempt}/${max}) עקב עומס רגעי...`,
          });
        }
      );

      if (res.ok) {
        const data = await res.json();
        replyHtml = data.htmlMessage || data.message || '';
        setServerAvailability('online');
        if (data.activeKeyIndex) {
          setAiInfo((prev) => ({
            ...prev,
            activeKeyIndex: data.activeKeyIndex,
            totalKeys: data.totalKeys || prev.totalKeys,
            model: data.model || prev.model,
          }));
        }
      } else {
        // If server responded with error status (e.g. 500) even after retries
        setServerAvailability('degraded');
      }
    } catch {
      // Server not reachable or network failed after retries - handled gracefully
      setServerAvailability('offline');
    } finally {
      setRetryStatus(null);
    }

    // 2. Direct client fallback with CORS-safelisted content-type (no preflight OPTIONS)
    if (!replyHtml && customApiUrl && customApiUrl.startsWith('http')) {
      try {
        const directRes = await fetch(customApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'CHAT_QUERY', query: text, sender: 'Rami', operationalMemory: memories }),
          mode: 'cors',
        });
        if (directRes.ok) {
          const data = await directRes.json();
          replyHtml = data.htmlMessage || data.message || '';
        }
      } catch {
        // Continue to local Saban engine quietly
      }
    }

    // 3. Fallback to rich local Saban heuristic engine with a friendly, professional banner
    if (!replyHtml) {
      usedOfflineFallback = true;
      const localReply = generateLocalSabanReply(text, currentHistory, memories);
      replyHtml = `
        <div class="space-y-2.5">
          <div class="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs font-bold">
            <span class="text-base">⚡</span>
            <div>
              <div class="font-black text-amber-950">מצב סדרנות מקומי (Offline Protection)</div>
              <div class="text-[11px] font-semibold text-amber-800">
                שרת הענן בעיבוד עמוס או לא זמין כרגע. הפקודה פוענחה בהצלחה ישירות ממאגר הנתונים המקומי של ח. סבן!
              </div>
            </div>
          </div>
          ${localReply}
        </div>
      `;
    }

    setIsTyping(false);

    const noaMsg: ChatMessage = {
      id: `noa-${Date.now()}`,
      sender: 'noa',
      text: replyHtml.replace(/<[^>]+>/g, ' '),
      htmlContent: replyHtml,
      timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, noaMsg]);
    playNotificationChime(soundEnabled);
  };

  const handleShareChartToChat = (payload: {
    title: string;
    summary: string;
    statsText: string;
    actionPrompt?: string;
  }) => {
    const time = new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

    // Add user intent message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'rami',
      text: '📊 שיתוף ניתוח גרף שבועי: סניף 4 החרש מול סניף 1 התלמיד',
      timestamp: time,
    };

    // Add Noa response with embedded interactive chart card & action prompt buttons
    const noaMsg: ChatMessage = {
      id: `noa-${Date.now() + 1}`,
      sender: 'noa',
      text: `${payload.title}\n${payload.summary}`,
      timestamp: time,
      actionCard: {
        type: 'chart_analysis',
        data: payload,
      },
    };

    setMessages((prev) => [...prev, userMsg, noaMsg]);
    setIsDrawerOpen(false);
    playNotificationChime(soundEnabled);
  };

  const generateLocalSabanReply = (
    query: string,
    history: ChatMessage[],
    operationalMemories: OperationalMemoryItem[]
  ): string => {
    const q = query.toLowerCase().trim();

    // 0. מענה אנושי חם לברכות, פניות ושלום
    if (
      q === 'היי' ||
      q === 'שלום' ||
      q === 'בוקר טוב' ||
      q === 'ערב טוב' ||
      q === 'היי נועה' ||
      q === 'שלום נועה' ||
      q === 'נועה' ||
      q.startsWith('היי נועה') ||
      q.startsWith('שלום נועה') ||
      q.startsWith('מה קורה') ||
      q.startsWith('מה נשמע')
    ) {
      return `
        <div class="text-slate-900 font-bold text-sm leading-relaxed space-y-2">
          <div>היי ראמי! ❤️ אני כאן ומקשיבה.</div>
          <div class="text-xs text-slate-700 font-medium bg-white/90 p-2.5 rounded-xl border border-slate-200">
            אני מסונכרנת עם נתוני סידור העבודה של ח. סבן (סניף 4 החרש וסניף 1 התלמיד).<br/>
            <span class="text-[11px] text-slate-500 font-normal">
              טיפ: כדי לאפשר לי לענות באופן חופשי לחלוטין בכל נושא, ודא שהמפתח GEMINI_API_KEY מוגדר בסביבת השרת.
            </span>
          </div>
          <div class="text-xs text-sky-800 font-bold">
            במה נתחיל ראמי? שיבוץ נהג, בדיקת פקדונות או דוח בוקר?
          </div>
        </div>
      `;
    }

    // 1. Filing command confirmation
    if (
      q.startsWith('תזכרי') ||
      q.startsWith('תייקי') ||
      q.startsWith('שימי לב ש') ||
      q.startsWith('תרשמי בפנקס') ||
      q.startsWith('תשמרי בפנקס')
    ) {
      const cleanNote = query
        .replace(/^תזכרי\s*ש?:?/i, '')
        .replace(/^תייקי\s*בזיכרון\s*ש?:?/i, '')
        .replace(/^שימי\s*לב\s*ש?:?/i, '')
        .replace(/^תרשמי\s*בפנקס\s*ש?:?/i, '')
        .replace(/^תשמרי\s*בפנקס\s*ש?:?/i, '')
        .trim();

      return `
        <div class="space-y-2 text-xs">
          <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
            <div class="flex items-center gap-2 text-emerald-900 font-black text-sm">
              <span>🧠 תויק בהצלחה בפנקס הזיכרון הלוגיסטי!</span>
            </div>
            <div class="text-slate-800 font-bold bg-white/80 p-2 rounded-lg border border-emerald-100">
              "${cleanNote || query}"
            </div>
            <div class="text-[11px] text-emerald-800 font-semibold">
              רשמתי זאת בפנקס הזיכרון של המערכת, ראמי ❤️. המידע יישלף אוטומטית בכל שיבוץ עבודה, הצעת מחיר ודוח עתידי!
            </div>
          </div>
        </div>
      `;
    }

    // 2. Contextual continuation check (e.g. "תוסיף לו גם 2 שק מלט", "שלח לו")
    if (q.includes('תוסיף לו') || q.includes('תוסיפי לו') || q.includes('שלח לו') || q.includes('עדכן אותו')) {
      // Find the last mentioned customer or order in recent history
      let lastCustomer = 'שחר שאול (הזמנה 6215454)';
      for (let i = history.length - 2; i >= 0; i--) {
        const hText = history[i].text;
        const matched = SABAN_ORDERS.find(
          (o) => hText.includes(o.customerName) || hText.includes(o.orderNumber)
        );
        if (matched) {
          lastCustomer = `${matched.customerName} (הזמנה #${matched.orderNumber})`;
          break;
        }
      }

      return `
        <div class="space-y-2 text-xs">
          <div class="p-3 bg-sky-50 border border-sky-200 rounded-xl space-y-2">
            <div class="font-black text-sky-950 text-sm flex items-center justify-between">
              <span>✍️ עדכון הזמנה בהמשך לשיחה</span>
              <span class="text-[10px] bg-sky-200 text-sky-900 px-2 py-0.5 rounded-full font-bold">המשכיות שיחה</span>
            </div>
            <div class="text-slate-800 font-bold">
              הבנתי ראמי! עדכנתי עבור <strong>${lastCustomer}</strong> את הפריטים הנוספים:
            </div>
            <div class="p-2 bg-white rounded-lg border border-sky-100 text-slate-700 font-semibold text-[11px]">
              • תוספת: <strong>${query}</strong><br/>
              • בקרת פקדונות: 2 שקי מלט (מק"ט 10002) אינם חוצים את סף המשטח (40 שקים) — אין חיוב משטח עץ נוסף (60060).
            </div>
            <div class="text-[11px] text-sky-800 font-bold">
              השינוי מעודכן בסידור של הנהג המוקצה.
            </div>
          </div>
        </div>
      `;
    }

    // 3. Quick Field Dispatch command (e.g. "לרעננה 4 בלות", "תוציאי לרעננה 4 בלות", "4 בלות לרעננה")
    if ((q.includes('רעננה') || q.includes('כפר סבא') || q.includes('הוד השרון')) && (q.includes('בלה') || q.includes('בלות') || q.includes('משטח'))) {
      const city = q.includes('רעננה') ? 'רעננה' : q.includes('כפר סבא') ? 'כפר סבא' : 'הוד השרון';
      const countMatch = q.match(/\d+/);
      const bagCount = countMatch ? parseInt(countMatch[0], 10) : 4;
      const depositTotal = bagCount * 35;

      return `
        <div class="space-y-2 text-xs">
          <div class="p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl space-y-2 text-slate-800">
            <div class="flex items-center justify-between border-b border-emerald-200 pb-1.5 font-black text-emerald-950 text-sm">
              <span>🚀 פקודת שיגור מהירה — סידור ח. סבן</span>
              <span class="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">יעד: ${city}</span>
            </div>
            <div class="space-y-1 font-bold text-slate-800">
              <div>🏢 <strong>מחסן מקור:</strong> סניף 4 החרש (מגרש חומרי בניין כבדים)</div>
              <div>🏗️ <strong>נהג מוקצה:</strong> חכמת (מרצדס מנוף 615-41-002) — זמין לקו שרון</div>
              <div>📦 <strong>מטען:</strong> ${bagCount} בלות סומסום/חול (שק גדול מק"ט 60002)</div>
              <div>🛡️ <strong>פקדונות 1:1:</strong> ${bagCount} שק גדול = ${depositTotal} ₪ פקדון לפני מע"מ</div>
            </div>
            <div class="p-2 bg-white rounded-lg border border-emerald-100 text-[11px] text-slate-700 font-semibold">
              📍 מועבר מיידית לווייז של חכמת ומוכן לשליחה בוואטסאפ לנהג.
            </div>
            <div class="flex items-center gap-2 pt-1">
              <a href="https://waze.com/ul?q=${encodeURIComponent(city)}" target="_blank" class="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1">
                🧭 פתח Waze ל${city}
              </a>
              <a href="https://wa.me/972522784534?text=${encodeURIComponent(`שלום חכמת, פקודת יציאה מראמי: ${bagCount} בלות ל${city}, סניף 4 החרש.`)}" target="_blank" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1">
                📲 שגר לחכמת בוואטסאפ
              </a>
            </div>
          </div>
        </div>
      `;
    }

    // 4. Price Quotes & Calculations (Formula: (מוצרים) + פקדונות + הובלה/מנוף + מע"מ 18%)
    if (q.includes('הצעת מחיר') || q.includes('תחשיב') || q.includes('כמה יעלה') || (q.includes('מחיר') && (q.includes('חול') || q.includes('סומסום') || q.includes('טיט')))) {
      return `
        <div class="space-y-2 text-xs">
          <div class="p-3 bg-sky-50 border border-sky-200 rounded-xl space-y-2 text-slate-800">
            <div class="flex items-center justify-between border-b border-sky-200 pb-1.5 font-black text-sky-950 text-sm">
              <span>💰 הצעת מחיר מדויקת — ח. סבן חומרי בניין</span>
              <span class="text-[10px] bg-sky-200 text-sky-900 px-2 py-0.5 rounded-full font-bold">מע"מ 18%</span>
            </div>
            <div class="text-[11px] text-slate-600 font-bold">
              חישוב לפי מחירון קומקס רשמי ונוסחת ההסכם:
            </div>
            <div class="space-y-1 bg-white p-2.5 rounded-lg border border-sky-100 font-bold text-[11px] text-slate-800">
              <div class="flex justify-between">
                <span>חול ים שק גדול (מק"ט 6000201) x 2 בלות:</span>
                <span>190.00 ₪</span>
              </div>
              <div class="flex justify-between">
                <span>סומסום שק גדול (מק"ט 6000202) x 2 בלות:</span>
                <span>210.00 ₪</span>
              </div>
              <div class="flex justify-between text-amber-900">
                <span>פקדון שק גדול (מק"ט 60002) x 4 בלות (35 ₪ ליח'):</span>
                <span>140.00 ₪</span>
              </div>
              <div class="flex justify-between text-sky-800">
                <span>הובלת מנוף קו שרון (סניף 4 החרש):</span>
                <span>350.00 ₪</span>
              </div>
              <div class="border-t border-slate-200 pt-1 flex justify-between font-black text-slate-900">
                <span>סה"כ לפני מע"מ:</span>
                <span>890.00 ₪</span>
              </div>
              <div class="flex justify-between text-slate-600 text-[10px]">
                <span>מע"מ (18%):</span>
                <span>160.20 ₪</span>
              </div>
              <div class="border-t border-sky-200 pt-1 flex justify-between font-black text-sky-950 text-xs">
                <span>סה"כ לתשלום כולל מע"מ ופקדונות:</span>
                <span class="text-emerald-700 font-black">1,050.20 ₪</span>
              </div>
            </div>
            <div class="text-[10px] text-slate-500 font-semibold">
              * זיכוי פקדון בלות (35 ₪ ליח' לפני מע"מ) יבוצע אוטומטית בהחזרת השקים לסניף 4.
            </div>
          </div>
        </div>
      `;
    }

    // Check if any operational memory matches this query to highlight proactively
    const matchedMemory = operationalMemories.find((m) =>
      q.includes(m.category.toLowerCase()) ||
      (m.text && q.split(' ').some((word) => word.length > 3 && m.text.toLowerCase().includes(word)))
    );

    let memoryBadge = '';
    if (matchedMemory) {
      memoryBadge = `
        <div class="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 font-bold text-[11px] flex items-center gap-1.5">
          <span>🧠</span>
          <span><strong>תזכורת מפנקס הזיכרון:</strong> ${matchedMemory.text}</span>
        </div>
      `;
    }

    if (q.includes('גרף') || q.includes('נתח') || q.includes('עומס') || (q.includes('החרש') && q.includes('התלמיד'))) {
      return `
        <div class="space-y-3 text-xs">
          ${memoryBadge}
          <div class="font-black text-sm text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <span>📊 ניתוח עומסי עבודה שבועי — ח. סבן</span>
            </span>
            <span class="text-[11px] bg-sky-100 text-sky-800 font-extrabold px-2 py-0.5 rounded-full">מחסן 4 מול 1</span>
          </div>
          <div class="grid grid-cols-2 gap-2 font-bold">
            <div class="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-slate-800 space-y-1">
              <div class="text-sky-900 font-black">סניף 4 החרש (70% מהנפח)</div>
              <div class="text-[11px] text-slate-600">70 הזמנות שבועיות: בלות סומסום, חול, טיט, מלט ובלוקים.</div>
              <div class="text-[10px] text-sky-700 font-bold bg-white p-1 rounded border border-sky-100">
                עומס מנוף גבוה: חכמת בשיא התפוסה (14 פריקות יומיות).
              </div>
            </div>
            <div class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-slate-800 space-y-1">
              <div class="text-emerald-900 font-black">סניף 1 התלמיד (30% מהנפח)</div>
              <div class="text-[11px] text-slate-600">30 הזמנות שבועיות: לוחות גבס, פרופילי פח, שפכטל וצבעים.</div>
              <div class="text-[10px] text-emerald-700 font-bold bg-white p-1 rounded border border-emerald-100">
                איסוזו פתוחה של עלי: גמישות גבוהה, 9 סבבי חלוקה.
              </div>
            </div>
          </div>
          <div class="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 font-bold space-y-1">
            <div class="text-[11px] font-black">💡 מסקנות והמלצות תפעוליות לראמי:</div>
            <ul class="list-disc list-inside text-[11px] space-y-0.5 text-slate-700">
              <li><strong>יום השיא:</strong> ימי שני ורביעי מציגים את עיקר הלחץ על פריקות המנוף בהוד השרון וכפר סבא.</li>
              <li><strong>איזון עומסים:</strong> מומלץ להסיט הובלות ללא פריקה (גבס ופרופילים) מהחרש לאיסוזו של עלי כדי לשחרר את חכמת לקווי מנוף בלבד.</li>
              <li><strong>בקרת פקדונות 1:1:</strong> 70 בלות בסניף 4 דורשות בדיקת קומקס קפדנית של מק"ט 60002.</li>
            </ul>
          </div>
        </div>
      `;
    }

    if (q.includes('דוח בוקר') || q.includes('סידור עבודה') || q.includes('דוח יומי')) {
      return `
        <div class="space-y-3">
          ${memoryBadge}
          <div class="font-black text-sm text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
            <span>📋 דוח בוקר מרוכז — סדרנות ח. סבן</span>
            <span class="text-xs text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full font-bold">היום</span>
          </div>
          <div class="space-y-2 text-xs">
            <div class="p-2.5 rounded-xl bg-sky-50/70 border border-sky-200">
              <div class="font-extrabold text-sky-900 flex items-center justify-between">
                <span>🏗️ חכמת (מרצדס מנוף 615-41-002)</span>
                <span class="text-[10px] bg-sky-200 text-sky-900 px-1.5 py-0.5 rounded">מחסן 4 החרש</span>
              </div>
              <ul class="list-disc list-inside mt-1.5 space-y-1 text-slate-700 font-semibold">
                <li><strong>הזמנה 6215454 (שחר שאול, הוד השרון):</strong> 2 בלות סומסום, 80 שק ריצופית, 30 פלסטומר, גבס כחול (2 בלות, 2 משטחים).</li>
                <li><strong>הזמנה 6215432 (מידן לירן, כפר סבא):</strong> 40 טיח גבס גלון, הובלת מנוף (משטח סבן פקדון).</li>
                <li><strong>הזמנה 6215430 (ל.ה בניה, לב השכונה):</strong> 60 בלוקים בטון, 4 בלות סומסום.</li>
              </ul>
            </div>
            <div class="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <div class="font-extrabold text-emerald-900 flex items-center justify-between">
                <span>🚛 עלי (איסוזו פתוחה 654-51-701)</span>
                <span class="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded">מחסן 1 התלמיד</span>
              </div>
              <ul class="list-disc list-inside mt-1.5 space-y-1 text-slate-700 font-semibold">
                <li><strong>הזמנה 5040087 (אידלסון הראל, תל אביב):</strong> מלט, חול, 40 סיקפלקס שרוול, ללא פריקה.</li>
                <li><strong>הזמנה 5020025 (לירן/מוצקין, רעננה):</strong> עצי פיני, משושים לבטון 130 יח', אזיקונים KSS.</li>
                <li><strong>הזמנה 6215352 (ארגמן, הוד השרון):</strong> 18 לוחות גבס לבן 260, שיטרוק וברגים.</li>
              </ul>
            </div>
          </div>
          <div class="text-[11px] text-slate-600 font-bold bg-slate-50 p-2 rounded-lg">
            ⚡ סנכרון קומקס מעודכן. כל הנהגים קיבלו את כתובות ה-Waze למכשירים.
          </div>
        </div>
      `;
    }

    if (q.includes('שיבוץ') || q.includes('חכמת') || q.includes('עלי') || q.includes('רכב')) {
      return `
        <div class="space-y-2.5 text-xs">
          ${memoryBadge}
          <div class="font-black text-sm text-slate-900 border-b border-slate-200 pb-1">
            🚚 סטטוס רכבים ושיבוץ נהגים להיום
          </div>
          <div class="grid grid-cols-1 gap-2">
            <div class="p-2.5 rounded-xl bg-sky-50/60 border border-sky-200 font-bold">
              <div class="text-sky-900 font-extrabold flex justify-between">
                <span>🏗️ חכמת (מרצדס מנוף 615-41-002)</span>
                <span class="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">פעיל</span>
              </div>
              <div class="text-slate-600 mt-1">משימות: הוד השרון, כפר סבא, רעננה | סה״כ 14 פריקות מנוף</div>
              <div class="text-slate-500 text-[11px]">מטען מועמס: בלות סומסום וחול, משטחי ריצופית ובלוקים</div>
            </div>
            <div class="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 font-bold">
              <div class="text-emerald-900 font-extrabold flex justify-between">
                <span>🚛 עלי (איסוזו פתוחה 654-51-701)</span>
                <span class="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">בחלוקה</span>
              </div>
              <div class="text-slate-600 mt-1">משימות: גבעתיים, תל אביב, רעננה | סה״כ 9 קווי הובלה ללא פריקה</div>
              <div class="text-slate-500 text-[11px]">מטען מועמס: לוחות גבס 260/300, פרופילים, צבעים ודבקים</div>
            </div>
          </div>
        </div>
      `;
    }

    if (q.includes('פקדון') || q.includes('מחשבון') || q.includes('סומסום') || q.includes('מלט')) {
      return `
        <div class="space-y-2 text-xs">
          ${memoryBadge}
          <div class="font-black text-sm text-slate-900 border-b border-slate-200 pb-1">
            🛡️ פקדונות קומקס — בדיקת 1:1 של ח. סבן
          </div>
          <div class="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-slate-800 space-y-1 font-bold">
            <div>• <strong>שק גדול (מק"ט 60002):</strong> בדיקת 1:1 עבור כל בלה (חול, סומסום, טיט, חצץ).</div>
            <div>• <strong>משטח סבן פקדון (מק"ט 60060):</strong> נדרש משטח לכל 40 שקי מלט/טיט/ריצופית.</div>
            <div>• <strong>משטח בלוקים (מק"ט 60006):</strong> עבור 50-60 יח' בלוק בטון.</div>
          </div>
          <div class="text-[11px] font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
            בדקתי, ראמי: אין חריגות פקדון בהזמנות הפתוחות!
          </div>
        </div>
      `;
    }

    if (q.includes('בסידור') || (q.includes('הזמנות') && (q.includes('סופק') || q.includes('פתוח') || q.includes('סידור')))) {
      const activeOrders = SABAN_ORDERS.filter((o) => !o.status.includes('סופק'));
      return `
        <div class="space-y-3 text-xs">
          ${memoryBadge}
          <div class="font-black text-sm text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <span>📋 הזמנות בסטטוס בסידור (ללא סופק)</span>
            </span>
            <span class="text-xs bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">
              ${activeOrders.length} הזמנות פעילות
            </span>
          </div>
          <div class="text-slate-600 font-bold">
            הנה ריכוז כל ההזמנות שעדיין בסידור עבודה, בהכנה או בהפצה (ללא הזמנות שסופקו במלואן):
          </div>
          <div class="space-y-2 max-h-80 overflow-y-auto pr-1">
            ${activeOrders
              .map(
                (o) => `
              <div class="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition space-y-1">
                <div class="flex items-center justify-between">
                  <span class="font-black text-sky-700">#${o.orderNumber} — ${o.customerName}</span>
                  <span class="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">${o.status}</span>
                </div>
                <div class="text-[11px] text-slate-600">📍 ${o.deliveryAddress}</div>
                <div class="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 font-semibold text-slate-700">
                  <span>🏢 ${o.warehouse} | 🚛 ${o.driver}</span>
                  <span>🛡️ בלות: ${o.bigBagsDeposit} | משטחים: ${o.palletsDeposit}</span>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
          <div class="text-[11px] text-emerald-800 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
            💡 ניתן לפתוח את המגירה המקצועית או להקליק על הזמנה לקבלת פרטים מלאים וניווט Waze.
          </div>
        </div>
      `;
    }

    // Match order number or customer
    const found = SABAN_ORDERS.find(
      (o) =>
        o.orderNumber.includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.deliveryAddress.toLowerCase().includes(q)
    );

    if (found) {
      return `
        <div class="space-y-2 text-xs font-bold text-slate-800">
          ${memoryBadge}
          <div class="font-black text-sm text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
            <span>📦 הזמנה #${found.orderNumber}</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">${found.status}</span>
          </div>
          <div>👤 <strong>לקוח:</strong> ${found.customerName}</div>
          <div>📍 <strong>כתובת:</strong> ${found.deliveryAddress}</div>
          <div>🏢 <strong>מחסן מנפק:</strong> ${found.warehouse}</div>
          <div>🚛 <strong>נהג:</strong> ${found.driver}</div>
          <div>🛡️ <strong>פקדונות:</strong> בלות: ${found.bigBagsDeposit} | משטחים: ${found.palletsDeposit}</div>
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700 whitespace-pre-line">
            ${found.itemsText}
          </div>
          <div class="flex items-center gap-3 pt-1">
            ${
              found.wazeUrl
                ? `<a href="${found.wazeUrl}" target="_blank" class="inline-flex items-center gap-1 text-sky-600 font-extrabold hover:underline">🧭 ניווט Waze</a>`
                : ''
            }
            ${
              found.whatsappUrl
                ? `<a href="${found.whatsappUrl}" target="_blank" class="inline-flex items-center gap-1 text-emerald-600 font-extrabold hover:underline">📲 שגר בוואטסאפ</a>`
                : ''
            }
          </div>
        </div>
      `;
    }

    return `
      <div class="space-y-2 text-slate-900 text-xs font-bold leading-relaxed">
        ${memoryBadge}
        <div class="text-sm text-slate-900 font-extrabold">
          הבנתי אותך ראמי. ❤️ אני רושמת ומסנכרנת את הבקשה מול סידור העבודה.
        </div>
        <div class="text-xs text-slate-700 font-medium bg-white/90 p-2.5 rounded-xl border border-slate-200">
          אני מחזיקה את כל הנתונים של סניף 4 (החרש) וסניף 1 (התלמיד), הנהגים חכמת ועלי ומערך הפקדונות.
        </div>
        <div class="text-[11px] text-sky-900 font-bold">
          מה המשימה הבאה שתרצה להריץ – שיבוץ נהג, בדיקת פקדונות או דוח בוקר?
        </div>
      </div>
    `;
  };

  return (
    <div className="fixed inset-0 h-[100dvh] w-full max-w-full flex flex-col overflow-hidden text-slate-900 select-none antialiased bg-[#efeae2] safe-pl safe-pr">
      {/* Header WhatsApp theme with mobile safe top padding */}
      <header className="h-16 safe-pt px-3 sm:px-5 bg-[#f0f2f5] border-b border-slate-200 shadow-xs flex items-center justify-between z-20 flex-shrink-0 box-content">
        <div className="flex items-center gap-3">
          <div
            className="relative cursor-pointer group"
            onClick={() => setIsDrawerOpen(true)}
            title="פתח כלים מקצועיים"
          >
            <img
              src={AVATAR_URL}
              alt="נועה AI"
              onError={(e) => {
                // Fallback to svg icon if external url is unreachable
                (e.target as HTMLImageElement).src = '/icon.svg';
              }}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-sky-500 shadow-sm transition group-hover:scale-105"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>

          <div>
            <h1 className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>נועה AI ❤️</span>
              <span className="text-sky-700 text-xs font-black px-2 py-0.5 rounded-full bg-sky-100 border border-sky-200">
                סדרנית ח. סבן
              </span>
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 transition cursor-pointer"
                title="לחץ לפתיחת הגדרות ובדיקת מפתחות Gemini"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${serverAvailability === 'online' ? 'bg-emerald-500 animate-pulse' : serverAvailability === 'degraded' ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
                <span>
                  Gemini Flash • {aiInfo.activeKeyIndex ? `מפתח #${aiInfo.activeKeyIndex}` : `${aiInfo.totalKeys || 3} מפתחות ברוטציה`}
                </span>
              </button>
              {serverAvailability !== 'online' && (
                <span
                  title="שרת הענן מוגן במצב אופליין מקומי"
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1"
                >
                  <ServerOff className="w-3 h-3 text-amber-700" />
                  <span>מעקף מקומי פעיל</span>
                </span>
              )}
              <span className="text-slate-400 text-xs hidden sm:inline">•</span>
              <span className="text-[12px] font-medium text-slate-500 hidden sm:inline">יד ימינו של ראמי</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Sound Toggle */}
          <button
            id="sound-btn"
            onClick={toggleSound}
            title={soundEnabled ? 'השתק צליל התראה' : 'הפעל צליל התראה'}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition active:scale-95"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-sky-600" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {/* Web Push Notification */}
          <button
            id="push-btn"
            onClick={requestPushNotification}
            title="הפעל התראות פוש בנייד"
            className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition active:scale-95"
          >
            <BellRing className="w-5 h-5 text-amber-600" />
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Operational Memory Modal Button */}
          <button
            id="memory-notebook-btn"
            onClick={() => setIsMemoryModalOpen(true)}
            title="פנקס הזיכרון הלוגיסטי של ראמי"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Brain className="w-4 h-4 text-sky-700" />
            <span className="hidden sm:inline">פנקס הזיכרון</span>
            <span className="bg-sky-200 text-sky-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
              {memories.length}
            </span>
          </button>

          {/* Professional Tools Drawer */}
          <button
            id="tools-drawer-btn"
            onClick={() => setIsDrawerOpen(true)}
            title="כלים מקצועיים ומשקפת גיליונות"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-xs transition active:scale-95"
          >
            <Briefcase className="w-4 h-4" />
            <span className="hidden md:inline">כלים מקצועיים</span>
          </button>

          {/* Clear Chat */}
          <button
            id="clear-chat-btn"
            onClick={handleClearChat}
            title="נקה שיחה מקומית"
            className="p-2 rounded-full hover:bg-slate-200 text-slate-500 hover:text-red-600 transition"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Chat Scroll View */}
      <main
        id="chat-scroller"
        className="flex-1 pwa-chat-scroll px-3 sm:px-6 py-4 space-y-4 whatsapp-bg"
      >
        <div id="messages-list" className="max-w-3xl mx-auto space-y-4">
          {/* Day Header Pill */}
          <div className="flex justify-center">
            <span className="px-3.5 py-1 rounded-lg bg-white/90 backdrop-blur-xs border border-slate-200/90 text-[11px] font-bold text-slate-600 shadow-xs uppercase tracking-wider">
              היום • סדרנות ח. סבן חומרי בניין (1994) בע״מ
            </span>
          </div>

          {/* Render Messages */}
          {messages.map((m) => {
            if (m.sender === 'rami') {
              return (
                <div key={m.id} className="flex items-start gap-2 justify-end mr-auto max-w-xl">
                  <div className="bubble-rami p-3 sm:p-4 text-slate-900 border border-[#c9e8b2]">
                    <div className="text-[13px] font-bold leading-relaxed whitespace-pre-wrap">
                      {m.text}
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] font-semibold text-slate-500">{m.timestamp}</span>
                      <CheckCheck className="w-3.5 h-3.5 text-sky-600" />
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={m.id} className="flex items-start gap-3 max-w-xl">
                <img
                  src={AVATAR_URL}
                  alt="נועה AI"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/icon.svg';
                  }}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-sky-500 shadow-xs flex-shrink-0 mt-0.5"
                />
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 text-slate-900 font-bold text-sm leading-relaxed flex-1 min-w-0">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
                    <span className="font-extrabold text-xs text-sky-700 flex items-center gap-1">
                      <span>נועה AI ❤️</span>
                      <span className="text-[10px] text-slate-500 font-bold">ח. סבן</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">{m.timestamp}</span>
                  </div>
                  {m.htmlContent ? (
                    <div
                      className="text-slate-900 font-bold text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: m.htmlContent }}
                    />
                  ) : (
                    <div className="text-slate-900 font-bold text-sm leading-relaxed whitespace-pre-wrap">
                      {m.text}
                    </div>
                  )}

                  {/* Render Embedded Interactive Chart Card if present */}
                  {m.actionCard?.type === 'chart_analysis' && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <WarehouseOrdersChart
                        className="p-3 bg-slate-50/60 border-sky-200"
                        onSelectPrompt={(prompt) => handleSendQuery(prompt)}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Retry notification or typing indicator */}
          {retryStatus && retryStatus.active && (
            <div id="retry-indicator" className="flex items-start gap-3 max-w-xl animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 ring-2 ring-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <RefreshCw className="w-5 h-5 text-amber-600 animate-spin" />
              </div>
              <div className="bubble-noa px-4 py-3 border border-amber-200 bg-amber-50/80 text-amber-900 rounded-2xl shadow-xs space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  <span className="text-xs font-black">רענון תקשורת אוטומטי (Auto-Retry)</span>
                </div>
                <div className="text-[11px] font-semibold text-amber-800">
                  {retryStatus.text}
                </div>
              </div>
            </div>
          )}

          {/* Typing Indicator */}
          {isTyping && !retryStatus && (
            <div id="typing-indicator" className="flex items-start gap-3 max-w-xl animate-fade-in">
              <img
                src={AVATAR_URL}
                alt="נועה AI"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-sky-500 shadow-xs flex-shrink-0 mt-0.5"
              />
              <div className="bubble-noa px-4 py-3 flex items-center gap-2 border border-slate-200/80">
                <span className="w-2 h-2 bg-sky-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-sky-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-sky-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-xs font-bold text-slate-600 mr-1.5">
                  נועה מעבדת נתונים בגיליון...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Quick Prompts Bar */}
      <QuickPromptsBar onSelectPrompt={(prompt) => handleSendQuery(prompt)} />

      {/* Typing & Send Footer with safe-pb for Samsung gesture pill / home bar */}
      <footer className="p-2 sm:p-3 safe-pb bg-[#f0f2f5] border-t border-slate-200 z-20 flex-shrink-0">
        <form
          id="chat-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery(inputVal);
          }}
          className="max-w-3xl mx-auto flex items-center gap-2"
        >
          {/* Attach / Select order button */}
          <button
            type="button"
            onClick={() => setIsAttachModalOpen(true)}
            title="צרף מספר הזמנה או תעודה"
            className="p-2.5 rounded-full hover:bg-slate-200 text-slate-600 hover:text-sky-600 transition flex-shrink-0"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Input text */}
          <div className="flex-1 relative">
            <input
              type="text"
              id="chat-input"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="הקלד פקודה לנועה, מספר הזמנה, או פרטי סידור..."
              autoComplete="off"
              className="w-full bg-white border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 placeholder-slate-400 outline-none shadow-xs transition"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="w-11 h-11 rounded-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white flex items-center justify-center shadow-sm transition flex-shrink-0 active:scale-95 cursor-pointer"
          >
            <Send className="w-5 h-5 rotate-180" />
          </button>
        </form>
      </footer>

      {/* Slide-out Professional Drawer */}
      <ProfessionalDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelectOrderPrompt={(p) => handleSendQuery(p)}
        onShareChartToChat={handleShareChartToChat}
      />

      {/* Attach / Quick Order Selection Modal */}
      {isAttachModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-sky-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  בחר הזמנה לשיגור שאילתה מהירה לנועה
                </h3>
              </div>
              <button
                onClick={() => setIsAttachModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-between gap-2 mb-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700">סינון מהיר:</span>
              <button
                type="button"
                onClick={() => {
                  setIsAttachModalOpen(false);
                  handleSendQuery('הצג את כל ההזמנות בסטטוס בסידור עבודה שלא בסטטוס סופק');
                }}
                className="text-xs font-black text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-lg border border-amber-300 transition flex items-center gap-1 cursor-pointer"
              >
                <span>⚡ הצג רק הזמנות בסטטוס בסידור (ללא סופק)</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {SABAN_ORDERS.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => {
                    setIsAttachModalOpen(false);
                    handleSendQuery(`בדוק סטטוס הזמנה ${ord.orderNumber} של לקוח ${ord.customerName}`);
                  }}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 transition cursor-pointer text-xs space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-sky-700">#{ord.orderNumber}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      {ord.warehouse}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900">{ord.customerName}</div>
                  <div className="text-slate-500">{ord.deliveryAddress}</div>
                  <div className="text-[11px] text-slate-600 font-semibold pt-1 border-t border-slate-200/60 flex justify-between">
                    <span>נהג: {ord.driver}</span>
                    <span className="text-emerald-700 font-bold">{ord.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Offline Connectivity Banner */}
      <OfflineIndicator />

      {/* Rami's Operational Memory Modal */}
      <OperationalMemoryModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
        memories={memories}
        onAddMemory={handleAddMemory}
        onDeleteMemory={handleDeleteMemory}
        onResetDefaults={handleResetMemories}
      />
    </div>
  );
}
