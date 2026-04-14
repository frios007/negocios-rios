export interface Supplier {
  id: string;
  name: string;
  phoneNumber: string | null;
  email: string | null;
  businessUnitId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierPayload {
  name: string;
  phoneNumber?: string;
  email?: string;
}

export interface UpdateSupplierPayload {
  name?: string;
  phoneNumber?: string;
  email?: string;
}
