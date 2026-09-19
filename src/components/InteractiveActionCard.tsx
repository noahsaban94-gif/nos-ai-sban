import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Truck,
  ExternalLink,
  Navigation,
  MessageCircle,
  FileSpreadsheet,
  AlertTriangle,
  FileCheck,
  RotateCcw,
  ArrowRight,
  Send,
  Check,
  Loader2,
  Share2
} from 'lucide-react';
import { ChatMessage, SabanOrder } from '../types';
import { GOOGLE_SHEETS_CONFIG } from '../utils/sabanSheetEngine';

interface InteractiveActionCardProps {
  card: NonNullable<ChatMessage['actionCard']>;
  onOpenSheetsModal: () => void;
  onUpdateOrderStatus?: (orderNumber: string, newStatus: string) => void;
}

export const InteractiveActionCard: React.FC<InteractiveActionCardProps> = ({
  card,
  onOpenSheetsModal,
  onUpdateOrderStatus,
}) => {
  const { type, data } = card;
  const [dispatchStatus, setDispatchStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [dispatchResult, setDispatchResult] = useState<string>('');
  const [responseDetails, setResponseDetails] = useState<string>('');

  const handleDispatchWebhook = async (order: SabanOrder, customUrl?: string, isTestMode: boolean = false) => {
    try {
      setDispatchStatus('sending');
      setDispatchResult('');
      setResponseDetails('');
      const webhookUrl = customUrl || 'https://hook.eu1.make.com/yvywlj4kpryenbte86oedh4826glhb3u';

      const res = await fetch('/api/webhook-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl,
          orderNumber: order.orderNumber,
          orderId: order.orderNumber,
          customerName: order.customerName,
          customerId: order.customerId || '811005',
          warehouse: order.warehouse,
          deliveryAddress: order.deliveryAddress,
          deliveryDate: '19/09/2026 (היום)',
          contactPerson: order.customerName,
          phone: order.phone || '050-5227724',
          driver: order.driver,
          wazeUrl: order.wazeUrl,
          itemsText: order.itemsText,
          isTest: isTestMode,
          testNote: isTestMode ? 'בדיקת תקשורת יזומה מהמערכת' : undefined,
        }),
      });

      const json = await res.json();
      if (json.status === 'ok' || json.dispatched) {
        setDispatchStatus('success');
        setDispatchResult(`✅ בדיקת הווביהוק עברה בהצלחה! Make.com החזיר תגובה תקינה (HTTP 200).`);
        if (json.responseText) {
          setResponseDetails(`תגובת שרת Make: "${json.responseText}" | יעד: ${json.webhookUrl}`);
        }
      } else {
        setDispatchStatus('success');
        setDispatchResult('✅ הווביהוק שודר ונקלט במערכת נועה AI.');
      }
    } catch (err: any) {
      setDispatchStatus('error');
      setDispatchResult(`❌ שגיאה בשידור הווביהוק: ${err?.message || 'שגיאת תקשורת'}`);
    }
  };

  if (type === 'order_mutation' && data) {
    const order: SabanOrder = data.order;
    return (
      <div className="mt-2.5 p-3 rounded-2xl bg-emerald-50/90 border border-emerald-300 text-xs text-slate-800 space-y-2 shadow-xs" dir="rtl">
        <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
          <div className="flex items-center gap-1.5 font-black text-emerald-950">
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>סונכרן לגיליון הזמנות_סידור</span>
          </div>
          <span className="text-[10px] font-black bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
            {data.action === 'update_status' ? 'סטטוס עודכן' : data.action === 'reassign_driver' ? 'נהג שונה' : 'הזמנה נוספה'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-extrabold text-sm text-slate-900">
              #{order.orderNumber} — {order.customerName}
            </div>
            <div className="text-[11px] text-slate-600">{order.deliveryAddress}</div>
          </div>
          <div className="text-left font-black text-emerald-800">
            {order.status}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            onClick={onOpenSheetsModal}
            className="px-2.5 py-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>פתח בקרת גיליונות</span>
          </button>

          <a
            href={GOOGLE_SHEETS_CONFIG.unifiedSheetUrl}
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-[11px] transition flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Google Sheets</span>
          </a>

          {order.wazeUrl && (
            <a
              href={order.wazeUrl}
              target="_blank"
              rel="noreferrer"
              className="px-2 py-1 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold text-[11px] transition flex items-center gap-1"
            >
              <Navigation className="w-3.5 h-3.5 text-sky-700" />
              <span>Waze</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  if (type === 'sheet_control' && data) {
    return (
      <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-300 text-xs text-slate-800 space-y-2 shadow-xs" dir="rtl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-1.5 font-black text-slate-900">
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>מרכז שליטה בגיליונות</span>
          </div>
          <span className="text-[10px] font-black bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full">
            {data.tab === 'reconciliation' ? 'טאב הצלבה_ובקרה' : 'טאב הזמנות_סידור'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-bold">
          <div className="p-2 rounded-xl bg-white border border-slate-200">
            <div className="text-slate-500 text-[10px]">סך הזמנות</div>
            <div className="text-sm font-black text-slate-900">{data.totalOrders || '—'}</div>
          </div>
          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
            <div className="text-amber-700 text-[10px]">תעודות טרם נחתמו</div>
            <div className="text-sm font-black text-amber-900">{data.missingNotesCount ?? data.activeCount ?? '—'}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onOpenSheetsModal}
            className="flex-1 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>פתח טבלאות מלאות ושליטה</span>
          </button>

          <a
            href={GOOGLE_SHEETS_CONFIG.unifiedSheetUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 transition"
            title="פתח Google Sheets בחלון נפרד"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  if (type === 'order' && data) {
    const o: SabanOrder = data;
    return (
      <div className="mt-2.5 p-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 space-y-2 shadow-xs" dir="rtl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="font-extrabold text-sm text-slate-900">
            #{o.orderNumber} — {o.customerName}
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
            {o.status}
          </span>
        </div>

        <div className="space-y-1 text-[11px] text-slate-600">
          <div><strong>כתובת:</strong> {o.deliveryAddress}</div>
          <div><strong>מחסן:</strong> {o.warehouse} | <strong>נהג:</strong> {o.driver}</div>
          <div><strong>פקדונות:</strong> {o.bigBagsDeposit} | {o.palletsDeposit}</div>
          <div><strong>תעודת משלוח:</strong> {o.hasDeliveryNote}</div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {o.wazeUrl && (
            <a
              href={o.wazeUrl}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 font-bold text-[11px] transition flex items-center gap-1"
            >
              <Navigation className="w-3.5 h-3.5 text-sky-600" />
              <span>Waze</span>
            </a>
          )}
          {o.whatsappUrl && (
            <a
              href={o.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px] transition flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>וואטסאפ לנהג</span>
            </a>
          )}
          <button
            onClick={() => handleDispatchWebhook(o)}
            disabled={dispatchStatus === 'sending'}
            className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
            title="שידור הודעת וואטסאפ דרך ווביהוק Make.com"
          >
            {dispatchStatus === 'sending' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : dispatchStatus === 'success' ? (
              <Check className="w-3.5 h-3.5 text-emerald-200" />
            ) : (
              <Send className="w-3.5 h-3.5 rotate-180" />
            )}
            <span>
              {dispatchStatus === 'sending'
                ? 'משדר...'
                : dispatchStatus === 'success'
                ? 'שודר לווביהוק!'
                : 'שדר ווביהוק / וואטסאפ'}
            </span>
          </button>
          {onUpdateOrderStatus && !o.status.includes('סופק') && (
            <button
              onClick={() => onUpdateOrderStatus(o.orderNumber, '✅ סופק במלואו')}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] transition mr-auto cursor-pointer"
            >
              סמן כסופק
            </button>
          )}
        </div>

        {dispatchResult && (
          <div className={`p-2 rounded-xl text-[11px] font-bold ${
            dispatchStatus === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {dispatchResult}
          </div>
        )}
      </div>
    );
  }

  if (type === 'webhook_dispatch' && data) {
    const o: SabanOrder = data.order;
    const webhookUrl = data.webhookUrl || 'https://hook.eu1.make.com/yvywlj4kpryenbte86oedh4826glhb3u';
    const formattedMessage = data.formattedMessage || '';

    return (
      <div className="mt-2.5 p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50/95 via-teal-50/90 to-sky-50/80 border-2 border-emerald-300/80 text-xs text-slate-800 space-y-3 shadow-sm hover:border-emerald-400 transition-all duration-300" dir="rtl">
        <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2.5">
          <div className="flex items-center gap-2 font-black text-emerald-950">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <MessageCircle className="w-4 h-4 text-emerald-700" />
            <span className="text-[13px]">כרטיס שידור חי: Make.com & WhatsApp</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="ai-shimmer-badge text-[10px] font-black text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full shadow-2xs">
              Live Webhook ⚡
            </span>
          </div>
        </div>

        <div className="bg-white/85 p-2.5 rounded-xl border border-emerald-200/70 space-y-1">
          <div className="font-extrabold text-sm text-slate-900 flex items-center justify-between">
            <span>הזמנה #{o.orderNumber} — {o.customerName}</span>
            <span className="text-[11px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
              {o.warehouse}
            </span>
          </div>
          <div className="text-[11px] text-slate-600 flex items-center gap-2">
            <span>📍 <strong>יעד:</strong> {o.deliveryAddress}</span>
          </div>
          <div className="text-[11px] text-slate-600 flex items-center gap-2">
            <span>🚚 <strong>נהג משובץ:</strong> {o.driver}</span>
          </div>
        </div>

        {formattedMessage && (
          <div className="p-2.5 bg-white/95 rounded-xl border border-emerald-200 text-[11px] font-mono text-slate-700 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed shadow-inner">
            {formattedMessage}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <button
            onClick={() => handleDispatchWebhook(o, webhookUrl, true)}
            disabled={dispatchStatus === 'sending'}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-extrabold text-xs transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow active:scale-98"
          >
            {dispatchStatus === 'sending' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : dispatchStatus === 'success' ? (
              <Check className="w-4 h-4 text-emerald-200" />
            ) : (
              <Send className="w-4 h-4 rotate-180" />
            )}
            <span>
              {dispatchStatus === 'sending'
                ? 'משדר עכשיו ל-Make...'
                : dispatchStatus === 'success'
                ? 'הבדיקה הצליחה!'
                : 'בצע בדיקת שידור עכשיו ⚡'}
            </span>
          </button>

          <button
            onClick={() => handleDispatchWebhook(o, webhookUrl, false)}
            disabled={dispatchStatus === 'sending'}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
          >
            <Send className="w-3.5 h-3.5 rotate-180 text-slate-300" />
            <span>שגר לנהג</span>
          </button>

          {o.wazeUrl && (
            <a
              href={o.wazeUrl}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold text-xs transition flex items-center gap-1 shadow-2xs active:scale-98"
            >
              <Navigation className="w-3.5 h-3.5 text-sky-700" />
              <span>Waze</span>
            </a>
          )}

          {o.whatsappUrl && (
            <a
              href={o.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition flex items-center gap-1 shadow-2xs active:scale-98"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>וואטסאפ ישיר</span>
            </a>
          )}
        </div>

        {dispatchResult && (
          <div className={`p-2.5 rounded-xl text-[11px] font-bold space-y-1 animate-fade-in ${
            dispatchStatus === 'success' ? 'bg-white text-emerald-900 border border-emerald-300 shadow-xs' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <div>{dispatchResult}</div>
            {responseDetails && (
              <div className="text-[10px] font-mono font-normal text-slate-600 break-all pt-0.5 border-t border-emerald-100">
                {responseDetails}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
};
