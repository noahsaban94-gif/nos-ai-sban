import { SabanOrder, DriverInfo } from '../types';

export const SABAN_DRIVERS: DriverInfo[] = [
  {
    name: 'חכמת',
    role: 'מרצדס מנוף כבד (סניף 4 החרש)',
    truck: 'מרצדס מנוף כבד (פריקות לגובה/מרפסות, אגרגטים, בלוקים)',
    plateNumber: '615-41-002',
    phone: '050-8860896',
    activeOrdersCount: 14,
  },
  {
    name: 'עלי',
    role: 'משאית איסוזו חלוקה וגבס (סניף 1 התלמיד)',
    truck: 'משאית איסוזו פתוחה (גבס, פרופילים, צבע, כלי עבודה, פריקה ידנית ומלגזה)',
    plateNumber: '651-51-701',
    phone: '050-8868010',
    activeOrdersCount: 9,
  },
];

export const SABAN_WAREHOUSES = [
  {
    code: '4',
    name: 'סניף 4 (החרש) - הוד השרון',
    icon: '🏭 4️⃣',
    specialty: 'מגרש ראשי, אגרגטים בבלות ובתפזורת, מליטה, בלוקים, ברזל בניין. מנהל חצר: אורן | מנהל חנות: איציק זהבי',
    address: 'רחוב החרש 4, הוד השרון',
  },
  {
    code: '1',
    name: 'סניף 1 (התלמיד) - הוד השרון',
    icon: '🏟️ 1️⃣',
    specialty: 'חומרים קלים, לוחות גבס, פרופילים, צבע, כלי עבודה, ברגים ואיטום. מנהל: תמיר/דורון',
    address: 'רחוב התלמיד 6, הוד השרון',
  },
];

