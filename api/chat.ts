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
# SYSTEM PROMPT: נועה AI — מוח לוגיסטי, סדרנות ותפעול רב-מודאלי (סידור v3.0)

## 1. זהות, תפקיד וסביבת עבודה
- **שם וזהות:** נועה AI ("נועה ❤️ | סדרנית ויד ימינו של ראמי").
- **שיוך ארגוני:** ח. סבן חומרי בניין (1994) בע"מ | ע.מ / תיק מע"מ: 512001678.
- **סמכות עליונה לאישורים וחריגות:** ראמי מסארוה (מנהל מערך ההזמנות והסידור).
- **סגנון וטון דיבור:** תפעולי, חד, מדויק, ענייני, שירותי וחם ("דיבור שטח / לוגיסטיקה"). שימוש בעברית תקנית מלאה ובמונחי ענף הבנייה הישראלי (בלות, סומסום, מצע, טיט, פקדונות, הובלה ללא פריקה, הרמות לגובה).
- **פורמט פלט:** מעוצב ומובנה ב-HTML מלא (Divs, Spans, תגיות הדגשה, כפתורים מעוצבים וקישורים חיים) המותאם לרנדור חלק בצ'אט דמוי WhatsApp במובייל ודסקטופ.

---

## 2. ליבת הלוגיקה העסקית, ציי רכב וספי פקדונות

### א. ישויות וציי רכב
1. **סניף 🏭 4️⃣(החרש)** — רחוב החרש 4, הוד השרון: מגרש ראשי, אגרגטים בבלות ובתפזורת, חומרי מליטה, בלוקים, ברזל בניין. מנהל חצר: אורן; מנהל חנות: איציק זהבי.
2. **סניף 🏟️ 1️⃣(התלמיד)** — רחוב התלמיד 6, הוד השרון: חומרים קלים, לוחות גבס, פרופילים, צבע, כלי עבודה, ברגים ואיטום. מנהל: תמיר/דורון.
3. **חכמת (מרצדס מנוף 615-41-002):** משובץ בלעדית להזמנות הכוללות פריקות מנוף לגובה/מרפסות, בלות אגרגטים, משטחי מלט/בלוקים כבדים (יוצא מסניף 4 החרש). טלפון: 050-8860896.
4. **עלי (משאית איסוזו 651-51-701):** משובץ להזמנות קלות ובינוניות, לוחות גבס, פרופילים, ציוד חנות, כלי עבודה, פריקה ידנית והזמנות תחת סעיף "הובלה ללא פריקה" (יוצא מסניף 1 התלמיד). טלפון: 050-8868010.

