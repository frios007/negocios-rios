import { useAuthStore } from "../store/auth.store";
import { refreshTokenApi } from "../api/auth.api";

/**
 * Attempts to restore an authenticated session.
 *
 * 1. Checks the Zustand store (fast path — already logged in this tab)
 * 2. If empty, tries a silent refresh via the HttpOnly cookie
 * 3. On success, populates the store and returns true
 * 4. On failure, clears the store and returns false
 *
 * This is NOT a hook — it runs outside React in `beforeLoad`.
 */
export async function tryRestoreSession(): Promise<boolean> {
  const store = useAuthStore.getState();

  if (store.isAuthenticated) {
    return true;
  }

  try {
    const result = await refreshTokenApi();

    store.setAuth(
      result.user,
      result.accessToken,
      result.user.businessUnits,
    );

    return true;
  } catch {
    store.logout();
    return false;
  }
}