export const SABAN_ORDERS: SabanOrder[] = [
  {
    id: '1',
    orderDate: '2026-09-17 15:16:00',
    orderNumber: '5040087',
    customerId: '811005',
    customerName: 'אידלסון הראל',
    warehouse: '🏟️ 1️⃣(התלמיד)',
    deliveryAddress: 'כיסופים 12, תל אביב',
    itemsText: '1. מק"ט: 10002 | מלט אפור 25 ק"ג | כמות: 2\n2. מק"ט: 11500 | חול שק | כמות: 7\n3. מק"ט: 11550 | טיט שק | כמות: 7\n4. מק"ט: 15132 | דבק 132 לבן 25 ק"ג כרמית | כמות: 4\n5. מק"ט: 15023 | בונד 200 גלון 5 ק"ג | כמות: 1\n6. מק"ט: 15686 | סיקפלקס FC11 שרוול אפור SIKA | כמות: 40\n7. מק"ט: 15665 | סיקה POOL תרמיל אפור SIKA | כמות: 1\n8. מק"ט: 30860 | סף אלומיניום 30/3 3 מ.א. | כמות: 1\n9. מק"ט: 15805 | סיקה לסטיק 1K 17 ק"ג SIKA | כמות: 2\n10. מק"ט: 1930120 | איגולפלקס 301 20 ק"ג SIKA | כמות: 2\n11. מק"ט: 818065 | הובלה ללא פריקה תל אביב צפון | כמות: 1',
    bigBagsDeposit: 'פטור (הובלה ללא פריקה)',
    palletsDeposit: 'פטור (הובלה ללא פריקה)',
    driver: 'עלי (משאית איסוזו 651-51-701)',
    wazeUrl: 'https://www.waze.com/ul?q=%D7%9B%D7%99%D7%A1%D7%95%D7%A4%D7%99%D7%9D%2012%2C%20%D7%AA%D7%9C%20%D7%90%D7%91%D7%99%D7%91&navigate=yes',
    whatsappUrl: 'https://api.whatsapp.com/send?phone=972505227724&text=%F0%9F%93%A6%20%2A5040087%2A',
    hasDeliveryNote: '⏳ טרם',
    status: '⏳ בסידור עבודה (חדש)',
    phone: '050-5227724',
    voiceStatus: '⏳ ממתין לשידור',
  },
  {
    id: '2',
    orderDate: '2026-09-14 05:31:00',
    orderNumber: '6215460',
    customerId: '601244',
    customerName: 'אילתי אברהם (אבי)/מודיעין',
    warehouse: '🏭 4️⃣(החרש)',
    deliveryAddress: 'מגדל הלבנון 14, מודיעין',
    itemsText: '1. מק"ט: 11511 | סומסום שק גדול | כמות: 8\n2. מק"ט: 11551 | טיט שק גדול | כמות: 3\n3. מק"ט: 10002 | מלט אפור 25 ק"ג | כמות: 20\n4. מק"ט: 14604 | פלסטומר AD603 לבן 25 ק"ג | כמות: 10\n5. מק"ט: 18094 | הובלת מנוף מודעין | כמות: 1\n6. מק"ט: 60002 | שק גדול פקדון | כמות: 11\n7. מק"ט: 60060 | משטח סבן פקדון | כמות: 1',
    bigBagsDeposit: '11 בלות',
    palletsDeposit: '1 משטח',
    driver: 'חכמת (מרצדס מנוף 615-41-002)',
    wazeUrl: 'https://www.waze.com/ul?q=%D7%9E%D7%92%D7%93%D7%9C%20%D7%94%D7%9C%D7%91%D7%A0%D7%95%D7%9F%2014%2C%20%D7%9E%D7%95%D7%93%D7%99%D7%A2%D7%99%D7%9F&navigate=yes',
    whatsappUrl: 'https://api.whatsapp.com/send?phone=972508861080&text=%F0%9F%93%A6%20%2A6215460%2A',
    hasDeliveryNote: '⏳ טרם',
    status: '⏳ בסידור עבודה',
    phone: '050-8860896',
    voiceStatus: '✅ שוגר קולית',
  },
  {
    id: '3',
    orderDate: '2026-09-11 09:57:00',
    orderNumber: '6215454',
    customerId: '632058',
    customerName: 'שחר שאול תכנון/הוד השרון',
    warehouse: '🏭 4️⃣(החרש)',
    deliveryAddress: 'הבנים 7, הוד השרון',
    itemsText: '1. מק"ט: 11511 | סומסום שק גדול | כמות: 2 שק גד (1,460 ק"ג)\n2. מק"ט: 15181 | ריצופית אפור 181 25 ק"ג כרמית | כמות: 80 שק (2,000 ק"ג)\n3. מק"ט: 14603 | פלסטומר AD603 אפור 25 ק"ג | כמות: 30 שק (750 ק"ג)\n4. מק"ט: 114260 | לוח גבס כחול 260 ע 12.50 | כמות: 16 יח\'\n5. מק"ט: 8670300 | מסלול 0.6 70/300 | כמות: 10 יח\'\n6. מק"ט: 9670300 | ניצב 0.6 70/300 | כמות: 20 יח\'\n7. מק"ט: 18050 | הובלת מנוף הוד השרון | כמות: 1 יח\'\n8. מק"ט: 60002 | שק גדול פקדון | כמות: 2 שק גד\n9. מק"ט: 60060 | משטח סבן פקדון | כמות: 2 משטח',
    bigBagsDeposit: '2 בלות',
    palletsDeposit: '2 משטחי סבן',
    driver: 'חכמת (משאית מרצדס מנוף 615-41-002)',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1QDODxShUpk-DWgMeUokznR-q9Yr4Edqx',
    wazeUrl: 'https://www.waze.com/ul?q=%D7%94%D7%91%D7%A0%D7%99%D7%9D%207%2C%20%D7%94%D7%95%D7%93%20%D7%94%D7%A9%D7%A8%D7%95%D7%9F&navigate=yes',
    whatsappUrl: 'https://api.whatsapp.com/send?phone=972547330732&text=%F0%9F%93%A6%20%2A6215454%2A',
    hasDeliveryNote: '⏳ טרם',
    status: '⏳ בסידור עבודה | אספקה 14.9',
    phone: '054-7330732',
  },
  {
    id: '4',
    orderDate: '2026-09-11 08:39:00',
    orderNumber: '5020025',
    customerId: '612108',
    customerName: 'לירן/מוצקין (לי-רן יזום בבניה)',
    warehouse: '🏭 4️⃣(החרש)',
    deliveryAddress: 'מוצקין 22, רעננה | איש קשר: יהודה כהן (050-566-9924)',
    itemsText: '1. מק"ט: 76121 | משושה לבטון 8X100 ETA EUR M10 | כמות: 130 יח\'\n2. מק"ט: 608100 | מקדח SDS 8 160/100 BOSCH | כמות: 1 יח\'\n3. מק"ט: 740725 | בוקסה מגנטית 13 מ"מ | כמות: 1 יח\'\n4. מק"ט: 65805403 | אזיקונים לבן 8/550 KSS 100יח | כמות: 9 חב\'\n5. מק"ט: 750300 | קרש עץ פיני 100*50 3.00 מטר | כמות: 22 יח\'\n6. מק"ט: 818055 | הובלה ללא פריקה כ"ס-רעננה | כמות: 1 יח\'',
    bigBagsDeposit: 'ℹ️ פטור (אין חומרי תפזורת)',
    palletsDeposit: 'ℹ️ פטור (אין משטחים)',
    driver: 'עלי (משאית איסוזו פתוחה 651-51-701)',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1k0erS1PHtlQyn6Lu1E7mn3AHiHNWMzJj',
    wazeUrl: 'https://www.waze.com/ul?q=%D7%9E%D7%95%D7%A6%D7%A7%D7%99%D7%9F%2022%2C%20%D7%A8%D7%A2%D7%A0%D7%A0%D7%94&navigate=yes',
    whatsappUrl: 'https://api.whatsapp.com/send?phone=972505669924&text=%F0%9F%93%A6%20%2A5020025%2A',
    hasDeliveryNote: '⏳ טרם',
    status: '⚙️ בהכנה | אספקה חלקית (ממתין להשלמת 8 חב\' אזיקונים)',
    phone: '050-5669924',
  },
  {
    id: '5',
    orderDate: '2026-09-11 08:20:00',
    orderNumber: '6215453',
    customerId: '510867',
    customerName: 'קורט צבי הולנדר (1996) בע"מ',
    warehouse: '🏭 4️⃣(החרש)',
    deliveryAddress: 'לולים גבעת חן, גבעת חן | פריקה עצמאית במלגזת לקוח מעלי',
    itemsText: '1. מק"ט: 11506 | חצץ שק גדול | כמות: 1 שק גד\n2. מק"ט: 11501 | חול שק גדול | כמות: 2 שק גד\n3. מק"ט: 11511 | סומסום שק גדול | כמות: 2 שק גד\n4. מק"ט: 1608320 | רשת ברזל 8.0 20#20 3X2.5 | כמות: 2 יח\'\n5. מק"ט: 1665320 | רשת ברזל 6.5 20#20 3X2.5 | כמות: 2 יח\'\n6. מק"ט: 10002 | מלט אפור 25 ק"ג | כמות: 20 שק\n7. מק"ט: 818050 | הובלה ללא פריקה הוד השרון (פריקה במלגזת לקוח) | כמות: 1 יח\'\n8. מק"ט: 60002 | שק גדול פקדון | כמות: 5 שק גד\n9. מק"ט: 60060 | משטח סבן פקדון | כמות: 1 משטח',
    bigBagsDeposit: '5 בלות (מק"ט 60002)',
    palletsDeposit: '1 משטח סבן (מק"ט 60060)',
    driver: 'עלי (משאית איסוזו פתוחה 651-51-701)',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1-lFnuwryYLfhCNcc_mTshxw8Z3Sr6OjK',
    wazeUrl: 'https://www.waze.com/ul?q=%D7%9C%D7%95%D7%9C%D7%99%D7%9D%20%D7%92%D7%91%D7%A2%D7%AA%20%D7%97%D7%9F%2C%20%D7%92%D7%91%D7%A2%D7%AA%20%D7%97%D7%9F&navigate=yes',
    whatsappUrl: 'https://api.whatsapp.com/send?phone=972505753659&text=%F0%9F%93%A6%20%2A6215453%2A',
    hasDeliveryNote: '⏳ טרם',
    status: '⏳ בסידור עבודה | פריקה עצמית במלגזת לקוח מעלי (חובה חיוב פקדונות)',
    phone: '050-5753659',
  },
  {
    id: '6',
    orderDate: '2026-09-10 09:49:00',
    orderNumber: '6215432',
    customerId: '613383',
    customerName: 'מידן לירן/אוסטושינסקי',
    warehouse: '🏭 4️⃣(החרש)',
    deliveryAddress: 'אוסטושינסקי 5, כפר סבא',
    itemsText: '1. מק"ט: 14076 | טיח גבס גלון | כמות: 40 יח\'\n2. מק"ט: 18055 | הובלת מנוף כפר סבא-רעננה | כמות: 1 יח\'\n3. מק"ט: 60060 | משטח סבן פקדון | כמות: 1 משטח',
    bigBagsDeposit: '0',
    palletsDeposit: '1 משטח סבן',
    driver: 'חכמת (משאית מרצדס מנוף 615-41-002)',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1g3Tk508n7cg8xm2SHOlnnW8_B3trhDFC',
    wazeUrl: 'https://www.waze.com/ul?q=%D7%90%D7%95%D7%A1%D7%98%D7%95%D7%A9%D7%99%D7%A0%D7%A1%D7%A7%D7%99%205%2C%20%D7%9B%D7%A4%D7%A8%20%D7%A1%D7%91%D7%90&navigate=yes',
    hasDeliveryNote: '⏳ טרם',
    status: '⏳ בסידור עבודה',
  },
  {
    id: '7',
    orderDate: '2026-09-10 08:53:00',
    orderNumber: '6215430',
    customerId: '612120',
    customerName: 'ל.ה בניה בע"מ',
    warehouse: '🏭 4️⃣(החרש)',
    deliveryAddress: 'לב השכונה 14, הוד השרון',
    itemsText: '1. מק"ט: 12010 | בלוק בטון 10/20/40 | כמות: 10 יח\'\n2. מק"ט: 12204 | בלוק בטון 20/20/40 4 חורים | כמות: 50 יח\'\n3. מק"ט: 11511 | סומסום שק גדול | כמות: 4 שק גד\n4. מק"ט: 18050 | הובלת מנוף הוד השרון | כמות: 1 יח\'\n5. מק"ט: 60006 | משטח בלוקים פקדון | כמות: 1 משטח\n6. מק"ט: 60002 | שק גדול פקדון | כמות: 4 שק גד',
    bigBagsDeposit: '4 בלות',
    palletsDeposit: '1 משטח בלוקים',
    driver: 'חכמת (משאית מרצדס מנוף 615-41-002)',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1tZwW9dQ5t7WvRbXOaV0i9BopQ4edRwHm',
    wazeUrl: 'https://www.waze.com/ul?q=%D7%9C%D7%91%20%D7%94%D7%A9%D7%9B%D7%95%D7%A0%D7%94%2014%2C%20%D7%94%D7%95%D7%93%20%D7%94%D7%A9%D7%A8%D7%95%D7%9F&navigate=yes',
    whatsappUrl: 'https://api.whatsapp.com/send?phone=972505305566&text=%F0%9F%93%A6%20%2A6215430%2A',
    hasDeliveryNote: '⏳ טרם',
    status: '⏳ בסידור עבודה',
    phone: '050-5305566',
  },
  {
    id: '8',
    orderDate: '2026-09-09 11:50:00',
    orderNumber: '6215418',
    customerId: '612108',
    customerName: 'לירן/מוצקין',
    warehouse: '🏭 4️⃣(החרש)',
    deliveryAddress: 'מוצקין 22, רעננה',
    itemsText: '1. מק"ט: 15680 | סיקפלקס FC11 תרמיל לבן SIKA | כמות: 36 יח\'\n2. מק"ט: 65765402 | אזיקונים לבן 7.6/540 100יח | כמות: 10 חב\'\n3. מק"ט: 651400 | מברשת זפת | כמות: 5 יח\'\n4. מק"ט: 9870414 | מברשת ברק "3 | כמות: 5 יח\'\n5. מק"ט: 729020 | מסמרי פלדה 3X50 | כמות: 1 חב\'\n6. מק"ט: 58010 | סקוטש ברייט לבן | כמות: 5 יח\'\n7. מק"ט: 581000 | נייר תעשייתי 1000 מטר | כמות: 1 יח\'\n8. מק"ט: 79210 | קפה טורקי עלית 200 גרם | כמות: 10 יח\'\n9. מק"ט: 10002 | מלט אפור 25 ק"ג | כמות: 40 שק\n10. מק"ט: 9871144 | אקוסטיפיפ 200/100 | כמות: 10 יח\'\n11. מק"ט: 18055 | הובלת מנוף כפר סבא-רעננה | כמות: 1 יח\'\n12. מק"ט: 60060 | משטח סבן פקדון | כמות: 1 משטח',
    bigBagsDeposit: '0',
    palletsDeposit: '1 משטח סבן',
    driver: 'חכמת (משאית מרצדס מנוף 615-41-002)',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1k0erS1PHtlQyn6Lu1E7mn3AHiHNWMzJj',
    wazeUrl: 'https://www.waze.com/ul?q=%D7%9E%D7%95%D7%A6%D7%A7%D7%99%D7%9F%2022%2C%20%D7%A8%D7%A2%D7%A0%D7%A0%D7%94&navigate=yes',
    whatsappUrl: 'https://api.whatsapp.com/send?phone=972508861080&text=%F0%9F%93%A6%20%2A6215418%2A',
    hasDeliveryNote: '⏳ טרם',
    status: '⏳ בסידור עבודה',
  },
  {
    id: '9',
    orderDate: '2026-09-09 08:05:00',
    orderNumber: '6215408',
    customerId: '613431',
    customerName: 'מידן לירן/2006',
    warehouse: '🏭 4️⃣(החרש)',
    deliveryAddress: 'עלי מוהר 8, רעננה',
    itemsText: '1. מק"ט: 10002 | מלט אפור 25 ק"ג | כמות: 80 שק (2,000 ק"ג)\n2. מק"ט: 11501 | חול שק גדול | כמות: 10 שק גד\n3. מק"ט: 11511 | סומסום שק גדול | כמות: 6 שק גד\n4. מק"ט: 18055 | הובלת מנוף כפר סבא-רעננה | כמות: 1 יח\'\n5. מק"ט: 60002 | שק גדול פקדון | כמות: 16 שק גד\n6. מק"ט: 60060 | משטח סבן פקדון | כמות: 2 משטח',
    bigBagsDeposit: '16 בלות',
    palletsDeposit: '2 משטחים',
    driver: 'חכמת (משאית מרצדס מנוף 615-41-002)',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1bGPeMArzA4JwYK4Vqd3c_-4egvVBqKG9',
    wazeUrl: 'https://www.waze.com/ul?q=%D7%A2%D7%9C%D7%99%20%D7%9E%D7%95%D7%94%D7%A8%208%2C%20%D7%A8%D7%A2%D7%A0%D7%A0%D7%94&navigate=yes',
    whatsappUrl: 'https://api.whatsapp.com/send?phone=972508861080&text=%F0%9F%93%A6%20%2A6215408%2A',
    hasDeliveryNote: '⏳ טרם',
    status: '⏳ בסידור עבודה',
  },
  {
    id: '10',
    orderDate: '2026-09-07 10:56:00',
    orderNumber: '6215371',
    customerId: '602115',
    customerName: 'בזלת מזר בע"מ',
    warehouse: '🏭 4️⃣(החרש)',
    deliveryAddress: 'שדה בוקר 8, גבעתיים',
    itemsText: '1. מק"ט: 14075 | טיח גבס MP75 שק 25 ק"ג | כמות: 3 שק\n2. מק"ט: 114260 | לוח גבס כחול 260 ע 12.50 | כמות: 3 יח\'\n3. מק"ט: 14603 | פלסטומר AD603 אפור 25 ק"ג | כמות: 30 שק\n4. מק"ט: 11550 | טיט שק | כמות: 10 שק\n5. מק"ט: 11510 | סומסום שק | כמות: 50 שק\n6. מק"ט: 19108 | סיקה 107 לבן+תוסף 25 ק"ג | כמות: 3 שק\n7. מק"ט: 14233 | מלט לבן 2.5 ק"ג | כמות: 20 שקית\n8. מק"ט: 651400 | מברשת זפת | כמות: 1 יח\'\n9. מק"ט: 818075 | הובלה ללא פריקה רמת גן-גבעתיים | כמות: 1 יח\'',
    bigBagsDeposit: 'ℹ️ פטור (הובלה ללא פריקה)',
    palletsDeposit: 'ℹ️ פטור (הובלה ללא פריקה)',
    driver: 'עלי (משאית איסוזו פתוחה 651-51-701)',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1Ls3TsVuSj3Bim2YG-VD5at3c2TuK8Jmc',
    wazeUrl: 'https://www.waze.com/ul?q=%D7%A9%D7%93%D7%94%20%D7%91%D7%95%D7%A7%D7%A8%208%2C%20%D7%92%D7%91%D7%A2%D7%AA%D7%99%D7%99%D7%9D&navigate=yes',
    whatsappUrl: 'https://api.whatsapp.com/send?phone=972508861080&text=%F0%9F%93%A6%20%2A6215371%2A',
    hasDeliveryNote: '⏳ טרם',
    status: '⏳ בסידור עבודה (חדש)',
  },
  {
    id: '11',
    orderDate: '2026-09-06 13:57:00',
    orderNumber: '6215352',
    customerId: '601335',
    customerName: 'ארגמן איכות הסביבה בע"מ',
    warehouse: '🏭 4️⃣(החרש)',
    deliveryAddress: 'ביאליק 1, הוד השרון (בית כנסת אור דוד)',
    itemsText: '1. מק"ט: 111260 | לוח גבס לבן 260 ע 12.50 | כמות: 18 יח\'\n2. מק"ט: 15092 | פח שפכטל שיטרוק 28 ק"ג | כמות: 1 פח\n3. מק"ט: 76206 | בורג גבס 25 1000 יח\' VERO | כמות: 2 קרטון\n4. מק"ט: 818050 | הובלה ללא פריקה הוד השרון | כמות: 1 יח\'',
    bigBagsDeposit: 'ℹ️ פטור (הובלה ללא פריקה)',
    palletsDeposit: 'ℹ️ פטור (הובלה ללא פריקה)',
    driver: 'עלי (משאית איסוזו 651-51-701)',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1HI2uwnqhoaZoUxVnd2EXomGHKPU1kLK4',
    wazeUrl: 'https://www.waze.com/ul?q=%D7%91%D7%99%D7%90%D7%9C%D7%99%D7%A7%201%2C%20%D7%94%D7%95%D7%93%20%D7%94%D7%A9%D7%A8%D7%95%D7%9F&navigate=yes',
    whatsappUrl: 'https://api.whatsapp.com/send?phone=972508861080&text=%F0%9F%93%A6%20%2A6215352%2A',
    hasDeliveryNote: '⏳ טרם',
    status: '⏳ בסידור עבודה',
  },
  {
    id: '12',
    orderDate: '2026-08-20 10:18:59',
    orderNumber: '6215028',
    customerId: '602100',
    customerName: 'שטיכמוס / שיבת ציון',
    warehouse: '🏭 4️⃣(החרש)',
    deliveryAddress: 'שיבת ציון 12, הרצליה',
    itemsText: '1. מק"ט: 11511 | סומסום שק גדול | כמות: 4\n2. מק"ט: 11501 | חול שק גדול | כמות: 2\n3. מק"ט: 10002 | מלט אפור 25 ק"ג | כמות: 20\n4. מק"ט: 18060 | הובלת מנוף הרצליה-רמה"ש | כמות: 1\n5. מק"ט: 60002 | שק גדול פקדון | כמות: 6\n6. מק"ט: 60060 | משטח סבן פקדון | כמות: 1',
    bigBagsDeposit: '6 בלות',
    palletsDeposit: '1 משטח',
    driver: 'חכמת (מרצדס מנוף 615-41-002)',
    wazeUrl: 'https://waze.com/ul?q=%D7%A9%D7%99%D7%91%D7%AA%20%D7%A6%D7%99%D7%95%D7%9F%2012%2C%20%D7%94%D7%A8%D7%A6%D7%9C%D7%99%D7%94&navigate=yes',
    whatsappUrl: 'https://api.whatsapp.com/send?phone=972508861080&text=%F0%9F%93%A6%20%D7%94%D7%96%D7%9E%D7%A0%D7%94%3A%206215028',
    hasDeliveryNote: '✅ כן',
    status: 'סופק במלואו',
    phone: '050-8861080',
    voiceStatus: '✅ שוגר קולית',
  },
  {
    id: '13',
    orderDate: '2026-08-14 11:50:00',
    orderNumber: '6214899',
    customerId: '602568',
    customerName: 'בוקטוס שלום-ביס אלי כהן',
    warehouse: '🏭 4️⃣(החרש)',
    deliveryAddress: 'עזרא 52, רמת השרון',
    itemsText: '1. מק"ט: 11551 | טיט שק גדול | כמות: 15\n2. מק"ט: 10002 | מלט אפור | כמות: 50\n3. מק"ט: 14075 | טיח גבס | כמות: 15\n4. מק"ט: 24250 | רשת טיח | כמות: 2\n5. מק"ט: 71780 | פינה אפס | כמות: 30\n6. מק"ט: 18055 | מנוף | כמות: 1',
    bigBagsDeposit: '15 בלות',
    palletsDeposit: '1 משטח',
    driver: 'חכמת (מרצדס מנוף 615-41-002)',
    wazeUrl: 'https://www.waze.com/ul?q=%D7%A2%D7%96%D7%A8%D7%90%2052%2C%20%D7%A8%D7%9E%D7%AA%20%D7%94%D7%A9%D7%A8%D7%95%D7%9F&navigate=yes',
    whatsappUrl: 'https://api.whatsapp.com/send?phone=972508861080&text=%F0%9F%93%A6%206214899',
    hasDeliveryNote: '✅ כן',
    status: 'סופק במלואו',
  },
  {
    id: '14',
    orderDate: '2026-08-14 11:34:00',
    orderNumber: '6214906',
    customerId: '612108',
    customerName: 'לירן/מוצקין',
    warehouse: '🏭 4️⃣(החרש)',
    deliveryAddress: 'מוצקין 22, רעננה',
    itemsText: '1. מק"ט: 10002 | מלט אפור 25 ק"ג | כמות: 40\n2. מק"ט: 42702 | סכין יפני | כמות: 4\n3. מק"ט: 41543 | להבים | כמות: 1\n4. מק"ט: 818108 | הובלה ללא פריקה | כמות: 1',
    bigBagsDeposit: 'פטור',
    palletsDeposit: 'פטור',
    driver: 'עלי (משאית איסוזו 651-51-701)',
    wazeUrl: 'https://www.waze.com/ul?q=%D7%9E%D7%95%D7%A6%D7%A7%D7%99%D7%9F%2022%2C%20%D7%A8%D7%A2%D7%A0%D7%A0%D7%94&navigate=yes',
    whatsappUrl: 'https://api.whatsapp.com/send?phone=972508861080&text=%F0%9F%93%A6%206214906',
    hasDeliveryNote: '✅ כן',
    status: 'סופק במלואו',
  }
];

