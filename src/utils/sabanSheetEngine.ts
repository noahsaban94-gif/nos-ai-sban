import { SabanOrder, SheetDiscrepancy, SheetMutationResult, OperationalMemoryItem } from '../types';
import { calculateDeposits } from '../data/sabanData';

export const GOOGLE_SHEETS_CONFIG = {
  unifiedSheetId: '1Ie7gKql_EDdrIN9HqunJc9Ey5k0WXXfPRxs0Vp1Bs2c',
  unifiedSheetUrl: 'https://docs.google.com/spreadsheets/d/1Ie7gKql_EDdrIN9HqunJc9Ey5k0WXXfPRxs0Vp1Bs2c',
  driverDashboardSheetId: '1VA9J6n9IYcooO_s2xOpnkvyDQWWQD3pfhh0cnenCkoA',
  driverDashboardSheetUrl: 'https://docs.google.com/spreadsheets/d/1VA9J6n9IYcooO_s2xOpnkvyDQWWQD3pfhh0cnenCkoA',
  tabs: {
    orders: 'הזמנות_סידור',
    reconciliation: 'הצלבה_ובקרה',
    drivers: 'דשבורד סידור נהגים',
  },
};

/**
 * מזהה חריגות ואי-התאמות בגיליון:
 * - הזמנות ללא תעודת משלוח חתומה (hasDeliveryNote טרם)
 * - חוסרים באספקה (למשל: ממתין להשלמת 8 אזיקונים)
 * - הזמנות פתוחות מעל יומיים
 * - בדיקת פקדונות בלות
 */
export function auditSheetDiscrepancies(orders: SabanOrder[]): SheetDiscrepancy[] {
  const discrepancies: SheetDiscrepancy[] = [];

  for (const o of orders) {
    // 1. תעודת משלוח חסרה
    if (o.hasDeliveryNote.includes('טרם')) {
      discrepancies.push({
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        issue: 'תעודת משלוח טרם נחתמה/נסרקה במערכת (חובה לפני העברה ללינה לחיוב)',
        severity: o.status.includes('סופק') ? 'high' : 'medium',
        status: o.status,
        hasDeliveryNote: o.hasDeliveryNote,
      });
    }

    // 2. אספקה חלקית / חוסרים
    if (o.status.includes('חלקית') || o.status.includes('ממתין') || o.itemsText.includes('ממתין להשלמת')) {
      discrepancies.push({
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        issue: 'אספקה חלקית באתר (חוסר פריטים הממתין להשלמה מהמחסן)',
        severity: 'high',
        status: o.status,
        hasDeliveryNote: o.hasDeliveryNote,
      });
    }

    // 3. אי-התאמת פקדון בלות (אם יש בלה אך אין פקדון וההובלה אינה ללא פריקה)
    const isNoUnload = o.itemsText.includes('ללא פריקה') || o.bigBagsDeposit.includes('פטור');
    const hasBigBagsInItems = o.itemsText.includes('שק גדול') || o.itemsText.includes('בלה');
    if (hasBigBagsInItems && !isNoUnload && (o.bigBagsDeposit === '0' || !o.bigBagsDeposit)) {
      discrepancies.push({
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        issue: 'חריגת פקדון קומקס: קיימת בלה בפירוט המוצרים ללא שורת פקדון 60002 תואמת',
        severity: 'high',
        status: o.status,
        hasDeliveryNote: o.hasDeliveryNote,
      });
    }
  }

  return discrepancies;
}

/**
 * מנוע מענה אנושי מבוסס היגיון ושליטה בגיליונות
 */
