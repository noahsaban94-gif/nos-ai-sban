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
    console.warn('Make.com webhook serverless dispatch error:', err);
    return res.status(200).json({
      status: 'warning',
      dispatched: false,
      message: 'שגיאה בשליחה ל-Make.com, ההזמנה מתועדת במערכת',
      error: err?.message || String(err)
    });
  }
}
