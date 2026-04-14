import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { User, BusinessUnitAccess } from "@/lib/api/types";
import { getQueryClient } from "@/lib/query/query-client";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  activeBusinessUnitId: string | null;
  businessUnits: BusinessUnitAccess[];

  isAuthenticated: boolean;

  setAuth: (
    user: User,
    accessToken: string,
    businessUnits: BusinessUnitAccess[],
  ) => void;
  setAccessToken: (accessToken: string) => void;
  setActiveBusinessUnit: (id: string) => void;
  logout: () => void;
}

const initialState = {
  user: null,
  accessToken: null,
  activeBusinessUnitId: null,
  businessUnits: [],
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      ...initialState,

      setAuth: (user, accessToken, businessUnits) =>
        set(
          {
            user,
            accessToken,
            businessUnits,
            isAuthenticated: true,
            activeBusinessUnitId: businessUnits[0]?.businessUnitId ?? null,
          },
          false,
          "auth/setAuth",
        ),

      setAccessToken: (accessToken) =>
        set({ accessToken }, false, "auth/setAccessToken"),

      setActiveBusinessUnit: (id) => {
        set({ activeBusinessUnitId: id }, false, "auth/setActiveBusinessUnit");
        getQueryClient().removeQueries();
        getQueryClient().invalidateQueries();
      },

      logout: () => {
        set({ ...initialState }, false, "auth/logout");
        getQueryClient().removeQueries();
      },
    }),
    { name: "AuthStore" },
  ),
);