export interface DepositCalculationItem {
  name: string;
  quantity: number;
  sku?: string;
  isNoUnload?: boolean; // הובלה ללא פריקה (מק"ט 818050-818118)
  hasCustomerForklift?: boolean; // לקוח מצויד במלגזה ופורק עצמאית מעלי (חובה לחייב פקדונות מלאים)
}

/**
 * מנוע חישוב פקדונות מחמיר (1:1 וספי משטחים) ללא סטיות
 */
export function calculateDeposits(
  items: DepositCalculationItem[],
  isNoUnloadDelivery: boolean = false,
  hasCustomerForklift: boolean = false
) {
  // פטור מפקדונות כאשר ההובלה היא ללא פריקה - למעט לקוח שמצויד במלגזה ופורק סחורה עומדת כגון קורט צבי הולנדר
  if (isNoUnloadDelivery && !hasCustomerForklift) {
    return {
      isExempt: true,
      bigBags: 0,
      pallets: 0,
      blockPallets: 0,
      totalDepositCostBeforeVat: 0,
      summary: '🛡️ פטור מלא מפקדונות בלות ומשטחים (הובלה ללא פריקה, מק"טים 818050–818118)',
    };
  }

  let bigBags = 0;
  let pallets = 0;
  let blockPallets = 0;
  let breakdown: string[] = [];

  for (const item of items) {
    const n = item.name.toLowerCase();
    const sku = item.sku || '';
    const qty = Number(item.quantity) || 0;
    if (qty <= 0) continue;

    // 1. שק גדול / בלה (מק"ט 60002) - יחס 1:1 מדויק
    // חול (11501), סומסום (11511), טיט (11551), מצע (11540), חצץ (11506), חמרה (11570), שליכט (11521)
    if (
      sku === '60002' ||
      ['11501', '11511', '11551', '11540', '11506', '11507', '11570', '11521'].includes(sku) ||
      n.includes('בלה') ||
      n.includes('שק גדול')
    ) {
      bigBags += qty;
      breakdown.push(`${qty} בלות [1:1 מק"ט 60002]`);
    }
    // 2. משטח סבן / עץ (מק"ט 60060) - ספי משטחים מדויקים
    // מלט אפור 25 ק"ג (מק"ט 10002): החל מ-40 שקים (משטח מלא = 40 שק)
    else if (sku === '10002' || (n.includes('מלט') && !n.includes('טיח') && !n.includes('לבן'))) {
      if (qty >= 40) {
        const p = Math.ceil(qty / 40);
        pallets += p;
        breakdown.push(`${p} משטח מלט סבן (${qty} שקים, סף 40)`);
      }
    }
    // סומסום / טיט בשקים 25 ק"ג (11510 / 11550): החל מ-70 שקים (משטח מלא = 70 שק)
    else if (sku === '11510' || sku === '11550') {
      if (qty >= 70) {
        const p = Math.ceil(qty / 70);
        pallets += p;
        breakdown.push(`${p} משטח סומסום/טיט שקים (${qty} שקים, סף 70)`);
      }
    }
    // טיח חוץ 710, טיח ממ"ד, דבקים וריצופית (15710, 15770, 15181, 14603, 14604): החל מ-20 שקים
    else if (
      ['15710', '15770', '15181', '14603', '14604', '15800', '15634'].includes(sku) ||
      n.includes('טיח') || n.includes('דבק') || n.includes('פלסטומר') || n.includes('ריצופית')
    ) {
      if (qty >= 20) {
        const p = Math.ceil(qty / 40);
        pallets += p;
        breakdown.push(`${p} משטח טיח/דבקים (${qty} שקים, סף 20)`);
      }
    }
    // 3. משטח בלוקים (מק"ט 60006):
    // בלוק 10 (12010): 150 יח' למשטח | בלוק 20 (12204) ובלוקים אחרים: 75 יח' למשטח
    else if (n.includes('בלוק') || sku.startsWith('12')) {
      if (n.includes('10') || sku === '12010') {
        const bp = Math.ceil(qty / 150);
        blockPallets += bp;
        breakdown.push(`${bp} משטח בלוק 10 (${qty} יח', 150 למשטח)`);
      } else {
        const bp = Math.ceil(qty / 75);
        blockPallets += bp;
        breakdown.push(`${bp} משטח בלוק 20 (${qty} יח', 75 למשטח)`);
      }
    }
  }

  const totalDepositCostBeforeVat = (bigBags + pallets + blockPallets) * 35;

  return {
    isExempt: false,
    bigBags,
    pallets,
    blockPallets,
    totalDepositCostBeforeVat,
    breakdown,
    summary: `🛡️ פקדונות: ${bigBags} בלות (60002) | ${pallets} משטחי סבן (60060)${
      blockPallets > 0 ? ` | ${blockPallets} משטחי בלוקים (60006)` : ''
    } (עלות פקדונות לפני מע"מ: ${totalDepositCostBeforeVat} ₪)`,
  };
}

// מחירון בסיס להצעות מחיר (לפני מע"מ) - נוסחת סיכום: מוצרים + פקדונות (כולל בלוקים) + הובלה + 18% מע"מ
export function calculateQuote(params: {
  productsTotalBeforeVat: number;
  bigBagsCount: number;
  palletsCount: number;
  blockPalletsCount?: number;
  deliveryCostBeforeVat: number;
  isNoUnload?: boolean;
}) {
  const totalPallets = params.palletsCount + (params.blockPalletsCount || 0);
  const depositBeforeVat = params.isNoUnload ? 0 : (params.bigBagsCount + totalPallets) * 35;
  const subtotal = params.productsTotalBeforeVat + depositBeforeVat + params.deliveryCostBeforeVat;
  const vat = Math.round(subtotal * 0.18 * 100) / 100;
  const grandTotal = Math.round((subtotal + vat) * 100) / 100;

  return {
    productsTotalBeforeVat: params.productsTotalBeforeVat,
    depositBeforeVat,
    deliveryCostBeforeVat: params.deliveryCostBeforeVat,
    subtotalBeforeVat: subtotal,
    vat,
    grandTotal,
    vatRate: 0.18,
  };
}

