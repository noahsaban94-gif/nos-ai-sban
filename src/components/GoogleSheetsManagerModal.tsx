import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Plus,
  AlertTriangle,
  FileText,
  Download,
  Filter,
  RefreshCw,
  Send,
  Building2,
  PackageCheck,
  ShieldAlert,
  MessageCircle,
  Check
} from 'lucide-react';
import { SabanOrder, SheetDiscrepancy } from '../types';
import { GOOGLE_SHEETS_CONFIG, auditSheetDiscrepancies } from '../utils/sabanSheetEngine';

interface GoogleSheetsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: SabanOrder[];
  onUpdateOrderStatus: (orderNumber: string, newStatus: string) => void;
  onReassignDriver: (orderNumber: string, newDriver: string) => void;
  onAddNewOrder: (newOrder: SabanOrder) => void;
  onSelectPrompt: (promptText: string) => void;
}

export const GoogleSheetsManagerModal: React.FC<GoogleSheetsManagerModalProps> = ({
  isOpen,
  onClose,
  orders,
  onUpdateOrderStatus,
  onReassignDriver,
  onAddNewOrder,
  onSelectPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'reconciliation' | 'add_order' | 'links'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [driverFilter, setDriverFilter] = useState<'all' | 'חכמת' | 'עלי'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'delivered'>('all');

  // New order form state
  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [itemsText, setItemsText] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('🏭 4️⃣(החרש)');
  const [selectedDriver, setSelectedDriver] = useState('חכמת (מרצדס מנוף 615-41-002)');
  const [sandBagsCount, setSandBagsCount] = useState<number>(2);
  const [cementCount, setCementCount] = useState<number>(0);
  const [isNoUnload, setIsNoUnload] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [dispatchedOrders, setDispatchedOrders] = useState<Record<string, boolean>>({});

  const handleDispatchOrderWebhook = async (order: SabanOrder) => {
    try {
      setDispatchedOrders((prev) => ({ ...prev, [order.orderNumber]: true }));
      await fetch('/api/webhook-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: 'https://hook.eu1.make.com/yvywlj4kpryenbte86oedh4826glhb3u',
          orderNumber: order.orderNumber,
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
        }),
      });
    } catch (err) {
      console.error('Dispatch error:', err);
    }
  };

  if (!isOpen) return null;

  const discrepancies = auditSheetDiscrepancies(orders);

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.orderNumber.includes(searchQuery) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDriver =
      driverFilter === 'all' ||
      (driverFilter === 'חכמת' && o.driver.includes('חכמת')) ||
      (driverFilter === 'עלי' && o.driver.includes('עלי'));
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && !o.status.includes('סופק')) ||
      (statusFilter === 'delivered' && o.status.includes('סופק'));

    return matchSearch && matchDriver && matchStatus;
  });

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !deliveryAddress.trim()) return;

    const newOrderNumber = String(6215500 + Math.floor(Math.random() * 1000));
    const palletCount = cementCount >= 40 ? Math.floor(cementCount / 40) : 0;
    const bigBagsDepositStr = isNoUnload
      ? 'פטור (הובלה ללא פריקה)'
      : `${sandBagsCount} בלות (${sandBagsCount * 35} ₪)`;
    const palletsDepositStr = isNoUnload
      ? 'פטור (הובלה ללא פריקה)'
      : palletCount > 0
      ? `${palletCount} משטח`
      : 'פטור';

    const fullItems = itemsText.trim()
      ? itemsText
      : `${sandBagsCount > 0 ? `1. סומסום/חול שק גדול | כמות: ${sandBagsCount} בלות\n` : ''}${
          cementCount > 0 ? `2. מלט אפור 25 ק"ג | כמות: ${cementCount} שק\n` : ''
        }3. הובלה ${selectedDriver.includes('מנוף') ? 'מנוף' : 'ללא פריקה'}`;

    const newOrder: SabanOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: newOrderNumber,
      orderDate: new Date().toISOString().replace('T', ' ').slice(0, 19),
      customerName: customerName.trim(),
      warehouse: selectedWarehouse,
      deliveryAddress: deliveryAddress.trim(),
      itemsText: fullItems,
      bigBagsDeposit: bigBagsDepositStr,
      palletsDeposit: palletsDepositStr,
      driver: selectedDriver,
      hasDeliveryNote: '⏳ טרם',
      status: '⏳ בסידור עבודה (חדש)',
      wazeUrl: `https://waze.com/ul?q=${encodeURIComponent(deliveryAddress)}&navigate=yes`,
      whatsappUrl: `https://api.whatsapp.com/send?text=${encodeURIComponent(`הזמנה ${newOrderNumber} עבור ${customerName}`)}`,
    };

    onAddNewOrder(newOrder);
    setFormSuccess(`הזמנה #${newOrderNumber} נוספה בהצלחה לגיליון!`);

    // Reset form
    setCustomerName('');
    setDeliveryAddress('');
    setItemsText('');
    setTimeout(() => {
      setFormSuccess(null);
      setActiveTab('orders');
    }, 1500);
  };

  const handleExportCSV = () => {
    const headers = ['מספר הזמנה', 'תאריך', 'שם לקוח', 'מחסן', 'כתובת', 'נהג', 'בלות', 'משטחים', 'תעודת משלוח', 'סטטוס'];
    const rows = orders.map((o) => [
      o.orderNumber,
      o.orderDate,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.warehouse}"`,
      `"${o.deliveryAddress.replace(/"/g, '""')}"`,
      `"${o.driver}"`,
      `"${o.bigBagsDeposit}"`,
      `"${o.palletsDeposit}"`,
      `"${o.hasDeliveryNote}"`,
      `"${o.status}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `saban_orders_sheet_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs animate-fade-in" dir="rtl">
      <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-right">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">שליטה ובקרה מלאה על הגיליונות</h2>
                <span className="text-[10px] font-black bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-2 py-0.5 rounded-full">
                  חיבור חי Google Sheets
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 font-medium">
                סנכרון דו-כיווני מול טאב הזמנות_סידור, הצלבה_ובקרה ודשבורד סידור נהגים
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 pt-2 flex items-center gap-1 sm:gap-2 flex-shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-xs font-black rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-white text-emerald-800 border-t-2 border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            <span>טאב הזמנות_סידור ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reconciliation')}
            className={`px-4 py-2 text-xs font-black rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'reconciliation'
                ? 'bg-white text-emerald-800 border-t-2 border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>טאב הצלבה_ובקרה</span>
            {discrepancies.length > 0 && (
              <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-full font-extrabold">
                {discrepancies.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('add_order')}
            className={`px-4 py-2 text-xs font-black rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'add_order'
                ? 'bg-white text-emerald-800 border-t-2 border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Plus className="w-4 h-4 text-sky-600" />
            <span>➕ הוסף הזמנה לגיליון</span>
          </button>

          <button
            onClick={() => setActiveTab('links')}
            className={`px-4 py-2 text-xs font-black rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'links'
                ? 'bg-white text-emerald-800 border-t-2 border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ExternalLink className="w-4 h-4 text-slate-600" />
            <span>גיליונות מקושרים וייצוא</span>
          </button>
        </div>

        {/* Tab 1: Orders Sheet */}
        {activeTab === 'orders' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Filters bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-xs">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="חיפוש לפי מספר הזמנה, לקוח, כתובת..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-9 py-1.5 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <select
                  value={driverFilter}
                  onChange={(e: any) => setDriverFilter(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 outline-none"
                >
                  <option value="all">כל הנהגים</option>
                  <option value="חכמת">חכמת (מנוף כבד)</option>
                  <option value="עלי">עלי (איסוזו)</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 outline-none"
                >
                  <option value="all">כל הסטטוסים</option>
                  <option value="active">פעילות בלבד (טרם סופק)</option>
                  <option value="delivered">סופק במלואו</option>
                </select>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                  title="ייצא שורות ל-CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ייצוא CSV</span>
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                  <tr>
                    <th className="p-3">מספר ולקוח</th>
                    <th className="p-3">מחסן ויעד</th>
                    <th className="p-3">פירוט פריטים</th>
                    <th className="p-3">נהג מוקצה</th>
                    <th className="p-3">ת.משלוח</th>
                    <th className="p-3">סטטוס בגיליון</th>
                    <th className="p-3 text-center">פעולות מהירות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500 font-bold">
                        לא נמצאו הזמנות תואמות לסינון
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => {
                      const isDelivered = o.status.includes('סופק');
                      return (
                        <tr
                          key={o.id}
                          className={`hover:bg-slate-50/80 transition ${
                            isDelivered ? 'bg-emerald-50/30 text-slate-600' : 'bg-white'
                          }`}
                        >
                          <td className="p-3">
                            <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                              <span className="text-sky-700 font-mono">#{o.orderNumber}</span>
                              <span>{o.customerName}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-semibold">{o.orderDate}</div>
                          </td>

                          <td className="p-3">
                            <div className="font-bold text-slate-800">{o.warehouse}</div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[150px]">{o.deliveryAddress}</div>
                          </td>

                          <td className="p-3">
                            <div className="text-[11px] font-semibold text-slate-700 max-w-[180px] truncate" title={o.itemsText}>
                              {o.itemsText.split('\n')[0]}
                            </div>
                            <div className="text-[10px] text-amber-800 font-bold">
                              בלות: {o.bigBagsDeposit} | משטחים: {o.palletsDeposit}
                            </div>
                          </td>

                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                                  o.driver.includes('חכמת')
                                    ? 'bg-sky-50 text-sky-800 border-sky-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                              >
                                {o.driver.includes('חכמת') ? 'חכמת (מנוף)' : 'עלי (איסוזו)'}
                              </span>
                            </div>
                          </td>

                          <td className="p-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                o.hasDeliveryNote.includes('כן')
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {o.hasDeliveryNote}
                            </span>
                          </td>

                          <td className="p-3">
                            <span
                              className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${
                                isDelivered
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : o.status.includes('בהכנה')
                                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                                  : 'bg-amber-100 text-amber-900 border-amber-300'
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>

                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {!isDelivered ? (
                                <button
                                  onClick={() => onUpdateOrderStatus(o.orderNumber, '✅ סופק במלואו')}
                                  className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition shadow-2xs"
                                  title="סמן כסופק בגיליון"
                                >
                                  סמן כסופק
                                </button>
                              ) : (
                                <button
                                  onClick={() => onUpdateOrderStatus(o.orderNumber, '⏳ בסידור עבודה')}
                                  className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold transition"
                                  title="החזר לסטטוס בסידור"
                                >
                                  החזר לסידור
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  const nextDriver = o.driver.includes('חכמת')
                                    ? 'עלי (משאית איסוזו פתוחה 654-51-701)'
                                    : 'חכמת (מרצדס מנוף 615-41-002)';
                                  onReassignDriver(o.orderNumber, nextDriver);
                                }}
                                className="px-2 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800 text-[10px] font-bold transition"
                                title="החלף נהג בין חכמת לעלי"
                              >
                                החלף נהג
                              </button>

                              <button
                                onClick={() => handleDispatchOrderWebhook(o)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-0.5 cursor-pointer ${
                                  dispatchedOrders[o.orderNumber]
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                                title="שדר הודעת וואטסאפ לנהג דרך ווביהוק Make"
                              >
                                {dispatchedOrders[o.orderNumber] ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>שודר</span>
                                  </>
                                ) : (
                                  <>
                                    <MessageCircle className="w-3 h-3" />
                                    <span>וואטסאפ</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Reconciliation & Audit */}
        {activeTab === 'reconciliation' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 font-black text-amber-900 text-sm">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <span>ביקורת הצלבה ובקרה (טאב הצלבה_ובקרה מול הזמנות_סידור)</span>
              </div>
              <p className="text-xs text-amber-800 font-medium">
                נועה סורקת בזמן אמת אי-התאמות בין הזמנות פתוחות, תעודות משלוח חתומות, פקדונות בלות ומשטחים, וחשבוניות להעברה ללינה בהנה"ח.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="text-2xl font-black text-slate-900">{orders.length}</div>
                <div className="text-xs text-slate-500 font-bold">סך שורות בגיליון</div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                <div className="text-2xl font-black text-amber-700">
                  {orders.filter((o) => o.hasDeliveryNote.includes('טרם')).length}
                </div>
                <div className="text-xs text-amber-800 font-bold">תעודות משלוח טרם נחתמו</div>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <div className="text-2xl font-black text-emerald-700">
                  {orders.filter((o) => o.status.includes('סופק')).length}
                </div>
                <div className="text-xs text-emerald-800 font-bold">הזמנות שסופקו ונסגרו</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-black text-slate-800">רשימת חריגות ואי-התאמות שזוהו:</div>
              {discrepancies.length === 0 ? (
                <div className="p-6 text-center text-emerald-700 font-black bg-emerald-50 rounded-2xl border border-emerald-200">
                  ✅ כל ההזמנות מסונכרנות ללא חריגות פקדון או תעודות משלוח!
                </div>
              ) : (
                discrepancies.map((d, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-extrabold text-slate-900 flex items-center gap-2">
                        <span className="text-sky-700 font-mono">#{d.orderNumber}</span>
                        <span>{d.customerName}</span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            d.severity === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {d.severity === 'high' ? 'חריגה דחופה' : 'לבדיקה'}
                        </span>
                      </div>
                      <div className="text-slate-600 font-medium">{d.issue}</div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => {
                          onUpdateOrderStatus(d.orderNumber, '✅ סופק במלואו');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-2xs"
                      >
                        אשר ת.משלוח וסגור
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Add New Order directly into Sheet */}
        {activeTab === 'add_order' && (
          <form onSubmit={handleCreateOrderSubmit} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {formSuccess && (
              <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-black text-center animate-fade-in">
                {formSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">שם לקוח / חברה:</label>
                <input
                  type="text"
                  required
                  placeholder="לדוגמה: שחר שאול תכנון"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">כתובת אספקה ויעד:</label>
                <input
                  type="text"
                  required
                  placeholder="לדוגמה: הבנים 7, הוד השרון"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">מחסן מקור:</label>
                <select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 outline-none"
                >
                  <option value="🏭 4️⃣(החרש)">סניף 4 (החרש) - חומרים כבדים ואגרגטים</option>
                  <option value="🏟️ 1️⃣(התלמיד)">סניף 1 (התלמיד) - גבס, פרופילים וצבע</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">שיבוץ נהג ומשאית:</label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 outline-none"
                >
                  <option value="חכמת (מרצדס מנוף 615-41-002)">חכמת — מרצדס מנוף כבד (סניף 4)</option>
                  <option value="עלי (משאית איסוזו פתוחה 654-51-701)">עלי — איסוזו חלוקה וגבס (סניף 1)</option>
                </select>
              </div>
            </div>

            {/* Deposit Quick Calculator */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between font-black text-emerald-950">
                <span>תחשיב פקדונות קומקס אוטומטי (1:1):</span>
                <label className="flex items-center gap-1 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNoUnload}
                    onChange={(e) => setIsNoUnload(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>הובלה ללא פריקה (פטור)</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3 font-bold">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">בלות שק גדול (מק"ט 60002):</label>
                  <input
                    type="number"
                    min="0"
                    value={sandBagsCount}
                    onChange={(e) => setSandBagsCount(Number(e.target.value))}
                    className="w-full bg-white border border-emerald-300 rounded-lg p-1.5 font-black text-center outline-none"
                  />
                  <span className="text-[10px] text-slate-500 font-normal">35 ₪ לפקדון בלה</span>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">שקי מלט 25 ק"ג (10002):</label>
                  <input
                    type="number"
                    min="0"
                    value={cementCount}
                    onChange={(e) => setCementCount(Number(e.target.value))}
                    className="w-full bg-white border border-emerald-300 rounded-lg p-1.5 font-black text-center outline-none"
                  />
                  <span className="text-[10px] text-slate-500 font-normal">סף 40 למשטח סבן (60060)</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-extrabold mb-1">פירוט פריטים חופשי (אופציונלי):</label>
              <textarea
                rows={2}
                placeholder="למשל: 2 בלות סומסום, 40 מלט אפור, 10 לוחות גבס כחול"
                value={itemsText}
                onChange={(e) => setItemsText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-md cursor-pointer active:scale-98"
            >
              הזרק שורה חדשה לגיליון הזמנות_סידור
            </button>
          </form>
        )}

        {/* Tab 4: Direct Google Sheets Links & Web App */}
        {activeTab === 'links' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            <div className="space-y-3">
              <div className="text-xs font-black text-slate-800">קישורים ישירים לגיליונות Google Sheets הרשמיים:</div>

              <a
                href={GOOGLE_SHEETS_CONFIG.unifiedSheetUrl}
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-900 transition">
                      גיליון 1: מערכת מאוחדת — הזמנות והצלבה
                    </div>
                    <div className="text-[11px] text-slate-600">
                      כולל את טאב <strong>הזמנות_סידור</strong> וטאב <strong>הצלבה_ובקרה</strong>
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-5 h-5 text-emerald-700 group-hover:translate-x-[-2px] transition" />
              </a>

              <a
                href={GOOGLE_SHEETS_CONFIG.driverDashboardSheetUrl}
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl bg-sky-50 hover:bg-sky-100/80 border border-sky-300 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900 group-hover:text-sky-900 transition">
                      גיליון 2: נועה Ai — דשבורד סידור נהגים
                    </div>
                    <div className="text-[11px] text-slate-600">
                      סנכרון רכב חכמת (מרצדס מנוף) ועלי (איסוזו פתוחה)
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-5 h-5 text-sky-700 group-hover:translate-x-[-2px] transition" />
              </a>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="font-black text-slate-800">ייצוא נתונים מקומיים:</div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                תוכל לייצא את כל נתוני הסידור המעודכנים לקובץ CSV כדי להדביק או לפתוח באקסל וב-Google Sheets בכל רגע נתון.
              </p>
              <button
                onClick={handleExportCSV}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>הורד קובץ CSV של הגיליון הנוכחי</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600 flex-shrink-0">
          <span>{orders.length} שורות נטענו בזיכרון המערכת</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 transition cursor-pointer"
          >
            סגור מרכז בקרה
          </button>
        </div>
      </div>
    </div>
  );
};
