import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, X, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isSamsung, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  // Native beforeinstallprompt is ready (Chrome / Edge / Samsung Internet when triggered)
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm transition active:scale-95 cursor-pointer"
        title="התקן כאפליקציה במסך הבית"
      >
        <Download className="w-4 h-4 animate-bounce" />
        <span>התקן אפליקציה</span>
      </button>
    );
  }

  // If on Samsung Galaxy / Android or iOS, provide quick guided install
  return (
    <>
      <button
        id="pwa-guide-install-btn"
        onClick={() => setShowGuideModal(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-extrabold text-xs shadow-xs transition active:scale-95 cursor-pointer"
        title="התקנה במסך הבית בסמסונג / סמארטפון"
      >
        <Smartphone className="w-4 h-4 text-emerald-700" />
        <span className="hidden sm:inline">התקן בנייד</span>
      </button>

      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 text-right" dir="rtl">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl text-slate-900 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <img src="/icon.svg" alt="נועה AI" className="w-6 h-6 rounded-md" />
                <span>התקנת נועה AI בסמארטפון</span>
              </h3>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-950 font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-700 shrink-0" />
              <span>עובד עצמאית במסך מלא (Standalone) ללא סרגלי דפדפן, עם מהירות שיא וסנכרון תמידי.</span>
            </div>

            {isIOS ? (
              <div className="space-y-2.5 text-xs font-bold text-slate-700 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-black text-xs shrink-0">1</span>
                  <span>לחץ על כפתור <strong>שיתוף (Share)</strong> <Share className="w-3.5 h-3.5 inline text-sky-700 mx-1" /> בסרגל של Safari.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-black text-xs shrink-0">2</span>
                  <span>גלול ובחר <strong>"הוסף למסך הבית" (Add to Home Screen)</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-black text-xs shrink-0">3</span>
                  <span>אשר בלחיצה על <strong>"הוסף" (Add)</strong>.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs font-bold text-slate-700 leading-relaxed">
                <div className="text-[11px] text-slate-500 font-semibold mb-1">
                  {isSamsung ? 'הוראות למכשיר Samsung Galaxy (Samsung Internet / Chrome):' : 'הוראות למכשירי Android:'}
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs shrink-0">1</span>
                  <span>לחץ על <strong>שלוש הנקודות (⋮)</strong> או כפתור התפריט (≡) בדפדפן.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs shrink-0">2</span>
                  <span>בחר ב-<strong>"התקנת אפליקציה" (Install App)</strong> או <strong>"הוסף למסך הבית"</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs shrink-0">3</span>
                  <span>האפליקציה תותקן במסך הבית עם האייקון הרשמי של ח. סבן ❤️.</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="mt-3 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-black text-white hover:bg-slate-800 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>הבנתי, סגור חלון</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
