import type { ComponentType, ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getTenantKey } from "@/lib/query/tenant-key";
import { useBusinessContext } from "@/features/auth/hooks/useBusinessContext";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useClients } from "@/features/clients/hooks/useClients";
import { useSales } from "@/features/sales/hooks/useSales";
import {
  useFinanceSummary,
  useMonthlyTrend,
} from "@/features/finance/hooks/useFinance";
import { productsQueryOptions } from "@/features/products/api/products.queries";
import { clientsQueryOptions } from "@/features/clients/api/clients.queries";
import { salesQueryOptions } from "@/features/sales/api/sales.queries";
import { FinanceTrendChart } from "@/features/finance/components/finance-trend-chart";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Pill,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  Users,
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

function formatLongDate(date: Date) {
  const s = date.toLocaleDateString("es-NI", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { activeBU, activeRole } = useBusinessContext();
  const isAdminOrOwner = activeRole === "ADMIN" || activeRole === "OWNER";

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const monthStart = `${today.slice(0, 7)}-01`;
  const monthName = now.toLocaleDateString("es-NI", {
    month: "long",
    year: "numeric",
  });

  // ─── Data Hooks ─────────────────────────────────────
  const { data: productsData } = useProducts(1, 500);
  const { data: clientsData } = useClients(1, 500);
  const { data: salesData } = useSales(1, 500);

  // Finance data — only for admin/owner
  const { data: todaySummary, isLoading: todayLoading } = useFinanceSummary(
    today,
    today,
  );
  const { data: monthSummary, isLoading: monthLoading } = useFinanceSummary(
    monthStart,
    today,
  );
  const { data: trendData, isLoading: trendLoading } = useMonthlyTrend(6);

  // ─── Derived Stats ──────────────────────────────────
  const products = productsData.data ?? [];
  const clients = clientsData.data ?? [];
  const allSales = salesData.data ?? [];

  const totalProducts = products.length;
  const activeProducts = products.filter((p: any) => p.isActive).length;
  const lowStockCount = products.filter(
    (p: any) =>
      p.productType === "GOODS" &&
      p.isActive &&
      p.stockQuantity <= (p.minimumStock ?? 5),
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

  // Net profit share of monthly income
  const monthIncome = monthSummary?.income ?? 0;
  const monthNet = monthSummary?.netProfit ?? 0;
  const netPercent = monthIncome > 0 ? (monthNet / monthIncome) * 100 : 0;

  const plural = (n: number, word: string) =>
    `${n} ${word}${n !== 1 ? "s" : ""}`;
  const branchName = activeBU?.businessUnit?.name ?? "tu sucursal";

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-7 pb-24">
      {/* ─── Encabezado ─────────────────────────── */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-brass">
            <span className="h-px w-[18px] bg-brass" />
            {branchName}
          </p>
          <h1 className="font-serif text-[34px] font-bold leading-none tracking-tight text-balance sm:text-[40px]">
            ¡Hola, {user?.firstName}!
          </h1>
          <p className="mt-1.5 text-[15px] text-muted-foreground">
            Resumen de {branchName} para hoy.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-[13px] text-muted-foreground shadow-xs">
          <CalendarDays className="size-4 text-brass" strokeWidth={1.8} />
          {formatLongDate(now)}
        </div>
      </header>

      {/* ─── Hoy + Este mes ─────────────────────── */}
      <div className={cn("grid gap-7", isAdminOrOwner && "xl:grid-cols-2")}>
        <Section title="Hoy" hint="Movimiento del día">
          <div className="grid gap-3.5 sm:grid-cols-2">
            {isAdminOrOwner && (
              <StatCard
                title="Ingresos del Día"
                value={
                  todayLoading
                    ? "..."
                    : formatCurrency(todaySummary?.income ?? 0)
                }
                description={
                  todaySummary ? (
                    <>
                      <b className="text-foreground">
                        {todaySummary.salesCount}
                      </b>{" "}
                      {todaySummary.salesCount !== 1 ? "ventas" : "venta"}
                    </>
                  ) : (
                    "Cargando..."
                  )
                }
                icon={CircleDollarSign}
                tone="success"
              />
            )}
            <StatCard
              title="Ventas del Día"
              value={formatCurrency(todaySalesTotal)}
              description={
                <>
                  <b className="text-foreground">{todaySalesCount}</b>{" "}
                  {todaySalesCount !== 1
                    ? "ventas registradas"
                    : "venta registrada"}
                </>
              }
              icon={ShoppingCart}
              tone="info"
            />
          </div>
        </Section>

        {isAdminOrOwner && (
          <Section
            title="Este mes"
            hint={monthName.charAt(0).toUpperCase() + monthName.slice(1)}
          >
            <div className="grid gap-3.5 sm:grid-cols-2">
              <StatCard
                title="Ingresos del Mes"
                value={monthLoading ? "..." : formatCurrency(monthIncome)}
                icon={TrendingUp}
                featured
                meter={
                  monthSummary
                    ? {
                        percent: netPercent,
                        label: (
                          <>
                            Ganancia neta{" "}
                            <b className="figures font-serif text-[17px] text-white">
                              {formatCurrency(monthNet)}
                            </b>
                          </>
                        ),
                      }
                    : undefined
                }
                description={monthSummary ? undefined : "Cargando..."}
              />
              <StatCard
                title="Crédito Pendiente"
                value={formatCurrency(totalPendingCredit)}
                description="Saldo por cobrar"
                icon={CreditCard}
                tone="brass"
              />
            </div>
          </Section>
        )}
      </div>

      {/* ─── Operación ──────────────────────────── */}
      <Section title="Operación" hint="Catálogo, clientes y existencias">
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          <OpCard
            to="/products"
            title="Productos"
            value={activeProducts}
            description={`${totalProducts} totales, ${activeProducts} activos`}
            icon={Pill}
            tone="info"
          />
          <OpCard
            to="/customers"
            title="Clientes"
            value={totalClients}
            description="Total registrados"
            icon={Users}
            tone="primary"
          />
          {lowStockCount > 0 ? (
            <OpCard
              to="/inventory"
              title="Stock Bajo"
              value={
                <span className="flex items-center gap-2.5">
                  {lowStockCount}
                  <StatusPill tone="warning">Revisar</StatusPill>
                </span>
              }
              description={plural(lowStockCount, "producto") + " bajo mínimo"}
              icon={AlertTriangle}
              tone="warning"
            />
          ) : (
            <OpCard
              to="/inventory"
              title="Inventario"
              value={<StatusPill tone="success">OK</StatusPill>}
              description="Sin alertas de stock"
              icon={ShieldCheck}
              tone="success"
            />
          )}
        </div>
      </Section>

      {/* ─── Ingresos vs Gastos ─────────────────── */}
      {isAdminOrOwner && (
        <FinanceTrendChart data={trendData} isLoading={trendLoading} />
      )}
    </div>
  );
}

/* ================================================================
   Componentes de presentación
   ================================================================ */

type Tone = "success" | "info" | "brass" | "warning" | "expense" | "primary";

const toneClasses: Record<Tone, string> = {
  success: "bg-success/12 text-success",
  info: "bg-info/12 text-info",
  brass: "bg-brass/14 text-brass",
  warning: "bg-warning/14 text-warning",
  expense: "bg-expense/12 text-expense",
  primary: "bg-primary/10 text-primary",
};

type IconType = ComponentType<{ className?: string; strokeWidth?: number }>;

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="whitespace-nowrap font-serif text-[22px] font-bold leading-none">
          {title}
        </h2>
        {hint && (
          <span className="truncate text-[12.5px] text-muted-foreground">
            {hint}
          </span>
        )}
        <span className="h-px min-w-6 flex-1 bg-gradient-to-r from-rule-strong to-transparent" />
      </div>
      {children}
    </section>
  );
}

