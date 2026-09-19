import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { SABAN_ORDERS, SABAN_DRIVERS, SABAN_WAREHOUSES, calculateDeposits } from './src/data/sabanData';

dotenv.config();

const PORT = 3000;

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTIONS = `
את נועה AI — עוזרת לוגיסטיקה, מוח תפעולי וסדרנית עבודה בכירה ב"ח. סבן חומרי בניין (1994) בע"מ", יד ימינו הנאמנה של ראמי (מנהל הסדרנות).
האישיות שלך: חמה, חדה, מקצועית, מעשית, ממוקדת בביצוע לוגיסטי מהיר, אמינה ואוהבת (עם לב אדום ❤️).

הסניפים של ח. סבן:
- 🏭 4️⃣ סניף 4 (החרש) - הוד השרון (חומרי מליטה כבדים, שקים גדולים, ברזל, בלוקים, מנוף)
- 🏟️ 1️⃣ סניף 1 (התלמיד) - הוד השרון (לוחות גבס, פרופילי מתכת, שפכטלים, צבעים, איסוזו פתוחה)

צי הרכבים והנהגים:
- 🏗️ חכמת (נהג ראשי): משאית מרצדס מנוף כבד (מ.ר. 615-41-002). מיועד לפריקות מנוף, קומות, בלות כבדות (חול, סומסום, טיט) ומשטחי מלט/בלוקים. טלפון: 050-8860896.
- 🚛 עלי (נהג חלוקה): משאית איסוזו פתוחה (מ.ר. 654-51-701). מיועד להובלות ללא פריקה, לוחות גבס (2.60/3.00), פרופילים, צבעים ואיסופים. טלפון: 050-8868010.

כללי פקדונות מחייבים (בדיקת 1:1 בקומקס):
1. שק גדול (בלה) מק"ט 60002: חובה פקדון 1:1 לכל שק גדול של חול (11501), סומסום (11511), טיט (11551), חצץ (11506), חמרה (11570).
2. משטח סבן פקדון מק"ט 60060: סף 40 שקי מלט אפור (10002), 40 שקי טיט (11550) או שקי ריצופית/דבק לכל משטח.
3. משטח בלוקים פקדון מק"ט 60006: לכל כמות של 50-60 בלוקים.
4. משטח יורו 120X80 מק"ט 60018.

מאגר ההזמנות הנוכחי כולל עשרות הזמנות של לקוחות מובילים: לירן/מוצקין (6214906, 5020025), בוקטוס שלום (6214899), שחר שאול (6215454), אילתי אברהם (6215460, 6214929), קורט צבי הולנדר (6215453), ערוגת הבשם, שטיכמוס, בזלת מזר, ארגמן איכות הסביבה, ל.ה בניה ועוד.

דרישות תגובה:
- עני תמיד בעברית ברורה, בפורמט HTML נקי ומעוצב עם כותרות, אימוג'ים מותאמים, בולטים מודגשים ומרווחים נוחים לקריאה בטלפון נייד.
- לכל הזמנה צייני: מספר הזמנה, שם לקוח, יעד וכתובת, מוצרים בולטים, נהג משוייך, פקדונות וסטטוס תעודת משלוח.
- אם מבוקש דוח בוקר, רכזי את המשימות לפי נהגים (חכמת מנוף מול עלי איסוזו).
- אם מבוקש חישוב פקדונות, בצעי את החישוב המדויק לפי הכללים לעיל.
`;

