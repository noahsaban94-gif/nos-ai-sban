export interface SabanOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  customerId?: string;
  customerName: string;
  warehouse: string; // "🏭 4️⃣(החרש)" | "🏟️ 1️⃣(התלמיד)"
  deliveryAddress: string;
  itemsText: string;
  bigBagsDeposit: string;
  palletsDeposit: string;
  driver: string;
  driveFolderUrl?: string;
  wazeUrl?: string;
  whatsappUrl?: string;
  hasDeliveryNote: string;
  status: string;
  phone?: string;
  voiceStatus?: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'rami' | 'noa';
  text: string;
  timestamp: string;
  htmlContent?: string;
  actionCard?: {
    type: 'order' | 'morning_report' | 'driver_status' | 'deposit_calc' | 'quote' | 'waze_route' | 'chart_analysis';
    data?: any;
  };
}

export interface DriverInfo {
  name: string;
  role: string;
  truck: string;
  plateNumber: string;
  phone: string;
  activeOrdersCount: number;
}

export interface OperationalMemoryItem {
  id: string;
  category: 'נהגים' | 'לקוחות ואתרים' | 'הנהלה וחשבונות' | 'כללי';
  text: string;
  timestamp: string;
}
