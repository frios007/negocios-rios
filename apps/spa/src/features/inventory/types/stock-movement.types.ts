export type MovementType =
  | "PURCHASE_IN"
  | "SALE_OUT"
  | "ADJUSTMENT_IN"
  | "ADJUSTMENT_OUT";

export interface StockMovement {
  id: string;
  product: { id: string; name: string };
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  type: MovementType;
  quantity: number;
  batchNumber: string | null;
  expirationDate: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateStockMovementPayload {
  productId: string;
  type: Exclude<MovementType, "SALE_OUT">;
  quantity: number;
  batchNumber?: string;
  expirationDate?: string;
  notes?: string;
}

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  PURCHASE_IN: "Compra",
  SALE_OUT: "Venta",
  ADJUSTMENT_IN: "Ajuste entrada",
  ADJUSTMENT_OUT: "Ajuste salida",
};
