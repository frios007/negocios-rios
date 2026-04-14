import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { tryRestoreSession } from "@/features/auth/lib/session";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async () => {
    const isAuthenticated = await tryRestoreSession();
    if (!isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return <Outlet />;
}
