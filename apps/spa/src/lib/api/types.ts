// ─── API Envelope Types ────────────────────────────────────────
// These mirror the TransformInterceptor on the backend

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

// ─── Auth Types ────────────────────────────────────────────────

export type BusinessUnitType = "VETERINARY" | "PHARMACY";

export interface BusinessUnitAccess {
  businessUnitId: string;
  role: "OWNER" | "ADMIN" | "VET" | "PHARMACIST" | "CASHIER";
  businessUnit?: {
    id: string;
    name: string;
    slug: string;
    type: BusinessUnitType;
  };
}

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
}

export interface UserProfile extends User {
  phoneNumber: string | null;
  businessUnits: BusinessUnitAccess[];
}

export interface LoginResponse {
  user: UserProfile;
  accessToken: string;
}

export interface RefreshResponse {
  user: UserProfile;
  accessToken: string;
}
