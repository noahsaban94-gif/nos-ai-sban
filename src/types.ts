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
}

export interface SheetDiscrepancy {
  orderNumber: string;
  customerName: string;
  issue: string;
  severity: 'high' | 'medium' | 'info';
  status: string;
  hasDeliveryNote: string;
}

export interface SheetMutationResult {
  action: 'update_status' | 'reassign_driver' | 'add_order' | 'update_note' | 'toggle_delivery_note';
  order: SabanOrder;
  previousValue?: string;
  newValue?: string;
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
  tags?: string[];
}
