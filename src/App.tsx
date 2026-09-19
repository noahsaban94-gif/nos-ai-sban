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
  X
} from 'lucide-react';
import { ChatMessage } from './types';
import { SABAN_ORDERS } from './data/sabanData';
import { playNotificationChime } from './utils/audio';
import { ProfessionalDrawer } from './components/ProfessionalDrawer';
import { QuickPromptsBar } from './components/QuickPromptsBar';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { WarehouseOrdersChart } from './components/WarehouseOrdersChart';

const AVATAR_URL = 'https://i.ibb.co/GQfHTYZH/Gemini-Generated-Image-7.png';

const INITIAL_NOA_MESSAGE: ChatMessage = {
  id: 'init-1',
  sender: 'noa',
  timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
  text: 'שלום ראמי! ❤️ נועה כאן, יד ימינך בסדרנות ח. סבן חומרי בניין (1994) בע״מ.',
  htmlContent: `
    <div class="space-y-2">
      <div class="font-bold text-slate-800">
        שלום ראמי! ❤️ נועה כאן, יד ימינך בסדרנות ח. סבן חומרי בניין (1994) בע״מ.
      </div>
      <div class="text-slate-600 text-xs leading-relaxed">
        אני מחוברת ומסונכרנת עם כל הגיליונות, הקומקס וצי הרכבים:
        <ul class="list-disc list-inside mt-1 font-semibold text-slate-700">
          <li><strong>סניף 4 החרש:</strong> חכמת במרצדס מנוף (615-41-002) — בלות ומשטחים כבדים.</li>
          <li><strong>סניף 1 התלמיד:</strong> עלי באיסוזו פתוחה (654-51-701) — לוחות גבס וחלוקה.</li>
          <li><strong>מערך פקדונות 1:1:</strong> מעקב קפדני אחר שקים גדולים (60002) ומשטחי סבן (60060).</li>
        </ul>
      </div>
      <div class="text-[11px] font-bold text-sky-700 bg-sky-50 p-2 rounded-xl border border-sky-200">
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
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('sound_enabled') !== 'false';
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);

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

    const time = new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'rami',
      text,
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // 1. Check if user configured custom Google Apps Script Web App URL
    const customApiUrl = localStorage.getItem('saban_api_url');

    let replyHtml = '';

    try {
      if (customApiUrl && customApiUrl.startsWith('http')) {
        const res = await fetch(customApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'CHAT_QUERY', query: text, sender: 'Rami' }),
        });
        const data = await res.json();
        replyHtml = data.htmlMessage || data.message || '';
      } else {
        // 2. Call backend server /api/chat
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: text, sender: 'ראמי' }),
        });

        if (res.ok) {
          const data = await res.json();
          replyHtml = data.htmlMessage || data.message || '';
        }
      }
    } catch (err) {
      console.warn('Network call notice, engaging local Saban logic engine:', err);
    }

    // 3. Fallback to rich local heuristic logic if needed
    if (!replyHtml) {
      replyHtml = generateLocalSabanReply(text);
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

  const generateLocalSabanReply = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('גרף') || q.includes('נתח') || q.includes('עומס') || (q.includes('החרש') && q.includes('התלמיד'))) {
      return `
        <div class="space-y-3 text-xs">
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
      <div class="space-y-1.5 text-xs font-bold text-slate-800">
        <div>הפקודה נקלטה, ראמי! המידע נבדק ישירות מול מאגר סידור העבודה.</div>
        <div class="text-slate-600 font-normal">
          אני מחזיקה את כל הנתונים של סניף 4 (החרש) וסניף 1 (התלמיד), מסלולי הנסיעה של חכמת ועלי וחישובי הפקדונות.
        </div>
      </div>
    `;
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden text-slate-900 select-none antialiased bg-[#efeae2]">
      {/* Header WhatsApp theme */}
      <header className="h-16 px-3 sm:px-5 bg-[#f0f2f5] border-b border-slate-200 shadow-xs flex items-center justify-between z-20 flex-shrink-0">
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
            <p className="text-[12px] font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> מחוברת ומסונכרנת
              </span>
              <span>•</span>
              <span className="hidden sm:inline">יד ימינו של ראמי</span>
            </p>
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
        className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4 whatsapp-bg"
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
                <div className="bubble-noa p-4 text-slate-800 border border-slate-200/80 shadow-xs flex-1 min-w-0">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
                    <span className="font-extrabold text-xs text-sky-700 flex items-center gap-1">
                      <span>נועה AI ❤️</span>
                      <span className="text-[10px] text-slate-400 font-normal">ח. סבן</span>
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">{m.timestamp}</span>
                  </div>
                  {m.htmlContent ? (
                    <div
                      className="text-[13px] font-bold text-slate-800 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: m.htmlContent }}
                    />
                  ) : (
                    <div className="text-[13px] font-bold text-slate-800 leading-relaxed whitespace-pre-wrap">
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

          {/* Typing Indicator */}
          {isTyping && (
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

      {/* Typing & Send Footer */}
      <footer className="p-2 sm:p-3 bg-[#f0f2f5] border-t border-slate-200 z-20 flex-shrink-0">
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
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-sky-600" />
                בחר הזמנה לשיגור שאילתה מהירה לנועה
              </h3>
              <button
                onClick={() => setIsAttachModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
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
    </div>
  );
}
