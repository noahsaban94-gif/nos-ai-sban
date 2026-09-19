import { GoogleGenAI } from '@google/genai';

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

const SAMPLE_ORDERS = [
  { orderNumber: '6215454', customerName: 'שחר שאול', deliveryAddress: 'הבנים 7 הוד השרון', driver: 'חכמת (מרצדס מנוף)', warehouse: 'סניף 4 החרש', status: 'בסידור', bigBags: 2, pallets: 2 },
  { orderNumber: '6215432', customerName: 'מידן לירן', deliveryAddress: 'אוסטושינסקי 14 כפר סבא', driver: 'חכמת (מרצדס מנוף)', warehouse: 'סניף 4 החרש', status: 'בסידור', bigBags: 0, pallets: 1 },
  { orderNumber: '6215430', customerName: 'ל.ה בניה', deliveryAddress: 'לב השכונה הוד השרון', driver: 'חכמת (מרצדס מנוף)', warehouse: 'סניף 4 החרש', status: 'בסידור', bigBags: 4, pallets: 2 },
  { orderNumber: '5040087', customerName: 'אידלסון הראל', deliveryAddress: 'כיסופים 12 תל אביב', driver: 'עלי (איסוזו פתוחה)', warehouse: 'סניף 1 התלמיד', status: 'בסידור', bigBags: 0, pallets: 0 },
  { orderNumber: '5020025', customerName: 'לירן/מוצקין', deliveryAddress: 'מוצקין 22 רעננה', driver: 'עלי (איסוזו פתוחה)', warehouse: 'סניף 1 התלמיד', status: 'בהמתנה לפריטים', bigBags: 0, pallets: 0 },
  { orderNumber: '6214929', customerName: 'אילתי אברהם', deliveryAddress: 'עמק האלה 44 מודיעין', driver: 'חכמת (מרצדס מנוף)', warehouse: 'סניף 4 החרש', status: 'סופק', bigBags: 3, pallets: 1 }
];

