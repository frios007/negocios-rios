import { createFileRoute } from "@tanstack/react-router";
import { getActiveRole } from "@/features/auth/hooks/useBusinessContext";
import { redirect } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/_appLayout/admin")({
  beforeLoad: () => {
    const activeRole = getActiveRole();
    if (activeRole !== "ADMIN" && activeRole !== "OWNER") {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: () => <Outlet />,
});
