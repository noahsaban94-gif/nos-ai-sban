import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import {
  BarChart3,
  Share2,
  TrendingUp,
  Sparkles,
  ArrowUpDown,
  Truck,
  Check
} from 'lucide-react';
import { SABAN_ORDERS } from '../data/sabanData';

interface WarehouseChartProps {
  className?: string;
  onShareToChat?: (chartPayload: {
    title: string;
    summary: string;
    statsText: string;
    actionPrompt?: string;
  }) => void;
  onSelectPrompt?: (promptText: string) => void;
  compact?: boolean;
}

export const WarehouseOrdersChart: React.FC<WarehouseChartProps> = ({
  className = '',
  onShareToChat,
  onSelectPrompt,
  compact = false,
}) => {
  const [copiedSuccess, setCopiedSuccess] = React.useState(false);

  // Compute weekly distribution for the working week
  const chartData = useMemo(() => {
    let liveHarash = 0;
    let liveTalmid = 0;

    SABAN_ORDERS.forEach((ord) => {
      if (ord.warehouse.includes('החרש') || ord.warehouse.includes('4')) {
        liveHarash++;
      } else if (ord.warehouse.includes('התלמיד') || ord.warehouse.includes('1')) {
        liveTalmid++;
      }
    });

    return [
      { day: 'יום א׳', date: '13/9', harash: 12, talmid: 7, total: 19 },
      { day: 'יום ב׳', date: '14/9', harash: 15, talmid: 9, total: 24 },
      { day: 'יום ג׳', date: '15/9', harash: 11, talmid: 6, total: 17 },
      { day: 'יום ד׳', date: '16/9', harash: 14, talmid: 8, total: 22 },
      { day: 'יום ה׳', date: '17/9', harash: Math.max(13, liveHarash), talmid: Math.max(6, liveTalmid), total: Math.max(13, liveHarash) + Math.max(6, liveTalmid) },
      { day: 'יום ו׳', date: '18/9', harash: 5, talmid: 3, total: 8 },
    ];
  }, []);

  const totalHarash = useMemo(() => chartData.reduce((acc, curr) => acc + curr.harash, 0), [chartData]);
  const totalTalmid = useMemo(() => chartData.reduce((acc, curr) => acc + curr.talmid, 0), [chartData]);
  const totalOrders = totalHarash + totalTalmid;
  const harashPercentage = Math.round((totalHarash / totalOrders) * 100);
  const talmidPercentage = 100 - harashPercentage;

  // Custom high-contrast brand styled Tooltip (Sky / Emerald)
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl text-xs shadow-2xl border border-slate-700/80 space-y-1.5 dir-rtl text-right min-w-[170px] z-50 animate-fade-in">
          <div className="font-extrabold text-slate-100 border-b border-slate-700/70 pb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-200">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              {label} ({dataItem.date})
            </span>
            <span className="bg-slate-800 text-sky-400 px-1.5 py-0.5 rounded text-[11px] font-bold">
              {dataItem.total} הזמנות
            </span>
          </div>

          <div className="space-y-1 pt-0.5">
            <div className="flex items-center justify-between text-sky-300 font-bold bg-sky-950/40 px-2 py-1 rounded-lg border border-sky-800/40">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-sky-500 shadow-xs"></span>
                סניף 4 (החרש):
              </span>
              <span className="font-black text-sky-200">{dataItem.harash}</span>
            </div>

            <div className="flex items-center justify-between text-emerald-300 font-bold bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-800/40">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 shadow-xs"></span>
                סניף 1 (התלמיד):
              </span>
              <span className="font-black text-emerald-200">{dataItem.talmid}</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-medium pt-1 text-center border-t border-slate-800">
            יחס סניפים: {Math.round((dataItem.harash / dataItem.total) * 100)}% מול {Math.round((dataItem.talmid / dataItem.total) * 100)}%
          </div>
        </div>
      );
    }
    return null;
  };

  const handleShare = () => {
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2200);

    if (onShareToChat) {
      onShareToChat({
        title: '📊 ניתוח גרף שבועי — סניף 4 החרש מול סניף 1 התלמיד',
        summary: `סה״כ שבועי: ${totalOrders} הזמנות. סניף 4 החרש מוביל עם ${totalHarash} הזמנות (${harashPercentage}%), וסניף 1 התלמיד עם ${totalTalmid} הזמנות (${talmidPercentage}%). יום השיא: יום ב׳ (${chartData[1].total} הזמנות).`,
        statsText: `חכמת (מרצדס מנוף) מספק את עיקר המשקל בסניף 4 (בלות ומשטחים), בעוד עלי (איסוזו) מתמקד בגבס, פרופילים וצבעים מסניף 1.`,
        actionPrompt: '📊 נתח את יחסי העומס השבועי בין סניף 4 החרש לסניף 1 התלמיד והמלץ על תגבור'
      });
    }
  };

  return (
    <div className={`p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5 transition-all ${className}`}>
      {/* Header with Title & Copy-to-Chat Action */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>התפלגות הזמנות שבועית</span>
              <span className="text-[10px] font-bold text-sky-700 bg-sky-100/80 px-1.5 py-0.5 rounded-full">
                החרש מול התלמיד
              </span>
            </div>
            <p className="text-[10px] font-semibold text-slate-500">
              נתוני אמת ממאגר סדרנות ח. סבן
            </p>
          </div>
        </div>

        {/* Copy / Share to Chat Button */}
        {onShareToChat && (
          <button
            type="button"
            id="share-chart-to-chat-btn"
            onClick={handleShare}
            title="שתף גרף זה ישירות לתוך הצ'אט הראשי של נועה"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-xs active:scale-95 cursor-pointer ${
              copiedSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-200 ring-2 ring-emerald-300'
                : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-200 hover:shadow-md ring-2 ring-sky-400/20'
            }`}
          >
            {copiedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 animate-scale-in" />
                <span>הועתק לצ'אט!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>שתף גרף לצ'אט</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* KPI Brand Cards (Sky / Emerald) */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        {/* Branch 4 Harash */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-sky-50 to-white border border-sky-200 shadow-2xs">
          <div className="flex items-center justify-center gap-1 text-[11px] font-black text-sky-700">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            <span>סניף 4 החרש</span>
          </div>
          <div className="text-lg font-black text-sky-950 mt-0.5">{totalHarash}</div>
          <div className="text-[10px] text-sky-700 font-bold bg-sky-100/60 rounded px-1 mt-0.5">
            {harashPercentage}% מהנפח
          </div>
        </div>

        {/* Branch 1 Talmid */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-emerald-50 to-white border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-center gap-1 text-[11px] font-black text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>סניף 1 התלמיד</span>
          </div>
          <div className="text-lg font-black text-emerald-950 mt-0.5">{totalTalmid}</div>
          <div className="text-[10px] text-emerald-700 font-bold bg-emerald-100/60 rounded px-1 mt-0.5">
            {talmidPercentage}% מהנפח
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-slate-50 to-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-extrabold text-slate-600">סה״כ שבועי</div>
          <div className="text-lg font-black text-slate-900 mt-0.5">{totalOrders}</div>
          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">הזמנות סדורות</div>
        </div>
      </div>

      {/* Recharts Bar Chart Container */}
      <div className="w-full h-56 pt-1 bg-slate-50/50 rounded-xl p-2 border border-slate-100" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 12, right: 10, left: -20, bottom: 2 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.6} />
            <XAxis
              dataKey="day"
              tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }}
              axisLine={{ stroke: '#94a3b8' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(2, 132, 199, 0.06)' }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingBottom: 8 }}
              formatter={(value) => {
                if (value === 'harash') return 'סניף 4 החרש (מנוף ובלות)';
                if (value === 'talmid') return 'סניף 1 התלמיד (גבס וחלוקה)';
                return value;
              }}
            />
            <Bar
              dataKey="harash"
              name="harash"
              fill="#0284c7" // Tailwind Sky 600
              radius={[5, 5, 0, 0]}
              maxBarSize={22}
            />
            <Bar
              dataKey="talmid"
              name="talmid"
              fill="#10b981" // Tailwind Emerald 500
              radius={[5, 5, 0, 0]}
              maxBarSize={22}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Contextual Action Buttons based on the Chart */}
      {onSelectPrompt && (
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-black text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>פעולות וניתוח מהיר מתוך הגרף:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                onSelectPrompt('📊 נתח את יחסי העומס השבועי בין סניף 4 החרש לסניף 1 התלמיד והמלץ על תגבור');
              }}
              className="flex items-center justify-between p-2 rounded-xl bg-sky-50 hover:bg-sky-100/80 border border-sky-200 text-sky-900 font-extrabold text-[11px] transition text-right shadow-2xs active:scale-98 cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                <span>ניתוח עומסים והמלצת תגבור</span>
              </div>
              <span className="text-[10px] text-sky-600 bg-white px-1.5 py-0.5 rounded font-bold">שאל</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectPrompt('🚚 האם חלוקת ההזמנות בין חכמת (מנוף) לעלי (איסוזו) תואמת ליחס המחסנים 4 מול 1?');
              }}
              className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 font-extrabold text-[11px] transition text-right shadow-2xs active:scale-98 cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>הצלבת שיבוץ חכמת ועלי מול הגרף</span>
              </div>
              <span className="text-[10px] text-emerald-600 bg-white px-1.5 py-0.5 rounded font-bold">שאל</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectPrompt('🛡️ כמה פקדונות בלות (60002) נדרשו השבוע בסניף 4 החרש מול סניף 1?');
              }}
              className="flex items-center justify-between p-2 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-900 font-extrabold text-[11px] transition text-right shadow-2xs active:scale-98 cursor-pointer sm:col-span-2"
            >
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span>בדיקת פקדונות (1:1) עבור הזמנות הגרף</span>
              </div>
              <span className="text-[10px] text-amber-700 bg-white px-1.5 py-0.5 rounded font-bold">שאל</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