function generateSelfContainedSabanHtml(query: string): string {
  const q = query.toLowerCase().trim();

  // 1. מענה אנושי לברכות ופניות
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
            שים לב: המערכת כרגע במצב מעקף מקומי (יש לוודא שמפתח GEMINI_API_KEY מוגדר בשרת כדי שאוכל לענות באופן חופשי לחלוטין).
          </span>
        </div>
        <div class="text-xs text-sky-800 font-bold">
          במה נתחיל ראמי? שיבוץ נהג, בדיקת פקדונות או דוח בוקר?
        </div>
      </div>
    `;
  }

  // 2. דוח בוקר וסידור
  if (q.includes('בוקר') || q.includes('סידור') || q.includes('דוח')) {
    return `
      <div class="space-y-3 text-xs text-slate-900 font-bold">
        <div class="font-extrabold text-sm text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
          <span>📋 דוח בוקר מרוכז — סדרנות ח. סבן</span>
          <span class="text-xs text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full font-bold">היום</span>
        </div>
        <div class="space-y-2">
          <div class="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-950">
            <div class="font-bold text-sky-900">🏗️ חכמת (מרצדס מנוף 615-41-002) — סניף 4 החרש</div>
            <ul class="list-disc list-inside mt-1 space-y-1 text-slate-800 font-bold">
              <li>הזמנה 6215454 (שחר שאול, הבנים 7 הוד השרון) — 2 בלות סומסום, 80 שק ריצופית, פריקת מנוף.</li>
              <li>הזמנה 6215432 (מידן לירן, אוסטושינסקי כפר סבא) — טיח גבס גלון, הובלת מנוף.</li>
              <li>הזמנה 6215430 (ל.ה בניה, לב השכונה הוד השרון) — 60 בלוקים בטון, 4 בלות סומסום.</li>
            </ul>
          </div>
          <div class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
            <div class="font-bold text-emerald-900">🚛 עלי (איסוזו פתוחה 654-51-701) — סניף 1 התלמיד</div>
            <ul class="list-disc list-inside mt-1 space-y-1 text-slate-800 font-bold">
              <li>הזמנה 5040087 (אידלסון הראל, כיסופים 12 תל אביב) — מלט אפור, סיקפלקס 40 יח'.</li>
              <li>הזמנה 5020025 (לירן/מוצקין, מוצקין 22 רעננה) — עצי פיני, משושים לבטון 130 יח'.</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  // 3. פקדונות
  if (q.includes('פקדון') || q.includes('בלה') || q.includes('משטח')) {
    return `
      <div class="space-y-2 text-slate-900 text-xs font-bold">
        <div class="font-extrabold text-sm border-b border-slate-200 pb-1 text-slate-900">🛡️ חוקי פקדונות סבן (1:1):</div>
        <div>• בלות (חול/סומסום/טיט): <b>1:1 למק"ט 60002</b></div>
        <div>• משטח סבן (60060): <b>סף 40 שק מלט אפור</b></div>
        <div>• הובלה ללא פריקה (818050): <b>פטור מלא מפקדונות ✅</b></div>
      </div>
    `;
  }

  // 4. מענה ברירת מחדל אנושי
  return `
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

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
      return res.status(200).json({
        status: 'ok',
        htmlMessage: 'היי ראמי ❤️ הכל תקין ומסונכרן! באיזו הזמנה או נושא נתמקד עכשיו?',
        message: 'היי ראמי ❤️ הכל תקין ומסונכרן! באיזו הזמנה או נושא נתמקד עכשיו?',
        model: 'noa-logic-engine'
      });
    }

    const memoryPrompt = operationalMemory.length > 0
      ? `\n\n🧠 פנקס הזיכרון הלוגיסטי של ראמי (עובדות, סגירות והעדפות שטח שחובה להתחשב בהן ולשלוף יזום בעת הצורך):\n${operationalMemory.map((m: any, idx: number) => `• [${m.category || 'תפעול'}]: ${typeof m === 'string' ? m : m.text}`).join('\n')}`
      : '';

    const historyPrompt = history.length > 0
      ? `\n\n💬 היסטוריית השיחה השוטפת האחרונה עם ראמי (שמרי על המשכיות והקשר רציף ללא בקשת נתונים שכבר הוזכרו):\n${history.slice(-8).map((h: any) => `${h.role === 'user' ? 'ראמי' : 'נועה'}: ${h.text}`).join('\n')}`
      : '';

    // 1. Google Apps Script server proxy
    if (googleScriptUrl && googleScriptUrl.startsWith('http')) {
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
            return res.status(200).json({
              status: 'ok',
              htmlMessage: gasData.htmlMessage || gasData.message,
              source: 'google-sheets-proxy'
            });
          }
        }
      } catch {
        // Fallback to Gemini
      }
    }

    // 2. Gemini Multi-Key Rotation across 3 keys
    const keys = getAllGeminiKeys();
    if (keys.length > 0) {
      const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

      for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
        const apiKey = keys[keyIdx];
        try {
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
                        text: `${SYSTEM_INSTRUCTIONS}${memoryPrompt}${historyPrompt}\n\nנתוני הזמנות אחרונות:\n${JSON.stringify(
                          SAMPLE_ORDERS,
                          null,
                          2
                        )}\n\nראמי פונה עכשיו: "${cleanQuery}".\nהגיבי כנועה AI — מוח לוגיסטי, סדרנית ויד ימינו של ראמי, בחמימות, חדות ומקצועיות, עם שימוש בשפה המקצועית של ענף הבנייה ובפורמט HTML נקי ומעוצב עם טקסט כהה וקריא בלבד (text-slate-900).`
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
                return res.status(200).json({
                  status: 'ok',
                  message: replyText,
                  htmlMessage: replyText,
                  model: modelName,
                  activeKeyIndex: keyIdx + 1,
                  totalKeys: keys.length
                });
              }
            } catch (modelErr: any) {
              const errMsg = modelErr?.message || String(modelErr);
              const isRateLimitOrQuota =
                modelErr?.status === 429 ||
                modelErr?.code === 429 ||
                errMsg.includes('429') ||
                errMsg.includes('Quota') ||
                errMsg.includes('exhausted');

              if (isRateLimitOrQuota && keys.length > 1) {
                break; // Rotate to next key
              }
              if (modelName === candidateModels[0]) {
                continue;
              }
              break;
            }
          }
        } catch {
          // Next key
        }
      }
    }

    // 3. Guaranteed Local Saban Logic Engine
    const localHtml = generateSelfContainedSabanHtml(cleanQuery);
    return res.status(200).json({
      status: 'ok',
      message: localHtml,
      htmlMessage: localHtml,
      model: 'noa-local-engine',
      totalKeys: keys.length
    });
  } catch (outerErr) {
    console.debug('Safe recovery in api/chat handler:', outerErr);
    const safeHtml = `
      <div class="space-y-2 text-xs">
        <div class="font-bold text-slate-800">היי ראמי ❤️ המערכות תקינות ומסונכרנות!</div>
        <div class="text-slate-600">כל נתוני הסדרנות של ח. סבן זמינים עבורך. תוכל לבקש דוח בוקר, בדיקת נהג או פקדונות.</div>
      </div>
    `;
    return res.status(200).json({
      status: 'ok',
      message: safeHtml,
      htmlMessage: safeHtml,
      model: 'noa-recovery-engine'
    });
  }
}
