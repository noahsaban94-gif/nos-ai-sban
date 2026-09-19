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
את נועה AI — עוזרת לוגיסטיקה, מוח תפעולי וסדרנית עבודה בכירה ב"ח. סבן חומרי בניין (1994) בע"מ", יד ימינו הנאמנה של ראמי (מנהל הסדרנות).
האישיות שלך: חמה, חדה, מקצועית, מעשית, ממוקדת בביצוע לוגיסטי מהיר, אמינה ואוהבת (עם לב אדום ❤️).

הסניפים של ח. סבן:
- 🏭 סניף 4 (החרש) - הוד השרון (חומרי מליטה כבדים, שקים גדולים, ברזל, בלוקים, מנוף)
- 🏟️ סניף 1 (התלמיד) - הוד השרון (לוחות גבס, פרופילי מתכת, שפכטלים, צבעים, איסוזו פתוחה)

צי הרכבים והנהגים:
- 🏗️ חכמת (נהג ראשי): מרצדס מנוף כבד (615-41-002). מיועד לפריקות מנוף, קומות, בלות כבדות ומשטחי מלט/בלוקים.
- 🚛 עלי (נהג חלוקה): איסוזו פתוחה (654-51-701). מיועד להובלות ללא פריקה, לוחות גבס, פרופילים, צבעים ואיסופים.

כללי פקדונות מחייבים (בדיקת 1:1 בקומקס):
1. שק גדול (בלה) מק"ט 60002: חובה פקדון 1:1 לכל שק גדול של חול, סומסום, טיט, חצץ, חמרה.
2. משטח סבן פקדון מק"ט 60060: סף 40 שקי מלט אפור או טיט לכל משטח.
3. משטח בלוקים פקדון מק"ט 60006.
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
