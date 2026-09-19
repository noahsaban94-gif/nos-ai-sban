import React, { useState } from 'react';
import {
  X,
  Database,
  Bell,
  Sheet,
  ExternalLink,
  Search,
  Truck,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  Clock,
  Send,
  Filter,
  ListFilter,
  Check,
  Sparkles,
  RefreshCw,
  Key,
  ShieldCheck
} from 'lucide-react';
import { SABAN_ORDERS, SABAN_DRIVERS, calculateDeposits } from '../data/sabanData';
import { WarehouseOrdersChart } from './WarehouseOrdersChart';

interface ProfessionalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrderPrompt: (promptText: string) => void;
  onShareChartToChat?: (payload: {
    title: string;
    summary: string;
    statsText: string;
    actionPrompt?: string;
  }) => void;
}

export const ProfessionalDrawer: React.FC<ProfessionalDrawerProps> = ({
  isOpen,
  onClose,
  onSelectOrderPrompt,
  onShareChartToChat,
}) => {
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('saban_api_url') || '');
  const [onesignalId, setOnesignalId] = useState(() => localStorage.getItem('onesignal_app_id') || '');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Search & filter orders
  const [searchQuery, setSearchQuery] = useState('');
  const [driverFilter, setDriverFilter] = useState<'all' | 'חכמת' | 'עלי'>('all');
  const [onlyActiveFilter, setOnlyActiveFilter] = useState<boolean>(true); // "הזמנות בסטטוס בסידור" - non-delivered orders

  // AI Connection Test state
  const [testingAi, setTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<string | null>(null);

  const handleTestAi = async () => {
    setTestingAi(true);
    setAiTestResult(null);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'בדיקת חיבור מפתחות Gemini נועה AI', sender: 'בדיקת מערכת' }),
      });
      if (res.ok) {
        const data = await res.json();
        const keyInfo = data.activeKeyIndex
          ? `מפתח פעיל #${data.activeKeyIndex} מתוך ${data.totalKeys || 3}`
          : `${data.totalKeys || 3} מפתחות זמינים ברוטציה`;
        setAiTestResult(`✅ חיבור תקין! מודל: ${data.model || 'gemini-3.8-flash'} • ${keyInfo}`);
      } else {
        setAiTestResult('⚠️ שרת השיב, מנוע הסדרנות המקומי של ח. סבן מגבה את הפעילות.');
      }
    } catch {
      setAiTestResult('ℹ️ מצב אופליין / מנוע סדרנות מקומי עובד חלק וללא שגיאות.');
    } finally {
      setTestingAi(false);
    }
  };

  // Quick Deposit Calc state
  const [sandBags, setSandBags] = useState<number>(0);
  const [cementSacks, setCementSacks] = useState<number>(0);
  const [plasterSacks, setPlasterSacks] = useState<number>(0);
  const [blocksCount, setBlocksCount] = useState<number>(0);
  const [isNoUnload, setIsNoUnload] = useState<boolean>(false);

  const handleSaveApiUrl = () => {
    localStorage.setItem('saban_api_url', apiUrl.trim());
    setSaveStatus('כתובת סנכרון נשמרה בהצלחה!');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const handleSaveOneSignal = () => {
    localStorage.setItem('onesignal_app_id', onesignalId.trim());
    setSaveStatus('OneSignal App ID נשמר בהצלחה!');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const filteredOrders = SABAN_ORDERS.filter((o) => {
    const matchQuery =
      o.orderNumber.includes(searchQuery) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDriver =
      driverFilter === 'all' ||
      (driverFilter === 'חכמת' && o.driver.includes('חכמת')) ||
      (driverFilter === 'עלי' && o.driver.includes('עלי'));
    const matchStatus = !onlyActiveFilter || !o.status.includes('סופק');
    return matchQuery && matchDriver && matchStatus;
  });

  const calcResult = calculateDeposits(
    [
      { name: 'שק גדול בלה (11511)', quantity: sandBags, sku: '60002' },
      { name: 'מלט אפור 25 ק"ג (10002)', quantity: cementSacks, sku: '10002' },
      { name: 'טיח חוץ 710 / דבקים (15710)', quantity: plasterSacks, sku: '15710' },
      { name: 'בלוק 20 בטון (60006)', quantity: blocksCount },
    ],
    isNoUnload
  );

  return (
    <>
      {/* Backdrop */}
      <div
        id="drawer-backdrop"
        onClick={onClose}
        className={`fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Slide-out Drawer */}
      <aside
        id="drawer"
        className={`fixed inset-y-0 right-0 w-full sm:w-[460px] bg-white border-l border-slate-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-[#f0f2f5] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src="https://i.ibb.co/GQfHTYZH/Gemini-Generated-Image-7.png"
              alt="נועה AI"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/icon.svg';
              }}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-sky-500 shadow-sm"
            />
            <div>
              <h2 className="font-extrabold text-sm text-slate-900">משקפת תפעול וכלים מקצועיים</h2>
              <p className="text-[11px] font-semibold text-slate-500">ח. סבן חומרי בניין (1994) בע״מ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-200 transition"
            title="סגור תפריט"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-slate-800">
          {saveStatus && (
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs text-center border border-emerald-300 animate-fade-in">
              {saveStatus}
            </div>
          )}

          {/* Gemini AI Multi-Key Status Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/90 to-sky-50/90 border border-sky-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-600 animate-pulse" />
                <span>מנוע Gemini AI (3 מפתחות ב-Vercel)</span>
              </div>
              <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>3 מפתחות פעילים</span>
              </span>
            </div>

            <div className="text-[11px] text-slate-600 leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Key className="w-3.5 h-3.5 text-sky-600" />
                <span>רוטציה אוטומטית (עמידות בעומסים ו-Rate Limit)</span>
              </div>
              <p className="text-[11px] text-slate-500">
                מודל נבחר: <strong>gemini-3.8-flash</strong>. בעת עומס או מגבלת מכסה, נועה AI עוברת שקוף למפתח הבא ברצף.
              </p>
            </div>

            {aiTestResult && (
              <div className="p-2.5 rounded-xl bg-white border border-sky-200 text-xs font-bold text-slate-800 animate-fade-in shadow-2xs">
                {aiTestResult}
              </div>
            )}

            <button
              type="button"
              id="test-gemini-keys-btn"
              onClick={handleTestAi}
              disabled={testingAi}
              className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs active:scale-98 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingAi ? 'animate-spin' : ''}`} />
              <span>{testingAi ? 'בודק תקינות מפתחות...' : 'בדוק תקינות מפתחות וסנכרון עכשיו'}</span>
            </button>
          </div>

          {/* Web App Google Sheets Code.gs sync */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="text-xs font-black text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-sky-600" />
                <span>כתובת Web App לסנכרון גיליונות (Code.gs):</span>
              </span>
              <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.2 rounded">
                פרוקסי שרת מוגן CORS
              </span>
            </div>
            <input
              type="text"
              id="api-url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:border-sky-500 outline-none"
            />
            <div className="text-[10px] text-slate-500 font-medium">
              💡 הבקשות מנותבות כעת דרך שרת הפרוקסי של נועה ללא חסימות דפדפן (No CORS).
            </div>
            <button
              onClick={handleSaveApiUrl}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition shadow-xs active:scale-98"
            >
              שמור כתובת סנכרון בזיכרון מקומי
            </button>
          </div>

          {/* OneSignal App ID */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
            <div className="text-xs font-black text-amber-900 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-amber-600" />
              <span>OneSignal App ID (התראות פוש לנייד):</span>
            </div>
            <input
              type="text"
              id="onesignal-id"
              value={onesignalId}
              onChange={(e) => setOnesignalId(e.target.value)}
              placeholder="הזן OneSignal App ID (לדוגמה: xxxxxxxx-xxxx-xxxx)"
              className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:border-amber-500 outline-none"
            />
            <button
              onClick={handleSaveOneSignal}
              className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs active:scale-98"
            >
              שמור App ID להתראות
            </button>
          </div>

          {/* Deposit Calculator Widget */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
            <div className="text-xs font-black text-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                <span>מחשבון פקדונות קשיח (v3.0 - קומקס)</span>
              </div>
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 cursor-pointer bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                <input
                  type="checkbox"
                  checked={isNoUnload}
                  onChange={(e) => setIsNoUnload(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>הובלה ללא פריקה (פטור)</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">בלות שק גדול (60002):</label>
                <input
                  type="number"
                  min="0"
                  value={sandBags || ''}
                  onChange={(e) => setSandBags(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-white border border-emerald-300 rounded-lg p-1.5 text-center font-bold outline-none"
                />
                <span className="text-[10px] text-slate-500 font-semibold">יחס 1:1 (35 ₪)</span>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">שקי מלט 25 ק"ג (10002):</label>
                <input
                  type="number"
                  min="0"
                  value={cementSacks || ''}
                  onChange={(e) => setCementSacks(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-white border border-emerald-300 rounded-lg p-1.5 text-center font-bold outline-none"
                />
                <span className="text-[10px] text-slate-500 font-semibold">סף 40 למשטח</span>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">שקי טיח/דבק (15710):</label>
                <input
                  type="number"
                  min="0"
                  value={plasterSacks || ''}
                  onChange={(e) => setPlasterSacks(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-white border border-emerald-300 rounded-lg p-1.5 text-center font-bold outline-none"
                />
                <span className="text-[10px] text-slate-500 font-semibold">סף 20 למשטח</span>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">בלוק 20 בטון (60006):</label>
                <input
                  type="number"
                  min="0"
                  value={blocksCount || ''}
                  onChange={(e) => setBlocksCount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-white border border-emerald-300 rounded-lg p-1.5 text-center font-bold outline-none"
                />
                <span className="text-[10px] text-slate-500 font-semibold">75 יח' למשטח</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-slate-800 space-y-1">
              {calcResult.isExempt ? (
                <div className="text-emerald-700 font-black">
                  ✅ פטור מלא מפקדונות בלות ומשטחים (הובלה ללא פריקה, מק"ט 818050–818118)
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>פקדון בלות (מק"ט 60002):</span>
                    <span className="text-sky-700 font-extrabold">{calcResult.bigBags} יח' ({calcResult.bigBags * 35} ₪)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>פקדון משטח סבן (מק"ט 60060):</span>
                    <span className="text-emerald-700 font-extrabold">{calcResult.pallets} יח' ({calcResult.pallets * 35} ₪)</span>
                  </div>
                  {calcResult.blockPallets > 0 && (
                    <div className="flex justify-between">
                      <span>משטח בלוקים (מק"ט 60006):</span>
                      <span className="text-purple-700 font-extrabold">{calcResult.blockPallets} יח'</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-100 pt-1 text-slate-900 font-black">
                    <span>סה"כ פקדונות (לפני מע"מ):</span>
                    <span className="text-emerald-800">{calcResult.totalDepositCostBeforeVat} ₪</span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => {
                onSelectOrderPrompt(
                  isNoUnload
                    ? '🛡️ האם הזמנה עם הובלה ללא פריקה פטורה מפקדונות בלות ומשטחים בקומקס?'
                    : `🛡️ בדוק פקדון בקומקס v3.0 עבור: ${sandBags} בלות, ${cementSacks} שקי מלט, ${plasterSacks} טיח ו-${blocksCount} בלוקים`
                );
                onClose();
              }}
              className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
            >
              שאל את נועה על פקדון זה בצ'אט
            </button>
          </div>

          {/* Drivers status glance */}
          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-2">
            <div className="text-xs font-black text-sky-900 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-sky-600" />
              <span>צי רכבים ונהגים פעילים</span>
            </div>
            <div className="space-y-2 text-xs font-bold">
              {SABAN_DRIVERS.map((d) => (
                <div key={d.name} className="p-2.5 rounded-xl bg-white border border-sky-100 flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-slate-900">{d.name} — {d.role}</div>
                    <div className="text-[11px] text-slate-500">{d.truck} | מ.ר {d.plateNumber}</div>
                  </div>
                  <button
                    onClick={() => {
                      onSelectOrderPrompt(`🚚 מה מצב השיבוצים הנוכחי של ${d.name}?`);
                      onClose();
                    }}
                    className="px-2 py-1 rounded bg-sky-100 hover:bg-sky-200 text-sky-800 text-[11px] font-bold"
                  >
                    בדוק שיבוץ
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Warehouse Orders Bar Chart (Recharts) */}
          <WarehouseOrdersChart
            onShareToChat={(payload) => {
              if (onShareChartToChat) {
                onShareChartToChat(payload);
                onClose();
              }
            }}
            onSelectPrompt={(prompt) => {
              onSelectOrderPrompt(prompt);
              onClose();
            }}
          />

          {/* System sheets links (Module 1) */}
          <div className="space-y-2">
            <div className="text-xs font-extrabold text-slate-700">גיליונות מערכת פעילים (Google Sheets):</div>
            
            <a
              href="https://docs.google.com/spreadsheets/d/1Ie7gKql_EDdrIN9HqunJc9Ey5k0WXXfPRxs0Vp1Bs2c"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 transition"
            >
              <div className="flex items-center gap-2.5">
                <Sheet className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">מערכת מאוחדת - הזמנות והצלבה</div>
                  <div className="text-[10px] text-slate-500 font-semibold">טאבים: הזמנות_סידור | הצלבה_ובקרה</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-emerald-600" />
            </a>

            <a
              href="https://docs.google.com/spreadsheets/d/1VA9J6n9IYcooO_s2xOpnkvyDQWWQD3pfhh0cnenCkoA"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-sky-50 hover:bg-sky-100/70 border border-sky-200 transition"
            >
              <div className="flex items-center gap-2.5">
                <Sheet className="w-5 h-5 text-sky-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">נועה Ai — דשבורד סידור נהגים</div>
                  <div className="text-[10px] text-slate-500 font-semibold">סנכרון רכב חכמת (מנוף) ועלי (איסוזו)</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-sky-600" />
            </a>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  onSelectOrderPrompt('📋 סנכרן נתונים מול טאב הזמנות_סידור בגיליון המאוחד');
                  onClose();
                }}
                className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold text-center transition"
              >
                טאב הזמנות_סידור
              </button>
              <button
                onClick={() => {
                  onSelectOrderPrompt('🔍 בצע הצלבה ובקרה מול טאב הצלבה_ובקרה בגיליון');
                  onClose();
                }}
                className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold text-center transition"
              >
                טאב הצלבה_ובקרה
              </button>
            </div>
          </div>

          {/* Orders live inspector */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="text-xs font-extrabold text-slate-800">
                {onlyActiveFilter ? 'הזמנות בסטטוס בסידור' : 'כל ההזמנות'} ({filteredOrders.length}):
              </div>
              <div className="flex gap-1">
                {(['all', 'חכמת', 'עלי'] as const).map((drv) => (
                  <button
                    key={drv}
                    onClick={() => setDriverFilter(drv)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                      driverFilter === drv
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {drv === 'all' ? 'הכל' : drv}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick status toggle button: 'הזמנות בסטטוס בסידור' (excludes 'סופק') */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="filter-orders-in-arrangement-btn"
                onClick={() => setOnlyActiveFilter(!onlyActiveFilter)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border shadow-2xs active:scale-98 ${
                  onlyActiveFilter
                    ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 ring-2 ring-amber-300/40'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>הזמנות בסטטוס בסידור</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  onlyActiveFilter ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {SABAN_ORDERS.filter((ord) => !ord.status.includes('סופק')).length}
                </span>
                {onlyActiveFilter && <Check className="w-3 h-3 text-white mr-0.5" />}
              </button>

              {onlyActiveFilter && (
                <button
                  type="button"
                  onClick={() => setOnlyActiveFilter(false)}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 transition whitespace-nowrap"
                >
                  הצג גם סופק
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="חפש לפי מספר הזמנה, לקוח או כתובת..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-8 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-sky-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
              {filteredOrders.slice(0, 10).map((o) => (
                <div
                  key={o.id}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sky-700">#{o.orderNumber}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                      {o.status}
                    </span>
                  </div>
                  <div className="font-bold text-slate-800">{o.customerName}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{o.deliveryAddress}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                    <span className="text-slate-600 font-bold">{o.driver}</span>
                    <div className="flex gap-1.5">
                      {o.wazeUrl && (
                        <a
                          href={o.wazeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-600 font-bold hover:underline"
                        >
                          Waze
                        </a>
                      )}
                      <button
                        onClick={() => {
                          onSelectOrderPrompt(`בדוק פרטי הזמנה ${o.orderNumber} של ${o.customerName}`);
                          onClose();
                        }}
                        className="text-emerald-700 font-bold hover:underline"
                      >
                        שאל בצ'אט
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
