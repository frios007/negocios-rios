export interface Client {
  id: string;
  firstName: string;
  lastName: string | null;
  documentId: string | null;
  phoneNumber: string | null;
  creditLimit: string;
  balanceDue: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientPayload {
  firstName: string;
  lastName?: string;
  documentId?: string;
  phoneNumber?: string;
  creditLimit: number;
}

export interface UpdateClientPayload {
  firstName?: string;
  lastName?: string;
  documentId?: string;
  phoneNumber?: string;
  creditLimit?: number;
}

export interface ClientOption {
  id: string;
  firstName: string;
  lastName: string | null;
  creditLimit: string;
  balanceDue: string;
}
