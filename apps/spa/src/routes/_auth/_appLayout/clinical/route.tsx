import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getActiveBusinessUnit } from "@/features/auth/hooks/useBusinessContext";

export const Route = createFileRoute("/_auth/_appLayout/clinical")({
  beforeLoad: () => {
    const activeBU = getActiveBusinessUnit();
    if (activeBU?.businessUnit?.type !== "VETERINARY") {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: () => <Outlet />,
});
