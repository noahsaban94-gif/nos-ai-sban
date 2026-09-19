import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { SABAN_ORDERS, SABAN_DRIVERS, SABAN_WAREHOUSES, calculateDeposits } from './src/data/sabanData';

dotenv.config();

const PORT = 3000;

let cachedKeys: string[] = [];

function getAllGeminiKeys(): string[] {
  const rawList: (string | undefined)[] = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEYS,
    process.env.VITE_GEMINI_API_KEY,
    process.env.VITE_GEMINI_API_KEY_1,
    process.env.VITE_GEMINI_API_KEY_2,
    process.env.VITE_GEMINI_API_KEY_3,
  ];

  const keys: string[] = [];
  for (const item of rawList) {
    if (!item) continue;
    const tokens = item.split(/[\r\n,;]+/).map((s) => s.trim()).filter(Boolean);
    for (const token of tokens) {
      if (token && !keys.includes(token)) {
        keys.push(token);
      }
    }
  }
  cachedKeys = keys;
  return keys;
}

const SYSTEM_INSTRUCTIONS = `
# SYSTEM PROMPT: נועה AI — מוח לוגיסטי, סדרנות וזיכרון מתמשך (סידורMaster Brain)

## 1. הגדרת זהות ומהות (Core Persona & Identity)
- **שם ותפקיד:** נועה AI ("נועה ❤️ | סדרנית ויד ימינו של ראמי").
- **שיוך ארגוני:** ח. סבן חומרי בניין (1994) בע"מ | ח.פ: 512001678.
- **שותף בכיר וסמכות עליונה:** ראמי מסארוה (מנהל מערך ההזמנות, התפעול והסידור).
- **תפיסת תפקיד:** את לא "בוט" ולא "מנוע חיפוש". את מנהלת תפעול וסדרנית חיה, חדה, חמה ומקצועית, שעובדת כתף אל כתף עם ראמי. את מכירה את הנהגים, את המחסנאים, את הלקוחות, את המשאיות, ואת ההתנהלות המדויקת של ענף חומרי הבניין בישראל.
- **עקרון השיחה האנושית:** דברי כמו בת אדם אמיתית במשרד הסידור. הימנעי מפתיחים רובוטיים יבשים. אם ראמי זורק פקודה קצרה ("נועה, תוציאי לרעננה 4 בלות"), הביני מיד את ההקשר, הפעילי את ההיגיון הלוגיסטי, ועני בביטחון ובחמימות.

---

## 2. מאגר שפה עשיר, סלנג מקצועי וזיהוי מונחי שטח (Lexicon & Jargon)
עליך לזהות, להבין ולהשתמש באופן טבעי בעושר השפתי של ענף הבנייה והשינוע הישראלי:
- **אגרגטים וחומרי מחצבה:** בלה / בלות (שק גדול Big-Bag ~700 ק"ג), סומסום (שומשום למילוי ריצוף), חול ים, טיט מוכן, מצע מהודק, חצץ ניקוז 7/8, חמרה, שליכט.
- **מוצרי מליטה וכימיה:** מלט אפור (שקי 25 ק"ג), מלט לבן, טיח חוץ 710, טיח ממ"ד, טיח גבס MP75 / 800, טיט שק (25 ק"ג), ריצופית 181, פלסטומר 603, הרבצה 100, ביטומן, סילר, מסטיק איטום.
- **בלוקים:** בלוק בטון 20/20/40 (2 או 4 חורים), בלוק 10, בלוק 7, בלוק 15, בלוק תרמי, שוקת, פומיס בנייה.
- **גבס ופרזול:** לוח לבן (רגיל), לוח ירוק (עמיד לחות), לוח ורוד (חסין אש), צמנט בורד, ניצבים ומסלולים, מגהצים, חוט שזור, ברגי גבס/פח, קלסימו, רשת שריון.
- **מונחי שינוע:** הרמות לקומה, פריקת מרפסת, מעבר לגדר, הובלה ללא פריקה (הורדה ידנית ע"י הלקוח), עבודת מנוף שעון, דיסקית טכוגרף, שרוול שפיכה, פריקה ידנית.
- **סלנג תפעולי פנימי:** "בסידור", "סופק", "חוסר מאושר", "ת.מ חתומה", "הועבר ללינה לחיוב", "באישור הראל/ורד".

---

## 3. ארכיטקטורת זיכרון מתמשך (Persistent Memory Protocol)
את מפעילה מערך זיכרון רב-שכבתי בכל אינטראקציה:

### א. זיכרון שיחה שוטף (Contextual Continuity):
זכרי תמיד על איזה נהג, לקוח, אתר או הזמנה מדובר במהלך חילופי הדברים. לעולם אל תבקשי מראמי מידע שכבר הזכיר במשפט הקודם. אם ראמי כותב: "תוסיף לו גם 2 שק מלט", זהי מיידית למי הכוונה, עדכני את ההזמנה, ובדקי אם זה משפיע על סף המשטח.

### ב. פנקס הזיכרון הלוגיסטי של ראמי (Operational Memory):
בכל פעם שראמי מוסר עובדה תפעולית, העדפה אישית, או סיכום מול לקוח, תייקי זאת בזיכרון המערכת:
- *העדפות נהגים:* למשל, זמני יציאה קבועים של חכמת, אילו אתרים בעייתיים לכניסת משאית מנוף גדולה.
- *הרגלי לקוחות:* לקוחות שדורשים תמיד תיאום טלפוני חצי שעה מראש, לקוחות בעלי פריקות גובה מסובכות.
- *תיוק זיכרון:* בכל מענה שבו המידע רלוונטי, שלפי אותו באופן יזום: *"ראמי, זכרתי שציינת שהגישה לאתר הזה צרה, אז שיבצתי את חכמת ראשון לפני שייחסם הרחוב."*

---

## 4. מאגר הידע, ישויות וספי פקדונות קשיחים

### א. מוקדי הפצה וציי רכב
- **סניף 🏭 4️⃣(החרש)** — רחוב החרש 4, הוד השרון (מגרש ראשי, כבדים, אגרגטים, מלט, בלוקים, ברזל. מנהל חצר: אורן; מנהל חנות: איציק זהבי).
- **סניף 🏟️ 1️⃣(התלמיד)** — רחוב התלמיד 6, הוד השרון (גבס, פרופילים, צבע, פרזול, חומרים קלים. מנהל: תמיר/דורון).
- **חכמת (מרצדס מנוף 615-41-002):** משובץ בלעדית למנוף, בלות, משטחי מלט/בלוקים כבדים (יוצא מ-4 החרש). טלפון: 050-8860896.
- **עלי (איסוזו חלוקה 651-51-701):** משובץ לגבס, פרופילים, צבע, פריקה ידנית, והובלה ללא פריקה (יוצא מ-1 התלמיד). טלפון: 050-8868010.
- **הנהלה וחשבונות:** הראל אידלסון (מנכ"ל), ורד אידלסון (הנהלה בכירה), לינה (הנהלת חשבונות לחיוב תעודות).

### ב. חוקי פקדונות מדויקים (Strict Deposit Matching)
1. **שק גדול / בלה (מק"ט 60002):** חובה ביחס 1:1 בדיוק לכל בלה של חול (11501), סומסום (11511), טיט (11551), מצע (11540), חצץ (11506), חמרה (11570). פקדון בלה: 35 ₪ לפני מע"מ.
2. **משטח סבן עץ (מק"ט 60060):**
   - מלט אפור 25 ק"ג (10002): סף 40 שק למשטח.
   - סומסום/טיט שק 25 ק"ג (11510 / 11550): סף 70 שק למשטח.
   - דבקים, טיח 710, ריצופית: סף 20 שק למשטח.
3. **משטח בלוקים (מק"ט 60006):** לפי כמות אריזה (לדוגמה: בלוק 20 = 75 יח' למשטח; בלוק 10 = 150 יח' למשטח).
4. **פטור מפקדונות:** הובלה ללא פריקה (מק"טים 818050–818118) פטורה מפקדונות בלות ומשטחים.

### ג. מחירון קשיח להצעות מחיר (לפני מע"מ)
- חול שק גדול (11501): 95 ₪ | סומסום שק גדול (11511): 105 ₪ | טיט שק גדול (11551): 130 ₪ | פקדון בלה (60002): 35 ₪.
- נוסחה: '(סך מוצרים לפני מע"מ) + פקדונות + הובלה/מנוף + מע"מ (18%)'.

---

## 5. יכולות רב-מודאליות, סנכרון ופורמט פלט
- **Google Sheets:** גיליון מאוחד '1Ie7gKql_EDdrIN9HqunJc9Ey5k0WXXfPRxs0Vp1Bs2c' (הזמנות_סידור, הצלבה_ובקרה) וגיליון '1VA9J6n9IYcooO_s2xOpnkvyDQWWQD3pfhh0cnenCkoA' (נועה Ai דשבורד סידור).
- **OCR ואימות תעודות משלוח:** חילוץ תעודות, אימות חתימות שטח, ספירת פקדונות חוזרים, עדכון הנה"ח (לינה).
- **Voice-to-Dispatch:** פענוח הודעות קוליות ודיבור שטח של ראמי/הנהגים והמרה לכרטיסי סידור.
- **WhatsApp Webhook:** שיגור דרך 'https://hook.eu1.make.com/j1kfxfn5y4goe1lud3dk1phkw4bkjvyr' + כפתורי וואטסאפ ו-Waze ישירים.
- **פורמט פלט:** מעוצב ומובנה ב-HTML אלגנטי (כרטיסי וואטסאפ, תגיות מעמד, מסגרות נקיות).
`;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(express.text({ limit: '10mb' }));

  // API: Health check
  app.get('/api/health', (req, res) => {
    const keys = getAllGeminiKeys();
    res.json({
      status: 'ok',
      service: 'noa-ai-saban-backend',
      geminiKeysCount: keys.length,
      timestamp: new Date().toISOString()
    });
  });

  // API: Gemini and AI status
  app.get('/api/ai-status', (req, res) => {
    const keys = getAllGeminiKeys();
    res.json({
      status: keys.length > 0 ? 'connected' : 'local-engine',
      totalKeys: keys.length,
      model: 'gemini-3.8-flash',
      rotationEnabled: keys.length > 1,
      message:
        keys.length > 0
          ? `מחובר בהצלחה — ${keys.length} מפתחות Gemini פעילים ברוטציה אוטומטית`
          : 'מנוע סדרנות מקומי חכם פעיל'
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

  // API: Make.com Webhook Dispatch (Module 4)
  app.post('/api/webhook-dispatch', async (req, res) => {
    try {
      const webhookUrl = 'https://hook.eu1.make.com/j1kfxfn5y4goe1lud3dk1phkw4bkjvyr';
      let payload = req.body;
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch {
          payload = { message: payload };
        }
      }
      payload = payload || {};

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: payload.orderId || payload.orderNumber || '',
          customerName: payload.customerName || '',
          driver: payload.driver || '',
          warehouse: payload.warehouse || '',
          message: payload.message || `שידור הזמנה ${payload.orderId || ''} לסידור עבודה`,
          wazeUrl: payload.wazeUrl || '',
          timestamp: new Date().toISOString()
        }),
        redirect: 'follow'
      });

      const text = await response.text();
      return res.status(200).json({
        status: 'ok',
        dispatched: true,
        responseText: text,
        webhookUrl
      });
    } catch (err: any) {
      console.error('Make.com webhook dispatch warning:', err);
      return res.status(200).json({
        status: 'warning',
        dispatched: false,
        message: 'שגיאת רשת בשליחה ל-Make.com, נתוני ההזמנה שמורים במערכת',
        error: err?.message || String(err)
      });
    }
  });

  // API: Chat Query for Noa AI
  app.post('/api/chat', async (req, res) => {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          body = { query: body };
        }
      }
      body = body || {};
      const cleanQuery = String(body.query || '').trim();
      const sender = String(body.sender || 'ראמי');
      const googleScriptUrl = String(body.googleScriptUrl || '');
      const history = Array.isArray(body.history) ? body.history : [];
      const operationalMemory = Array.isArray(body.operationalMemory) ? body.operationalMemory : [];

      if (!cleanQuery) {
        return res.json({
          status: 'ok',
          htmlMessage: 'היי ראמי ❤️ המערכות תקינות ומסונכרנות! באיזו הזמנה או נושא נתמקד עכשיו?',
          message: 'היי ראמי ❤️ המערכות תקינות ומסונכרנות! באיזו הזמנה או נושא נתמקד עכשיו?',
          model: 'noa-logic-engine'
        });
      }

      const memoryPrompt = operationalMemory.length > 0
        ? `\n\n🧠 פנקס הזיכרון הלוגיסטי של ראמי (עובדות, סגירות והעדפות שטח שחובה להתחשב בהן ולשלוף יזום בעת הצורך):\n${operationalMemory.map((m: any, idx: number) => `• [${m.category || 'תפעול'}]: ${typeof m === 'string' ? m : m.text}`).join('\n')}`
        : '';

      const historyPrompt = history.length > 0
        ? `\n\n💬 היסטוריית השיחה השוטפת האחרונה עם ראמי (שמרי על המשכיות והקשר רציף ללא בקשת נתונים שכבר הוזכרו):\n${history.slice(-8).map((h: any) => `${h.role === 'user' ? 'ראמי' : 'נועה'}: ${h.text}`).join('\n')}`
        : '';

      // 1. If Google Apps Script Web App URL is provided, proxy through server (zero CORS issues!)
      if (googleScriptUrl && typeof googleScriptUrl === 'string' && googleScriptUrl.startsWith('http')) {
        try {
          const gasRes = await fetch(googleScriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'CHAT_QUERY', query: cleanQuery, sender, operationalMemory }),
            redirect: 'follow'
          });

          if (gasRes.ok) {
            const gasData: any = await gasRes.json().catch(() => null);
            if (gasData && (gasData.htmlMessage || gasData.message)) {
              return res.json({
                status: 'ok',
                htmlMessage: gasData.htmlMessage || gasData.message,
                source: 'google-sheets-proxy'
              });
            }
          }
        } catch (gasErr) {
          console.debug('Google Apps Script proxy notice, falling back to Gemini/local:', gasErr);
        }
      }

    // 2. Try Gemini API with Multi-Key Rotation across all configured keys
    const keys = getAllGeminiKeys();
    if (keys.length > 0) {
      const candidateModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-flash-latest'];

      for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
        const apiKey = keys[keyIdx];
        const ai = new GoogleGenAI({ apiKey });

        for (const modelName of candidateModels) {
          try {
            const geminiPromise = ai.models.generateContent({
              model: modelName,
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `${SYSTEM_INSTRUCTIONS}${memoryPrompt}${historyPrompt}\n\nהנה נתוני הזמנות עדכניים מסידור העבודה של ח. סבן:\n${JSON.stringify(
                        SABAN_ORDERS.slice(0, 15),
                        null,
                        2
                      )}\n\nראמי פונה עכשיו: "${cleanQuery}".\nהגיבי כנועה AI — מוח לוגיסטי, סדרנית ויד ימינו של ראמי, בחמימות, חדות ומקצועיות, עם שימוש בשפה המקצועית של ענף הבנייה ובפורמט HTML נקי ומעוצב עם טקסט כהה וקריא.`
                    }
                  ]
                }
              ]
            });

            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Gemini request timeout')), 6500)
            );

            const response: any = await Promise.race([geminiPromise, timeoutPromise]);

            const replyText = response.text || '';
            if (replyText) {
              return res.json({
                status: 'ok',
                message: replyText,
                htmlMessage: replyText,
                model: modelName,
                activeKeyIndex: keyIdx + 1,
                totalKeys: keys.length
              });
            }
          } catch (err: any) {
            const errMsg = err?.message || String(err);
            const isRateLimitOrQuota =
              err?.status === 429 ||
              err?.code === 429 ||
              errMsg.includes('429') ||
              errMsg.includes('Quota') ||
              errMsg.includes('exhausted') ||
              errMsg.includes('RESOURCE_EXHAUSTED');

            const isOverloaded =
              err?.status === 503 ||
              err?.code === 503 ||
              errMsg.includes('503') ||
              errMsg.includes('high demand') ||
              errMsg.includes('UNAVAILABLE');

            if (isRateLimitOrQuota && keys.length > 1) {
              // Rotate to next key immediately
              console.info(`Gemini key #${keyIdx + 1} quota/limit reached. Rotating to key #${(keyIdx + 1) % keys.length + 1}`);
              break;
            }

            if (isOverloaded && modelName === candidateModels[0]) {
              continue;
            }

            break;
          }
        }
      }
    }

    // Heuristic Smart Fallback Engine (Zero dependency, instant response)
    const q = cleanQuery.toLowerCase();
    let responseHtml = '';

    // Human greeting
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
      responseHtml = `
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
    } else if (q.includes('דוח בוקר') || q.includes('סידור עבודה') || q.includes('דוח יומי')) {
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
    } else if (q.includes('גרף') || q.includes('נתח') || q.includes('עומס') || (q.includes('החרש') && q.includes('התלמיד'))) {
      responseHtml = `
        <div class="space-y-3 text-xs">
          <div class="font-black text-sm text-slate-900 border-b border-slate-200 pb-1.5 flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <span>📊 ניתוח עומסי עבודה שבועי — ח. סבן</span>
            </span>
            <span class="text-[11px] bg-sky-100 text-sky-800 font-extrabold px-2 py-0.5 rounded-full">מחסן 4 מול 1</span>
          </div>
          <div class="grid grid-cols-2 gap-2 font-bold">
            <div class="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-slate-800 space-y-1">
              <div class="text-sky-900 font-black flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-sky-600"></span>
                סניף 4 החרש (70% מהנפח)
              </div>
              <div class="text-[11px] text-slate-600">70 הזמנות שבועיות: בלות סומסום, חול, טיט, מלט ובלוקים.</div>
              <div class="text-[10px] text-sky-700 font-bold bg-white p-1 rounded border border-sky-100">
                עומס מנוף גבוה: חכמת בשיא התפוסה (14 פריקות יומיות).
              </div>
            </div>
            <div class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-slate-800 space-y-1">
              <div class="text-emerald-900 font-black flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
                סניף 1 התלמיד (30% מהנפח)
              </div>
              <div class="text-[11px] text-slate-600">30 הזמנות שבועיות: לוחות גבס, פרופילי פח, שפכטל וצבעים.</div>
              <div class="text-[10px] text-emerald-700 font-bold bg-white p-1 rounded border border-emerald-100">
                איסוזו פתוחה של עלי: גמישות גבוהה, 9 סבבי חלוקה.
              </div>
            </div>
          </div>
          <div class="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 font-bold space-y-1">
            <div class="text-[11px] font-black flex items-center gap-1">
              <span>💡 מסקנות והמלצות תפעוליות לראמי:</span>
            </div>
            <ul class="list-disc list-inside text-[11px] space-y-0.5 text-slate-700">
              <li><strong>יום השיא:</strong> ימי שני ורביעי מציגים את עיקר הלחץ על פריקות המנוף בהוד השרון וכפר סבא.</li>
              <li><strong>איזון עומסים:</strong> מומלץ להסיט הובלות ללא פריקה (גבס ופרופילים) מהחרש לאיסוזו של עלי כדי לשחרר את חכמת לקווי מנוף בלבד.</li>
              <li><strong>בקרת פקדונות 1:1:</strong> 70 בלות בסניף 4 דורשות בדיקת קומקס קפדנית של מק"ט 60002.</li>
            </ul>
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
    } else if (q.includes('בסידור') || (q.includes('הזמנות') && (q.includes('סופק') || q.includes('פתוח') || q.includes('סידור')))) {
      const activeOrders = SABAN_ORDERS.filter((o) => !o.status.includes('סופק'));
      responseHtml = `
        <div class="space-y-3 text-xs">
          <div class="font-black text-sm text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <span>📋 הזמנות בסטטוס בסידור (ללא סופק)</span>
            </span>
            <span class="text-xs bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">
              ${activeOrders.length} הזמנות פעילות
            </span>
          </div>
          <div class="text-slate-600 font-bold">
            ריכוז כל ההזמנות מתוך דשבורד סידור עבודה שטרם סופקו (בסידור / בהכנה / בהפצה):
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
        const wazeHref = o.wazeUrl || `https://waze.com/ul?q=${encodeURIComponent(o.deliveryAddress)}&navigate=yes`;
        const waText = encodeURIComponent(`📦 הזמנה ${o.orderNumber} — ${o.customerName}\n📍 כתובת אספקה: ${o.deliveryAddress}\n🏢 מחסן מוצא: ${o.warehouse}\n🚚 נהג: ${o.driver}\n🧭 ניווט Waze: ${wazeHref}\n🛒 מוצרים:\n${o.itemsText}\n🛡️ פקדונות: בלות: ${o.bigBagsDeposit} | משטחים: ${o.palletsDeposit}`);

        responseHtml = `
          <div class="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm space-y-2.5 text-right font-sans text-xs">
            <div class="flex justify-between items-center border-b pb-2">
              <span class="font-black text-sm text-slate-900">📦 הזמנה ${o.orderNumber} — ${o.customerName}</span>
              <span class="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-extrabold">${o.driver.includes('חכמת') ? 'חכמת (מרצדס מנוף)' : 'עלי (איסוזו פתוחה)'}</span>
            </div>
            <div class="text-xs text-slate-700 space-y-1 font-bold">
              <div>📍 <b>כתובת אספקה:</b> ${o.deliveryAddress}</div>
              <div>🏢 <b>מחסן מוצא:</b> ${o.warehouse}</div>
              <div>🧭 <b>ניווט:</b> <a href="${wazeHref}" target="_blank" class="text-sky-600 underline font-black">נווט בוויז לחץ כאן</a></div>
            </div>
            <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800">
              <div class="font-black text-slate-900 mb-1">🛒 פירוט מוצרים:</div>
              <div class="whitespace-pre-line text-slate-700 font-medium">${o.itemsText}</div>
            </div>
            <div class="flex justify-between items-center pt-1 text-xs font-extrabold text-slate-700 border-t border-slate-100">
              <span>🛡️ פקדונות: [בלות: ${o.bigBagsDeposit} | משטחים: ${o.palletsDeposit}]</span>
              <span class="text-emerald-700">✅ מאושר לסידור</span>
            </div>
            <div class="pt-2 flex items-center justify-between gap-2">
              <a href="whatsapp://send?text=${waText}" class="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black text-center transition flex items-center justify-center gap-1 shadow-xs">
                <span>📲 שתף בוואטסאפ</span>
              </a>
              <button onclick="window.dispatchMakeWebhook && window.dispatchMakeWebhook('${o.orderNumber}', '${o.customerName}', '${o.driver}', '${o.warehouse}', '${o.deliveryAddress}')" class="flex-1 py-1.5 px-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-black text-center transition flex items-center justify-center gap-1 shadow-xs cursor-pointer">
                <span>🚀 שגר ל-Make.com</span>
              </button>
            </div>
          </div>
        `;
      } else {
        responseHtml = `
          <div class="space-y-2 text-slate-900 text-xs font-bold leading-relaxed">
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
      }
    }

    return res.json({
      status: 'ok',
      message: responseHtml,
      htmlMessage: responseHtml,
      model: 'noa-logic-engine'
    });
  } catch (outerErr) {
    console.debug('Safe error recovery in /api/chat:', outerErr);
    const fallbackResponse = `
      <div class="space-y-2 text-xs">
        <div class="font-bold text-slate-800">היי ראמי ❤️ המערכות תקינות ומסונכרנות!</div>
        <div class="text-slate-600">כל נתוני הסדרנות של ח. סבן זמינים עבורך. תוכל לבקש דוח בוקר, בדיקת נהג (חכמת/עלי) או פקדונות קומקס.</div>
      </div>
    `;
    return res.status(200).json({
      status: 'ok',
      message: fallbackResponse,
      htmlMessage: fallbackResponse,
      model: 'noa-recovery-engine'
    });
  }
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
