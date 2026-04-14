import { createFileRoute, redirect } from "@tanstack/react-router";
import { tryRestoreSession } from "@/features/auth/lib/session";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const isAuthenticated = await tryRestoreSession();
    throw redirect({ to: isAuthenticated ? "/dashboard" : "/login" });
  },
});
