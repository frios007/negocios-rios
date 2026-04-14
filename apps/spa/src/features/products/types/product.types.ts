export interface Product {
  id: string;
  productType: "GOODS" | "SERVICE";
  name: string;
  barcode: string | null;
  description: string | null;
  costPrice: string;
  profitMargin: string;
  unitPrice: string;
  stockQuantity: number;
  isActive: boolean;
  isSample: boolean;
  isRegulated: boolean;
  category: { id: string; name: string } | null;
  supplier: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  name: string;
  barcode?: string;
  description?: string;
  categoryId?: string;
  supplierId?: string;
  costPrice: number;
  profitMargin: number;
  productType?: "GOODS" | "SERVICE";
  isRegulated: boolean;
  isSample?: boolean;
}

export interface UpdateProductPayload {
  name?: string;
  barcode?: string;
  description?: string;
  categoryId?: string | null;
  supplierId?: string | null;
  costPrice?: number;
  profitMargin?: number;
  isRegulated?: boolean;
  isSample?: boolean;
  isActive?: boolean;
}

export interface OptionItem {
  id: string;
  name: string;
}
