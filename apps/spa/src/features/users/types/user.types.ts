export type UserRole = 'OWNER' | 'ADMIN' | 'VET' | 'PHARMACIST' | 'CASHIER';

export interface ManagedUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  isActive: boolean;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface ManagedUserDetail {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  businessUnits: {
    businessUnitId: string;
    role: UserRole;
    businessUnit: {
      id: string;
      name: string;
      slug: string;
      type: 'VETERINARY' | 'PHARMACY';
    };
  }[];
}

export interface CreateUserPayload {
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface AssignUserPayload {
  businessUnitId: string;
  role: UserRole;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  OWNER: 'Dueño',
  ADMIN: 'Administrador',
  VET: 'Veterinario',
  PHARMACIST: 'Farmacéutico',
  CASHIER: 'Cajero',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  OWNER: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  ADMIN: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  VET: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  PHARMACIST: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  CASHIER: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
};