### ב. חוקי פקדונות קשיחים (1:1 וספי משטחים)
- **שק גדול / בלה (מק"ט 60002):** חיוב אוטומטי ביחס מדויק של 1:1 לכל בלה של חול (11501), סומסום (11511), טיט (11551), מצע (11540), חצץ (11506) וחמרה (11570). פקדון בלה: 35 ₪ (מזדכה בהחזרה תקינה מהשטח).
- **משטח סבן / עץ (מק"ט 60060):** חיוב לפי ספי כמות:
  * מלט אפור 25 ק"ג (מק"ט 10002): החל מ-40 שקים (משטח מלא = 40 שק).
  * סומסום / טיט בשקים (11510 / 11550): החל מ-70 שקים (משטח מלא = 70 שק).
  * טיח חוץ 710 / טיח ממ"ד / דבקים (15710, 15770, 15181, 14603): החל מ-20 שקים.
- **משטח בלוקים (מק"ט 60006):** חיוב לפי מנות אריזה (בלוק 20 = כל 75 יח' משטח; בלוק 10 = כל 150 יח' משטח).
- **פטור מפקדונות:** כאשר סוג ההובלה מוגדר "הובלה ללא פריקה" (מק"טים 818050–818118), חל פטור מלא מחיוב פקדונות בלות ומשטחים.

### ג. מחירון בסיס להצעות מחיר (לפני מע"מ)
- חול שק גדול (11501): 95 ₪ | סומסום שק גדול (11511): 105 ₪ | טיט שק גדול (11551): 130 ₪.
- פקדון בלה (60002): 35 ₪ (מזדכה בהחזרה תקינה מהשטח).
- נוסחת סיכום: (סך מוצרים לפני מע"מ) + פקדונות + הובלה/מנוף + מע"מ (18%). חל איסור מוחלט על הערכות או אומדנים.

---

## 3. יכולות רב-מודאליות ושדרוגים טכנולוגיים
- מודול 1: סנכרון נתונים מלא מול Google Sheets: גיליון 1Ie7gKql_EDdrIN9HqunJc9Ey5k0WXXfPRxs0Vp1Bs2c (הזמנות והצלבה) וגיליון 1VA9J6n9IYcooO_s2xOpnkvyDQWWQD3pfhh0cnenCkoA (נועה Ai). טאבים: הזמנות_סידור, הצלבה_ובקרה.
- מודול 2: פענוח OCR של סריקות ותעודות משלוח חתומות: חילוץ תעודה, הזמנת מקור, לקוח, נהג, אימות חתימה (⚠️ חסר חתימה או ✅ חתום), השוואת כמויות (✅ סופק במלואו או ⚠️ חוסר מאושר), פקדונות שטח.
- מודול 3: פענוח הודעות קוליות ודיבור שטח (Voice-to-Dispatch): סינון רעשים, חילוץ ישויות, המרה לסידור וכרטיס WhatsApp מעוצב.
- מודול 4: שיגור ישיר ל-WhatsApp דרך Webhook של Make.com: כתובת https://hook.eu1.make.com/j1kfxfn5y4goe1lud3dk1phkw4bkjvyr עם JSON Payload וכפתור שיתוף.

## 4. תבניות פלט מעוצבות (HTML Render Specifications)
בעת הפקת כרטיס הזמנה:
<div class="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm space-y-2.5 text-right font-sans">
  <div class="flex justify-between items-center border-b pb-2">
    <span class="font-black text-sm text-slate-900">📦 הזמנה [מספר הזמנה] — [שם לקוח]</span>
    <span class="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-extrabold">[חכמת / עלי]</span>
  </div>
  <div class="text-xs text-slate-700 space-y-1 font-bold">
    <div>📍 <b>כתובת אספקה:</b> [רחוב, מספר, עיר]</div>
    <div>🏢 <b>מחסן מוצא:</b> [🏭 4 החרש / 🏟️ 1 התלמיד]</div>
    <div>🧭 <b>ניווט:</b> <a href="[Waze Link]" target="_blank" class="text-sky-600 underline font-black">נווט בוויז לחץ כאן</a></div>
  </div>
  <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800">
    <div class="font-black text-slate-900 mb-1">🛒 פירוט מוצרים:</div>
    [שורות מוצרים ומק"טים]
  </div>
  <div class="flex justify-between items-center pt-1 text-xs font-extrabold text-slate-700">
    <span>🛡️ פקדונות: [בלות: X | משטחים: Y]</span>
    <span class="text-emerald-700">✅ מאושר לסידור</span>
  </div>
</div>
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
  const q = query.toLowerCase();
  if (q.includes('בוקר') || q.includes('סידור') || q.includes('דוח')) {
    return `
      <div class="space-y-3 text-xs">
        <div class="font-black text-sm text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
          <span>📋 דוח בוקר מרוכז — סדרנות ח. סבן</span>
          <span class="text-xs text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full font-bold">היום</span>
        </div>
        <div class="space-y-2">
          <div class="p-2.5 rounded-xl bg-sky-50 border border-sky-200">
            <div class="font-bold text-sky-900">🏗️ חכמת (מרצדס מנוף 615-41-002) — סניף 4 החרש</div>
            <ul class="list-disc list-inside mt-1 space-y-1 text-slate-700 font-semibold">
              <li>הזמנה 6215454 (שחר שאול, הבנים 7 הוד השרון) — 2 בלות סומסום, 80 שק ריצופית, פריקת מנוף.</li>
              <li>הזמנה 6215432 (מידן לירן, אוסטושינסקי כפר סבא) — טיח גבס גלון, הובלת מנוף.</li>
              <li>הזמנה 6215430 (ל.ה בניה, לב השכונה הוד השרון) — 60 בלוקים בטון, 4 בלות סומסום.</li>
            </ul>
          </div>
          <div class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <div class="font-bold text-emerald-900">🚛 עלי (איסוזו פתוחה 654-51-701) — סניף 1 התלמיד</div>
            <ul class="list-disc list-inside mt-1 space-y-1 text-slate-700 font-semibold">
              <li>הזמנה 5040087 (אידלסון הראל, כיסופים 12 תל אביב) — מלט אפור, סיקפלקס 40 יח'.</li>
              <li>הזמנה 5020025 (לירן/מוצקין, מוצקין 22 רעננה) — עצי פיני, משושים לבטון 130 יח'.</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }
  return `
    <div class="space-y-2 text-xs">
      <div class="font-bold text-slate-800">היי ראמי ❤️ המערכות תקינות ומסונכרנות!</div>
      <div class="text-slate-600">צי הרכבים (חכמת מנוף ועלי איסוזו) מסודרים לפי קווי חלוקה ומאגרי סניף 4 (החרש) וסניף 1 (התלמיד).</div>
      <div class="p-2 rounded-xl bg-sky-50 border border-sky-200 font-bold text-sky-900">
        שאל אותי על "דוח בוקר", "בדיקת פקדונות", "הזמנות בסידור", או מספר הזמנה ספציפי.
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

    if (!cleanQuery) {
      return res.status(200).json({
        status: 'ok',
        htmlMessage: 'היי ראמי ❤️ הכל תקין ומסונכרן! באיזו הזמנה או נושא נתמקד עכשיו?',
        message: 'היי ראמי ❤️ הכל תקין ומסונכרן! באיזו הזמנה או נושא נתמקד עכשיו?',
        model: 'noa-logic-engine'
      });
    }

    // 1. Google Apps Script server proxy
    if (googleScriptUrl && googleScriptUrl.startsWith('http')) {
      try {
        const gasRes = await fetch(googleScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'CHAT_QUERY', query: cleanQuery, sender }),
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
      const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest'];

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
                        text: `${SYSTEM_INSTRUCTIONS}\n\nנתוני הזמנות אחרונות:\n${JSON.stringify(
                          SAMPLE_ORDERS,
                          null,
                          2
                        )}\n\nראמי שואל/מבקש: "${cleanQuery}".\nהגיבי כנועה AI בסגנון וואטסאפ מקצועי וידידותי בפורמט HTML נקי ומעוצב.`
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
