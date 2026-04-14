export type PaymentMethod = "CASH" | "CARD" | "TRANSFER" | "CREDIT";
export type PaymentStatus = "PAID" | "PENDING" | "PARTIAL";
export type SaleStatus = "COMPLETED" | "VOIDED";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  TRANSFER: "Transferencia",
  CREDIT: "Crédito",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PAID: "Pagado",
  PENDING: "Pendiente",
  PARTIAL: "Parcial",
};

export const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
  COMPLETED: "Completada",
  VOIDED: "Anulada",
};

export interface SaleDetail {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  lineDiscount: string;
  product?: { id: string; name: string; productType: string };
}

export interface SalePayment {
  id: string;
  amount: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string | null;
  createdAt: string;
}

export interface Sale {
  id: string;
  client: {
    id: string;
    firstName: string;
    lastName: string | null;
  } | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  subTotal: string;
  discountAmount: string;
  totalAmount: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: SaleStatus;
  dueDate: string | null;
  createdAt: string;
}

export interface SaleWithDetails extends Sale {
  details: SaleDetail[];
  payments: SalePayment[];
}

export interface CreateSalePayload {
  clientId?: string | null;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  details: { productId: string; quantity: number }[];
}

export interface CartItem {
  productId: string;
  name: string;
  productType: "GOODS" | "SERVICE";
  unitPrice: number;
  quantity: number;
}