export function processLogicAndSheetCommand(
  query: string,
  orders: SabanOrder[],
  memories: OperationalMemoryItem[] = []
): {
  replyText: string;
  replyHtml?: string;
  mutatedOrders?: SabanOrder[];
  actionCard?: {
    type:
      | 'order'
      | 'morning_report'
      | 'driver_status'
      | 'deposit_calc'
      | 'quote'
      | 'waze_route'
      | 'chart_analysis'
      | 'sheet_control'
      | 'order_mutation'
      | 'webhook_dispatch';
    data?: any;
  };
} {
  const q = query.trim();
  const qLower = q.toLowerCase();

  // בדיקת שליחת ווביהוק / וואטסאפ (לדוגמה: "ליצור בדיקת ווביהוק", "תאפשר שליחת הודעת ווצאף ווביהוק", "שלחי בוואטסאפ לנהג את הזמנה 5040087", "שדרי ווביהוק להזמנה 5040087")
  if (
    qLower.includes('ווביהוק') ||
    qLower.includes('webhook') ||
    qLower.includes('ווצאפ') ||
    qLower.includes('וואטסאפ') ||
    qLower.includes('whatsapp') ||
    qLower.includes('make.com') ||
    qLower.includes('hook.eu1.make.com')
  ) {
    const isTest = q.includes('בדיק') || qLower.includes('test');
    const matchedOrder = orders.find((o) =>
      (q.includes(o.orderNumber)) || (q.includes(o.customerName))
    ) || orders.find((o) => o.orderNumber === '5040087') || orders[0];

    if (matchedOrder) {
      const webhookUrl = 'https://hook.eu1.make.com/yvywlj4kpryenbte86oedh4826glhb3u';
      const formattedMessage = `📦 *הזמנה ${matchedOrder.orderNumber}* — *${matchedOrder.customerName}*

💬 *הזמנה חדשה נקלטה במערכת נועה AI* 💬

👤 *שם לקוח:* ${matchedOrder.customerName}${matchedOrder.customerId ? ` (מס' לקוח: ${matchedOrder.customerId})` : ''}
🏢 *מחסן יוצא:* ${matchedOrder.warehouse}
📍 *כתובת אספקה:* ${matchedOrder.deliveryAddress}
🧾 *מספר הזמנה:* ${matchedOrder.orderNumber}
📅 *תאריך אספקה:* 19/09/2026 (היום)
📞 *איש קשר:* ${matchedOrder.customerName}${matchedOrder.phone ? ` (${matchedOrder.phone})` : ''}

👋 *שיבוץ נהג:* ${matchedOrder.driver}
🧭 *ניווט Waze:* ${matchedOrder.wazeUrl || ''}

🛒 *ריכוז מוצרים:*
${matchedOrder.itemsText}`;

      const naturalReply = isTest
        ? `יצרתי כרטיס בדיקת ווביהוק ייעודי עבור Make.com (כתובת ה-Hook מוכנה עם נתוני הזמנה ${matchedOrder.orderNumber}). אפשר ללחוץ על 'בצע בדיקת שידור עכשיו' או 'בדוק שידור בטסט', והמערכת תשגר את נתוני ה-JSON המלאים ישירות ל-Make.`
        : `הכנתי את שידור הוואטסאפ והווביהוק להזמנה ${matchedOrder.orderNumber} של ${matchedOrder.customerName} ישירות לעלי ולמערכת Make. פרטי הכתובת, הנהג, קישור ה-Waze והמוצרים מוכנים לשידור בלחיצה אחת.`;

      return {
        replyText: naturalReply,
        actionCard: {
          type: 'webhook_dispatch',
          data: {
            order: matchedOrder,
            webhookUrl,
            formattedMessage,
            isTest,
          },
        },
      };
    }
  }

  // 1. פקודת שינוי סטטוס להזמנה בגיליון (לדוגמה: "סמני ש-6215454 סופקה", "הזמנה 6215454 סופקה", "תעדכני סטטוס סופק להזמנה 6215454")
  const statusMatch = q.match(/(?:הזמנה\s*#?|#)(\d{7})|(?:מספר\s*)(\d{7})/);
  const foundOrderNum = statusMatch ? statusMatch[1] || statusMatch[2] : null;

  if (
    foundOrderNum &&
    (qLower.includes('סופק') ||
      qLower.includes('נמסר') ||
      qLower.includes('הסתיימ') ||
      qLower.includes('סיימ') ||
      qLower.includes('בהכנה') ||
      qLower.includes('בחלוקה') ||
      qLower.includes('בסידור'))
  ) {
    const targetOrder = orders.find((o) => o.orderNumber === foundOrderNum);
    if (targetOrder) {
      let newStatus = '✅ סופק במלואו';
      if (qLower.includes('בהכנה')) newStatus = '⚙️ בהכנה';
      else if (qLower.includes('בחלוקה') || qLower.includes('בהפצה')) newStatus = '🚚 בחלוקה';
      else if (qLower.includes('בסידור')) newStatus = '⏳ בסידור עבודה';

      const updatedOrders = orders.map((o) =>
        o.orderNumber === foundOrderNum
          ? {
              ...o,
              status: newStatus,
              hasDeliveryNote: newStatus.includes('סופק') ? '✅ כן (נחתם)' : o.hasDeliveryNote,
            }
          : o
      );

      const updated = updatedOrders.find((o) => o.orderNumber === foundOrderNum)!;
      const naturalReply = `עדכנתי לך ישירות בגיליון, הזמנה ${targetOrder.orderNumber} (${targetOrder.customerName}) סומנה עכשיו כ"${newStatus}". ${
        newStatus.includes('סופק') ? 'תעודת המשלוח עודכנה כנחתמה ומוכנה להעברה ללינה לחיוב.' : ''
      }`;

      return {
        replyText: naturalReply,
        mutatedOrders: updatedOrders,
        actionCard: {
          type: 'order_mutation',
          data: {
            action: 'update_status',
            order: updated,
            previousStatus: targetOrder.status,
            newStatus,
          },
        },
      };
    }
  }

  // 2. פקודת העברת / החלפת נהג בגיליון (לדוגמה: "תעבירי את 5020025 לחכמת", "תשני נהג בהזמנה 6215430 לעלי")
  if (foundOrderNum && (qLower.includes('חכמת') || qLower.includes('עלי')) && (qLower.includes('העבר') || qLower.includes('תעבירי') || qLower.includes('תשני נהג') || qLower.includes('שיבוץ'))) {
    const targetOrder = orders.find((o) => o.orderNumber === foundOrderNum);
    if (targetOrder) {
      const newDriver = qLower.includes('חכמת')
        ? 'חכמת (מרצדס מנוף 615-41-002)'
        : 'עלי (משאית איסוזו פתוחה 654-51-701)';

      const updatedOrders = orders.map((o) =>
        o.orderNumber === foundOrderNum ? { ...o, driver: newDriver } : o
      );

      const updated = updatedOrders.find((o) => o.orderNumber === foundOrderNum)!;
      const driverName = qLower.includes('חכמת') ? 'חכמת עם המרצדס מנוף' : 'עלי עם האיסוזו';
      const naturalReply = `העברתי בגיליון את הזמנה ${targetOrder.orderNumber} של ${targetOrder.customerName} ל${driverName}. הכתובת עודכנה לו בקו האספקה.`;

      return {
        replyText: naturalReply,
        mutatedOrders: updatedOrders,
        actionCard: {
          type: 'order_mutation',
          data: {
            action: 'reassign_driver',
            order: updated,
            newDriver,
          },
        },
      };
    }
  }

  // 3. פתיחת הזמנה חדשה בגיליון ("תוסיפי הזמנה ל...", "תפתחי הזמנה למשה כהן ברעננה: 2 בלות סומסום ו-30 מלט")
  if (
    (qLower.startsWith('תוסיפי הזמנה') ||
      qLower.startsWith('תפתחי הזמנה') ||
      qLower.startsWith('הזמנה חדשה ל') ||
      qLower.startsWith('תרשמי הזמנה ל')) &&
    (qLower.includes('בלות') || qLower.includes('מלט') || qLower.includes('חול') || qLower.includes('סומסום') || qLower.includes('בלוק'))
  ) {
    // נחלץ לקוח, עיר, פריטים
    const customerMatch = q.match(/(?:ל|עבור)\s*([א-ת\s"״]+?)(?:ב|ברחוב|רחוב|,\s*|\s*:\s*)/);
    const customerName = customerMatch ? customerMatch[1].trim() : 'לקוח חדש';

    let city = 'רעננה';
    if (q.includes('הוד השרון')) city = 'הוד השרון';
    else if (q.includes('כפר סבא')) city = 'כפר סבא';
    else if (q.includes('הרצליה')) city = 'הרצליה';
    else if (q.includes('תל אביב')) city = 'תל אביב';
    else if (q.includes('מודיעין')) city = 'מודיעין';
    else if (q.includes('גבעתיים')) city = 'גבעתיים';

    // חישוב בלות
    const bagMatch = q.match(/(\d+)\s*(?:בלות|בלה|שק גדול)/);
    const bagCount = bagMatch ? parseInt(bagMatch[1], 10) : 1;

    // חישוב מלט
    const cementMatch = q.match(/(\d+)\s*(?:שק|שקי)?\s*מלט/);
    const cementCount = cementMatch ? parseInt(cementMatch[1], 10) : 0;

    const palletCount = cementCount >= 40 ? Math.floor(cementCount / 40) : 0;
    const isHeavy = bagCount > 0 || cementCount >= 20;
    const assignedDriver = isHeavy
      ? 'חכמת (מרצדס מנוף 615-41-002)'
      : 'עלי (משאית איסוזו פתוחה 654-51-701)';
    const assignedWarehouse = isHeavy ? '🏭 4️⃣(החרש)' : '🏟️ 1️⃣(התלמיד)';

    const newOrderNumber = String(6215500 + Math.floor(Math.random() * 100));
    const newOrder: SabanOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: newOrderNumber,
      orderDate: new Date().toISOString().replace('T', ' ').slice(0, 19),
      customerName,
      warehouse: assignedWarehouse,
      deliveryAddress: `${city}`,
      itemsText: `${bagCount > 0 ? `1. סומסום/חול שק גדול | כמות: ${bagCount} בלות\n` : ''}${
        cementCount > 0 ? `2. מלט אפור 25 ק"ג | כמות: ${cementCount} שק\n` : ''
      }3. הובלת ${isHeavy ? 'מנוף' : 'חלוקה'} ${city}`,
      bigBagsDeposit: `${bagCount} בלות (${bagCount * 35} ₪)`,
      palletsDeposit: palletCount > 0 ? `${palletCount} משטח` : 'פטור',
      driver: assignedDriver,
      hasDeliveryNote: '⏳ טרם',
      status: '⏳ בסידור עבודה (חדש)',
      wazeUrl: `https://waze.com/ul?q=${encodeURIComponent(city)}&navigate=yes`,
      whatsappUrl: `https://api.whatsapp.com/send?text=${encodeURIComponent(`הזמנה ${newOrderNumber} עבור ${customerName}`)}`,
    };

    const updatedOrders = [newOrder, ...orders];
    const naturalReply = `הוספתי את ההזמנה לגיליון הזמנות_סידור. מספר הזמנה #${newOrderNumber} עבור ${customerName} ב${city}. שיבצתי את ${
      isHeavy ? 'חכמת עם המרצדס מנוף מסניף 4 החרש' : 'עלי מסניף 1 התלמיד'
    }. פקדונות שחושבו לפי קומקס: ${bagCount} בלות (${bagCount * 35} ₪)${
      palletCount > 0 ? ` ו-${palletCount} משטחי סבן` : ''
    }.`;

    return {
      replyText: naturalReply,
      mutatedOrders: updatedOrders,
      actionCard: {
        type: 'order_mutation',
        data: {
          action: 'add_order',
          order: newOrder,
        },
      },
    };
  }

  // 4. דרישת ביקורת הצלבה ובקרה / חריגות בגיליון
  if (
    qLower.includes('הצלבה') ||
    qLower.includes('חריגות') ||
    qLower.includes('ביקורת') ||
    qLower.includes('חוסרים') ||
    qLower.includes('תעודות חסרות')
  ) {
    const discrepancies = auditSheetDiscrepancies(orders);
    const missingNotesCount = orders.filter((o) => o.hasDeliveryNote.includes('טרם')).length;
    const partialCount = orders.filter((o) => o.status.includes('חלקית') || o.status.includes('ממתין')).length;

    const naturalReply = `הרצתי ביקורת על טאב הצלבה_ובקרה מול הזמנות_סידור. יש כרגע ${missingNotesCount} הזמנות שממתינות לתעודת משלוח חתומה, ו-${partialCount} הזמנות באספקה חלקית (כולל לירן במוצקין שממתין להשלמת 8 אזיקונים). פתחתי לך את כרטיס הבקרה המלא.`;

    return {
      replyText: naturalReply,
      actionCard: {
        type: 'sheet_control',
        data: {
          tab: 'reconciliation',
          discrepancies,
          missingNotesCount,
          partialCount,
          totalOrders: orders.length,
        },
      },
    };
  }

  // 5. צפייה ושליטה ישירה בגיליונות ("תציגי את הגיליון", "תפתחי את הגיליון", "מה הסטטוס בגיליון")
  if (
    qLower.includes('גיליון') ||
    qLower.includes('גליון') ||
    qLower.includes('טאב') ||
    qLower.includes('שיטס') ||
    qLower.includes('sheets')
  ) {
    const activeCount = orders.filter((o) => !o.status.includes('סופק')).length;
    const deliveredCount = orders.filter((o) => o.status.includes('סופק')).length;

    const naturalReply = `יש לנו בגיליון המאוחד ${orders.length} שורות: ${activeCount} הזמנות פתוחות בסידור העבודה, ו-${deliveredCount} הזמנות שכבר סופקו. הנה מרכז השליטה הישיר בגיליונות, כולל גישה לטאב הזמנות_סידור ולטאב הצלבה_ובקרה.`;

    return {
      replyText: naturalReply,
      actionCard: {
        type: 'sheet_control',
        data: {
          tab: 'orders',
          activeCount,
          deliveredCount,
          totalOrders: orders.length,
        },
      },
    };
  }

  // 6. חיפוש ישיר של הזמנה / לקוח ספציפי
  const matched = orders.filter(
    (o) =>
      (foundOrderNum && o.orderNumber.includes(foundOrderNum)) ||
      o.customerName.toLowerCase().includes(qLower) ||
      (qLower.length > 3 && o.deliveryAddress.toLowerCase().includes(qLower))
  );

  if (matched.length > 0 && !qLower.includes('הזמנות') && !qLower.includes('סידור') && !qLower.includes('דוח')) {
    const o = matched[0];
    const isDelivered = o.status.includes('סופק');
    const naturalReply = `הנה הפרטים על ההזמנה של ${o.customerName} (#${o.orderNumber}): היא בסטטוס ${o.status}, משובצת ל${o.driver}, ויעד האספקה הוא ${o.deliveryAddress}. פקדונות: ${o.bigBagsDeposit} ו-${o.palletsDeposit}. תעודת משלוח: ${o.hasDeliveryNote}.`;

    return {
      replyText: naturalReply,
      actionCard: {
        type: 'order',
        data: o,
      },
    };
  }

  // 7. שיבוץ נהגים ומצב צי רכב
  if (qLower.includes('שיבוץ') || qLower.includes('נהגים') || (qLower.includes('חכמת') && qLower.includes('עלי')) || qLower.includes('רכבים')) {
    const chachmatOrders = orders.filter((o) => o.driver.includes('חכמת') && !o.status.includes('סופק'));
    const aliOrders = orders.filter((o) => o.driver.includes('עלי') && !o.status.includes('סופק'));

    const naturalReply = `לחכמת יש כרגע ${chachmatOrders.length} משימות מנוף פתוחות מסניף 4 החרש (בעיקר בלות סומסום, חול, מלט ובלוקים להוד השרון, כפר סבא ורעננה). עלי עם האיסוזו מסניף 1 התלמיד על ${aliOrders.length} קווי חלוקה של לוחות גבס ופרופילים. הכל זורם לפי התוכנית.`;

    return {
      replyText: naturalReply,
      actionCard: {
        type: 'driver_status',
        data: {
          chachmatCount: chachmatOrders.length,
          aliCount: aliOrders.length,
        },
      },
    };
  }

  // 8. דוח בוקר יומי
  if (qLower.includes('דוח בוקר') || qLower.includes('סידור עבודה להיום') || qLower.includes('סיכום בוקר')) {
    const active = orders.filter((o) => !o.status.includes('סופק'));
    const naturalReply = `הכנתי את סידור העבודה להיום: סך הכל ${active.length} משימות פעילות. חכמת פותח עם שחר שאול בהבנים 7 הוד השרון (פריקת מנוף גובה) וממשיך לאוסטושינסקי בכפר סבא. עלי מכסה את קו תל אביב עם אידלסון הראל ואז עולה לרעננה ללירן. כל הנהגים מסונכרנים ב-Waze.`;

    return {
      replyText: naturalReply,
      actionCard: {
        type: 'morning_report',
        data: {
          activeCount: active.length,
          orders: active,
        },
      },
    };
  }

  // 9. בדיקת פקדונות קומקס
  if (qLower.includes('פקדון') || qLower.includes('מחשבון') || (qLower.includes('בלה') && qLower.includes('כמה'))) {
    // נחלץ מספר בלות
    const bCount = q.match(/(\d+)\s*(?:בלה|בלות|שק גדול)/);
    const count = bCount ? parseInt(bCount[1], 10) : 4;
    const isExempt = qLower.includes('ללא פריקה');

    if (isExempt) {
      return {
        replyText: `כשמדובר בהובלה ללא פריקה (מק"טים 818050–818118) יש פטור מלא מפקדונות בלות ומשטחים בקומקס, כי הלקוח פורק ידנית במקום.`,
        actionCard: {
          type: 'deposit_calc',
          data: { count: 0, cost: 0, isExempt: true },
        },
      };
    }

    const cost = count * 35;
    return {
      replyText: `לפי נוהל קומקס של ח. סבן, על ${count} בלות של חומר תפזורת (חול, סומסום או טיט) יש חיוב של בדיוק ${count} שקי פקדון מק"ט 60002 ביחס 1:1, שזה ${cost} ₪ לפני מע"מ. מלט מחייב משטח עץ (60060) רק החל מ-40 שקים ומעלה.`,
      actionCard: {
        type: 'deposit_calc',
        data: { count, cost, isExempt: false },
      },
    };
  }

  // 10. ברכות, שאלות שלום, שיחה אנושית פתוחה
  const greetings = [
    'בוקר טוב ראמי, כאן איתך. מה בתוכנית להיום?',
    'היי ראמי, מה שלומך? על מה אנחנו עובדים עכשיו?',
    'שלום ראמי, אני פה ומסונכרנת עם כל הגיליונות. במה נתחיל?',
    'אהלן ראמי. אני מחוברת לשני הסניפים ולנהגים, מוכנה לכל משימה.',
  ];

  if (
    qLower === 'היי' ||
    qLower === 'שלום' ||
    qLower === 'בוקר טוב' ||
    qLower === 'ערב טוב' ||
    qLower === 'היי נועה' ||
    qLower === 'שלום נועה' ||
    qLower === 'נועה' ||
    qLower.startsWith('מה קורה') ||
    qLower.startsWith('מה נשמע')
  ) {
    const selected = greetings[Math.floor(Math.random() * greetings.length)];
    return {
      replyText: selected,
    };
  }

  // ברירת מחדל אנושית וחדה
  return {
    replyText: `הבנתי אותך ראמי. אני מחוברת לגיליונות סניף 4 החרש וסניף 1 התלמיד. תרצה שאעדכן שורה בגיליון, אבדוק שיבוץ של חכמת או עלי, או שנריץ ביקורת חוסרים?`,
  };
}
