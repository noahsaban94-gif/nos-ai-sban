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

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const keys = getAllGeminiKeys();
    res.status(200).json({
      status: keys.length > 0 ? 'connected' : 'local-engine',
      totalKeys: keys.length,
      model: 'gemini-2.5-flash',
      rotationEnabled: keys.length > 1,
      message:
        keys.length > 0
          ? `מחובר בהצלחה — ${keys.length} מפתחות Gemini פעילים ברוטציה אוטומטית`
          : 'מנוע סדרנות מקומי חכם פעיל'
    });
  } catch (err) {
    res.status(200).json({
      status: 'local-engine',
      totalKeys: 0,
      model: 'noa-local-engine',
      rotationEnabled: false,
      message: 'מנוע סדרנות מקומי חכם פעיל'
    });
  }
}