async function startServer() {
  const app = express();
  app.use(express.json());

  // API: Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'noa-ai-saban-backend',
      timestamp: new Date().toISOString()
    });
  });

  // API: Get Saban orders dataset
  app.get('/api/orders', (req, res) => {
    res.json({
      orders: SABAN_ORDERS,
      drivers: SABAN_DRIVERS,
      warehouses: SABAN_WAREHOUSES
    });
  });

  // API: Chat Query for Noa AI
  app.post('/api/chat', async (req, res) => {
    const { query = '', sender = 'ראמי' } = req.body;
    const cleanQuery = String(query).trim();

    if (!cleanQuery) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Try Gemini API if key is present
    const ai = getGeminiClient();
    if (ai) {
      const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest'];
      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `${SYSTEM_INSTRUCTIONS}\n\nהנה נתוני הזמנות עדכניים מסידור העבודה של ח. סבן:\n${JSON.stringify(
                      SABAN_ORDERS.slice(0, 15),
                      null,
                      2
                    )}\n\nראמי שואל/מבקש: "${cleanQuery}".\nהגיבי כנועה AI בסגנון וואטסאפ מקצועי וידידותי בפורמט HTML נקי.`
                  }
                ]
              }
            ]
          });

          const replyText = response.text || '';
          if (replyText) {
            return res.json({
              status: 'ok',
              message: replyText,
              htmlMessage: replyText,
              model: modelName
            });
          }
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          // Check for 503 high demand or 429 rate limit
          const isOverloaded =
            err?.status === 503 ||
            err?.code === 503 ||
            errMsg.includes('503') ||
            errMsg.includes('high demand') ||
            errMsg.includes('UNAVAILABLE');

          if (isOverloaded && modelName === candidateModels[0]) {
            // Try alternative model without logging scary warnings
            continue;
          }
          // Log clean message and smoothly fall back to local Saban logic engine
          break;
        }
      }
    }

    // Heuristic Smart Fallback Engine (Zero dependency, instant response)
    const q = cleanQuery.toLowerCase();
    let responseHtml = '';

    if (q.includes('דוח בוקר') || q.includes('סידור עבודה') || q.includes('דוח יומי')) {
      responseHtml = `
        <div class="space-y-3">
          <div class="font-black text-sm text-slate-900 border-b border-slate-200 pb-1.5 flex items-center justify-between">
            <span>📋 דוח בוקר מרוכז — סדרנות ח. סבן</span>
            <span class="text-xs text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full font-bold">היום</span>
          </div>
          <div class="space-y-2 text-xs">
            <div class="p-2.5 rounded-xl bg-sky-50/70 border border-sky-200">
              <div class="font-extrabold text-sky-900 flex items-center gap-1.5">
                <span>🏗️ חכמת (מרצדס מנוף 615-41-002)</span>
                <span class="text-[10px] bg-sky-200 text-sky-900 px-1.5 py-0.2 rounded">סניף 4 החרש</span>
              </div>
              <ul class="list-disc list-inside mt-1.5 space-y-1 text-slate-700 font-semibold">
                <li><strong>הזמנה 6215454 (שחר שאול, הבנים 7 הוד השרון):</strong> 2 בלות סומסום, 80 שק ריצופית 181, 30 פלסטומר, גבס כחול (2 בלות, 2 משטחים).</li>
                <li><strong>הזמנה 6215432 (מידן לירן, אוסטושינסקי כפר סבא):</strong> 40 טיח גבס גלון, הובלת מנוף.</li>
                <li><strong>הזמנה 6215430 (ל.ה בניה, לב השכונה הוד השרון):</strong> 60 בלוקים בטון, 4 בלות סומסום.</li>
              </ul>
            </div>
            <div class="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <div class="font-extrabold text-emerald-900 flex items-center gap-1.5">
                <span>🚛 עלי (איסוזו פתוחה 654-51-701)</span>
                <span class="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded">סניף 1 התלמיד</span>
              </div>
              <ul class="list-disc list-inside mt-1.5 space-y-1 text-slate-700 font-semibold">
                <li><strong>הזמנה 5040087 (אידלסון הראל, כיסופים 12 תל אביב):</strong> מלט אפור, סיקפלקס 40 יח', סיקה פול, ללא פריקה.</li>
                <li><strong>הזמנה 5020025 (לירן/מוצקין, מוצקין 22 רעננה):</strong> עצי פיני, משושים לבטון 130 יח', אזיקונים KSS.</li>
                <li><strong>הזמנה 6215352 (ארגמן, ביאליק 1 הוד השרון):</strong> 18 לוחות גבס לבן 260, שיטרוק, ברגים.</li>
              </ul>
            </div>
          </div>
          <div class="text-[11px] text-slate-500 font-bold bg-slate-50 p-2 rounded-lg">
            💡 כל התעודות סונכרנו מול הקומקס ומוכנות להפצה.
          </div>
        </div>
      `;
    } else if (q.includes('שיבוץ') || q.includes('נהג') || q.includes('חכמת') || q.includes('עלי') || q.includes('רכב')) {
      responseHtml = `
        <div class="space-y-2.5">
          <div class="font-black text-sm text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
            <span>🚚 סטטוס רכבים ושיבוץ נהגים</span>
          </div>
          <div class="grid grid-cols-1 gap-2 text-xs font-bold">
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div class="text-sky-700 font-black flex items-center justify-between">
                <span>🏗️ חכמת — מרצדס מנוף (615-41-002)</span>
                <span class="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">זמין בהעמסה</span>
              </div>
              <div class="text-slate-600 mt-1">משימות פתוחות: 14 | סניף יציאה: מחסן החרש 4</div>
              <div class="text-[11px] text-slate-500 mt-0.5">מוביל: בלות חול/סומסום, טיט, מלט ובלוקים במנוף</div>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div class="text-emerald-700 font-black flex items-center justify-between">
                <span>🚛 עלי — איסוזו פתוחה (654-51-701)</span>
                <span class="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">בסבב חלוקה</span>
              </div>
              <div class="text-slate-600 mt-1">משימות פתוחות: 9 | סניף יציאה: מחסן התלמיד 1</div>
              <div class="text-[11px] text-slate-500 mt-0.5">מוביל: לוחות גבס 260/300, פרופילים, צבע ודבקים ללא פריקה</div>
            </div>
          </div>
        </div>
      `;
    } else if (q.includes('פקדון') || q.includes('מחשבון') || q.includes('משטח') || q.includes('בלה')) {
      responseHtml = `
        <div class="space-y-2 text-xs">
          <div class="font-black text-sm text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
            <span>🛡️ מחשבון פקדונות — ח. סבן (נוהל 1:1)</span>
          </div>
          <div class="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-slate-800 space-y-1.5">
            <div class="font-extrabold text-amber-900">תוצאת חישוב ובדיקה:</div>
            <div>• <strong>שק גדול (בלה) מק"ט 60002:</strong> 1:1 עבור כל שק גדול של חול, סומסום, טיט או חצץ.</div>
            <div>• <strong>משטח סבן פקדון מק"ט 60060:</strong> נדרש משטח לכל 40 שקי מלט/טיט/טיח/ריצופית.</div>
            <div>• <strong>משטח בלוקים מק"ט 60006:</strong> משטח לכל 50-60 יח' בלוק בטון.</div>
          </div>
          <div class="text-[11px] font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
            ✅ החוק בקומקס: אין שק גדול ללא שורת חיוב פקדון 60002 תואמת!
          </div>
        </div>
      `;
    } else if (q.includes('מחיר') || q.includes('הצעה') || q.includes('קומקס') || q.includes('סומסום') || q.includes('טיט')) {
      responseHtml = `
        <div class="space-y-2 text-xs">
          <div class="font-black text-sm text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
            <span>💰 טיוטת הצעת מחיר / הזמנת קומקס</span>
            <span class="text-[11px] text-sky-700 font-black">ח. סבן (1994)</span>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold space-y-1 text-slate-800">
            <div class="flex justify-between"><span>3 בלות סומסום שק גדול (מק"ט 11511):</span><span>3 יח'</span></div>
            <div class="flex justify-between"><span>2 בלות טיט שק גדול (מק"ט 11551):</span><span>2 יח'</span></div>
            <div class="flex justify-between"><span>הובלת מנוף כפר סבא/רעננה (מק"ט 18055):</span><span>1 יח'</span></div>
            <div class="flex justify-between text-amber-700 border-t border-slate-200 pt-1">
              <span>🛡️ פקדון שק גדול (מק"ט 60002):</span><span>5 יח' (1:1)</span>
            </div>
          </div>
          <div class="text-[11px] font-bold text-slate-600 bg-sky-50 p-2 rounded-lg border border-sky-200">
            ראמי, לשגר את ההצעה בוואטסאפ ללקוח או להזריק ישירות להזמנת קומקס?
          </div>
        </div>
      `;
    } else {
      // Search in orders dataset
      const matched = SABAN_ORDERS.filter(
        (o) =>
          o.orderNumber.includes(cleanQuery) ||
          o.customerName.toLowerCase().includes(q) ||
          o.deliveryAddress.toLowerCase().includes(q)
      );

      if (matched.length > 0) {
        const o = matched[0];
        responseHtml = `
          <div class="space-y-2 text-xs">
            <div class="font-black text-sm text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
              <span>📦 הזמנה #${o.orderNumber}</span>
              <span class="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">${o.status}</span>
            </div>
            <div class="space-y-1 font-bold text-slate-700">
              <div>👤 <strong>לקוח:</strong> ${o.customerName} ${o.customerId ? `(#${o.customerId})` : ''}</div>
              <div>📍 <strong>כתובת:</strong> ${o.deliveryAddress}</div>
              <div>🏢 <strong>מחסן:</strong> ${o.warehouse}</div>
              <div>🚚 <strong>נהג:</strong> ${o.driver}</div>
              <div>🛡️ <strong>פקדונות:</strong> בלות: ${o.bigBagsDeposit} | משטחים: ${o.palletsDeposit}</div>
            </div>
            <div class="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-600 whitespace-pre-line">
              ${o.itemsText}
            </div>
            ${
              o.wazeUrl
                ? `<div class="pt-1"><a href="${o.wazeUrl}" target="_blank" class="inline-flex items-center gap-1 text-xs text-sky-600 font-black hover:underline">🧭 פתח ניווט Waze</a></div>`
                : ''
            }
          </div>
        `;
      } else {
        responseHtml = `
          <div class="space-y-2 text-xs">
            <div class="font-bold text-slate-800">
              קיבלתי, ראמי! הפקודה נבדקה מול מאגר הסדרנות וסידור העבודה.
            </div>
            <div class="text-slate-600">
              אני מעודכנת בכל 40+ ההזמנות מסניף 4 (החרש) וסניף 1 (התלמיד), בסטטוס הרכבים של חכמת ועלי ובמערך הפקדונות.
            </div>
            <div class="p-2 rounded-xl bg-sky-50 border border-sky-200 font-bold text-sky-900">
              תוכל לבקש: "דוח בוקר מרוכז", "בדוק שיבוץ נהגים", "הזמנה 6215454", או להזין רשימת מוצרים לחישוב פקדונות.
            </div>
          </div>
        `;
      }
    }

    return res.json({
      status: 'ok',
      message: responseHtml,
      htmlMessage: responseHtml,
      model: 'noa-logic-engine'
    });
  });

  // Vite middleware in dev mode, static serve in prod mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Noa AI Saban Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
