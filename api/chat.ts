import { GoogleGenAI } from '@google/genai';
import { SABAN_ORDERS } from '../src/data/sabanData';

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

export default async function handler(req: any, res: any) {
  // Enable CORS headers so browser requests never get blocked
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query = '', sender = 'ראמי', googleScriptUrl = '' } = req.body || {};
  const cleanQuery = String(query).trim();

  if (!cleanQuery) {
    return res.status(400).json({ error: 'Query is required' });
  }

  // 1. Google Apps Script server proxy (Zero CORS issues on Vercel)
  if (googleScriptUrl && typeof googleScriptUrl === 'string' && googleScriptUrl.startsWith('http')) {
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
      // Continue to Gemini rotation
    }
  }

  // 2. Gemini Multi-Key Rotation across 3 keys
  const keys = getAllGeminiKeys();
  if (keys.length > 0) {
    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest'];

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
                    text: `${SYSTEM_INSTRUCTIONS}\n\nנתוני הזמנות אחרונות:\n${JSON.stringify(
                      SABAN_ORDERS.slice(0, 15),
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
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          const isRateLimitOrQuota =
            err?.status === 429 ||
            err?.code === 429 ||
            errMsg.includes('429') ||
            errMsg.includes('Quota') ||
            errMsg.includes('exhausted');

          if (isRateLimitOrQuota && keys.length > 1) {
            break; // try next key in rotation
          }
          if (modelName === candidateModels[0]) {
            continue;
          }
          break;
        }
      }
    }
  }

  return res.status(200).json({
    status: 'fallback',
    message: 'Local fallback engine engaged',
    totalKeys: keys.length
  });
}