function StatusPill({
  tone,
  children,
}: {
  tone: "success" | "warning";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-xs font-bold tracking-wide",
        toneClasses[tone],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

/** Separa "C$" del monto para darle menos peso visual. */
function Money({ value, mutedClass }: { value: string; mutedClass: string }) {
  if (!value.startsWith("C$")) return <>{value}</>;
  return (
    <>
      <small
        className={cn(
          "mr-1 text-[0.55em] font-semibold tracking-normal",
          mutedClass,
        )}
      >
        C$
      </small>
      {value.replace(/^C\$\s?/, "")}
    </>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "primary",
  featured = false,
  meter,
}: {
  title: string;
  value: string;
  description?: ReactNode;
  icon: IconType;
  tone?: Tone;
  featured?: boolean;
  meter?: { percent: number; label: ReactNode };
}) {
  return (
    <article
      data-featured={featured}
      className={cn(
        "apothecary-label relative flex min-w-0 flex-col gap-2.5 rounded-xl border px-5 pb-4 pt-[18px]",
        "[&>*]:relative [&>*]:z-[1]",
        featured
          ? "border-[#24543f] bg-[#24543f] text-white dark:border-[#1f4a37] dark:bg-[#1f4a37]"
          : "bg-card text-card-foreground shadow-sm",
      )}
    >
      <div className="flex items-center justify-between gap-2.5">
        <span
          className={cn(
            "text-[11px] font-bold uppercase tracking-[0.14em]",
            featured ? "text-[#cfe6d8]" : "text-muted-foreground",
          )}
        >
          {title}
        </span>
        <span
          className={cn(
            "grid size-[34px] shrink-0 place-items-center rounded-[10px]",
            featured ? "bg-white/10 text-[#f1dca7]" : toneClasses[tone],
          )}
        >
          <Icon className="size-[18px]" strokeWidth={1.8} />
        </span>
      </div>

      <p className="figures font-serif text-[38px] font-bold leading-none tracking-tight sm:text-[40px]">
        <Money
          value={value}
          mutedClass={featured ? "text-[#a9cdb9]" : "text-muted-foreground"}
        />
      </p>

      {meter && (
        <>
          <div
            className="flex h-[7px] overflow-hidden rounded-full bg-white/15"
            role="img"
            aria-label={`Ganancia neta: ${meter.percent.toFixed(1)}% de los ingresos`}
          >
            <span
              className="block h-full rounded-full bg-[#e3c47e]"
              style={{ width: `${Math.min(100, Math.max(0, meter.percent))}%` }}
            />
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2.5 text-[13px] text-[#cfe6d8]">
            <span>{meter.label}</span>
            <span className="figures">{meter.percent.toFixed(1)}%</span>
          </div>
        </>
      )}

      {description && (
        <div
          className={cn(
            "mt-auto flex items-center gap-2 border-t pt-2.5 text-[13px]",
            featured
              ? "border-white/15 text-[#cfe6d8]"
              : "text-muted-foreground",
          )}
        >
          {!featured && (
            <span
              className={cn(
                "size-[7px] shrink-0 rounded-full bg-current",
                toneClasses[tone].split(" ")[1],
              )}
            />
          )}
          <span>{description}</span>
        </div>
      )}
    </article>
  );
}

function OpCard({
  to,
  title,
  value,
  description,
  icon: Icon,
  tone,
}: {
  to: "/products" | "/customers" | "/inventory";
  title: string;
  value: ReactNode;
  description: string;
  icon: IconType;
  tone: Tone;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-xl border bg-card px-[18px] py-4 text-card-foreground shadow-sm transition-[border-color,box-shadow] hover:border-brass hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring"
    >
      <span
        className={cn(
          "grid size-[46px] shrink-0 place-items-center rounded-xl",
          toneClasses[tone],
        )}
      >
        <Icon className="size-[22px]" strokeWidth={1.8} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </span>
        <span className="figures font-serif text-[32px] font-bold leading-tight">
          {value}
        </span>
        <span className="truncate text-[12.5px] text-muted-foreground">
          {description}
        </span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
