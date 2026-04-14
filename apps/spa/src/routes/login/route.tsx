import { createFileRoute, redirect } from "@tanstack/react-router";
import LoginForm from "@/features/auth/components/LoginForm";
import loginIllustration from "@/assets/login/login.svg";
import { tryRestoreSession } from "@/features/auth/lib/session";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const isAuthenticated = await tryRestoreSession();
    if (isAuthenticated) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="flex min-h-svh">
      {/* ─── Left Panel: Illustration ─────────────────────────── */}
      <div className="hidden w-2/5 flex-col items-center justify-center gap-8 bg-muted p-12 lg:flex">
        <img
          src={loginIllustration}
          alt="Ilustración de inicio de sesión"
          className="w-full max-w-md"
        />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">
            Gestión inteligente para tu negocio
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Administra tus ventas, inventario y clientes en un solo lugar.
          </p>
        </div>
      </div>

      {/* ─── Right Panel: Login Form ──────────────────────────── */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-3/5">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo Placeholder */}
          <div className="flex justify-center">
            {/* TODO: Replace with logo */}
            <span className="text-2xl font-bold text-primary">
              Negocios Rios
            </span>
          </div>

          {/* Welcome Text */}
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              ¡Bienvenido de nuevo!
            </h1>
            <p className="text-sm text-muted-foreground">
              Inicia sesión para acceder a tu cuenta
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
