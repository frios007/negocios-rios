import { createFileRoute } from "@tanstack/react-router";
import { getTenantKey } from "@/lib/query/tenant-key";
import { useBusinessContext } from "@/features/auth/hooks/useBusinessContext";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useClients } from "@/features/clients/hooks/useClients";
import { useSales } from "@/features/sales/hooks/useSales";
import { useFinanceSummary, useMonthlyTrend } from "@/features/finance/hooks/useFinance";
import { productsQueryOptions } from "@/features/products/api/products.queries";
import { clientsQueryOptions } from "@/features/clients/api/clients.queries";
import { salesQueryOptions } from "@/features/sales/api/sales.queries";
import { FinanceTrendChart } from "@/features/finance/components/finance-trend-chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  Package,
  Users,
  TrendingUp,
  Stethoscope,
  PawPrint,
  ShoppingCart,
  CreditCard,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";

export const Route = createFileRoute("/_auth/_appLayout/dashboard")({
  component: DashboardPage,
  loader: async ({ context: { queryClient } }) => {
    const tenantKey = getTenantKey();
    await Promise.all([
      queryClient.ensureQueryData(productsQueryOptions(tenantKey, 1, 500)),
      queryClient.ensureQueryData(clientsQueryOptions(tenantKey, 1, 500)),
      queryClient.ensureQueryData(salesQueryOptions(tenantKey, 1, 500)),
    ]);
  },
});

function formatCurrency(value: number) {
  return `C$ ${value.toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { isVet, activeBU, activeRole } = useBusinessContext();
  const isAdminOrOwner = activeRole === "ADMIN" || activeRole === "OWNER";

  const today = new Date().toISOString().split("T")[0];
  const monthStart = `${today.slice(0, 7)}-01`;

  // ─── Data Hooks ─────────────────────────────────────
  const { data: productsData } = useProducts(1, 500);
  const { data: clientsData } = useClients(1, 500);
  const { data: salesData } = useSales(1, 500);

  // Finance data — only for admin/owner
  const { data: todaySummary, isLoading: todayLoading } = useFinanceSummary(today, today);
  const { data: monthSummary, isLoading: monthLoading } = useFinanceSummary(monthStart, today);
  const { data: trendData, isLoading: trendLoading } = useMonthlyTrend(6);

  // ─── Derived Stats ──────────────────────────────────
  const products = productsData.data ?? [];
  const clients = clientsData.data ?? [];
  const allSales = salesData.data ?? [];

  const totalProducts = products.length;
  const activeProducts = products.filter((p: any) => p.isActive).length;
  const lowStockCount = products.filter(
    (p: any) => p.productType === "GOODS" && p.isActive && p.stockQuantity <= (p.minimumStock ?? 5),
  ).length;
  const totalClients = clients.length;

  // Today's sales count (for all users)
  const todaySales = allSales.filter((s: any) => {
    const saleDate = new Date(s.createdAt).toISOString().split("T")[0];
    return saleDate === today && s.status !== "VOIDED";
  });
  const todaySalesCount = todaySales.length;
  const todaySalesTotal = todaySales.reduce(
    (sum: number, s: any) => sum + Number(s.totalAmount),
    0,
  );

  // Pending credit across clients
  const totalPendingCredit = clients.reduce(
    (sum: number, c: any) => sum + Number(c.balanceDue ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* ─── Welcome Header ────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          ¡Hola, {user?.firstName}!
        </h1>
        <p className="text-muted-foreground">
          Resumen de {activeBU?.businessUnit?.name ?? "tu negocio"} para hoy.
        </p>
      </div>

      {/* ─── Quick Stats (All Users) ───────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Ventas del Día"
          value={formatCurrency(todaySalesTotal)}
          description={`${todaySalesCount} venta${todaySalesCount !== 1 ? "s" : ""} registrada${todaySalesCount !== 1 ? "s" : ""}`}
          icon={ShoppingCart}
          color="text-blue-600"
          bgColor="bg-blue-500/10"
        />
        <StatCard
          title="Productos"
          value={String(activeProducts)}
          description={`${totalProducts} totales, ${activeProducts} activos`}
          icon={Package}
          color="text-violet-600"
          bgColor="bg-violet-500/10"
        />
        <StatCard
          title="Clientes"
          value={String(totalClients)}
          description="Total registrados"
          icon={Users}
          color="text-indigo-600"
          bgColor="bg-indigo-500/10"
        />
        {lowStockCount > 0 ? (
          <StatCard
            title="Stock Bajo"
            value={String(lowStockCount)}
            description="Productos bajo mínimo"
            icon={AlertTriangle}
            color="text-amber-600"
            bgColor="bg-amber-500/10"
          />
        ) : (
          <StatCard
            title="Inventario"
            value="OK"
            description="Sin alertas de stock"
            icon={Package}
            color="text-green-600"
            bgColor="bg-green-500/10"
          />
        )}
      </div>

      {/* ─── Vet-specific Cards ────────────────── */}
      {isVet && (
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            title="Consultas Hoy"
            value="—"
            description="Sin consultas registradas"
            icon={Stethoscope}
            color="text-teal-600"
            bgColor="bg-teal-500/10"
          />
          <StatCard
            title="Pacientes Activos"
            value="—"
            description="Total registrados"
            icon={PawPrint}
            color="text-pink-600"
            bgColor="bg-pink-500/10"
          />
        </div>
      )}

      {/* ─── Admin/Owner Financial Overview ──────── */}
      {isAdminOrOwner && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Ingresos del Día"
              value={
                todayLoading
                  ? "..."
                  : formatCurrency(todaySummary?.income ?? 0)
              }
              description={
                todaySummary
                  ? `${todaySummary.salesCount} venta${todaySummary.salesCount !== 1 ? "s" : ""}`
                  : "Cargando..."
              }
              icon={DollarSign}
              color="text-green-600"
              bgColor="bg-green-500/10"
            />
            <StatCard
              title="Ingresos del Mes"
              value={
                monthLoading
                  ? "..."
                  : formatCurrency(monthSummary?.income ?? 0)
              }
              description={
                monthSummary
                  ? `Ganancia neta: ${formatCurrency(monthSummary.netProfit)}`
                  : "Cargando..."
              }
              icon={TrendingUp}
              color="text-emerald-600"
              bgColor="bg-emerald-500/10"
              highlight
            />
            <StatCard
              title="Crédito Pendiente"
              value={formatCurrency(totalPendingCredit)}
              description="Saldo por cobrar"
              icon={CreditCard}
              color="text-amber-600"
              bgColor="bg-amber-500/10"
            />
          </div>

          {/* ─── Monthly Trend Chart ──────────────── */}
          <FinanceTrendChart data={trendData} isLoading={trendLoading} />
        </>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color = "text-foreground",
  bgColor = "bg-muted",
  highlight = false,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  bgColor?: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-emerald-500/30 shadow-emerald-500/5 shadow-sm" : ""}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`rounded-md p-2 ${bgColor}`}>
          <Icon className={`size-4 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          {highlight && <ArrowUpRight className="size-3" />}
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
