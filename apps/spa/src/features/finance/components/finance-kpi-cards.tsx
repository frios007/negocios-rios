import type { FinanceSummary } from "../types/finance.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
} from "lucide-react";

function formatCurrency(value: number) {
  return `C$ ${value.toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface FinanceKpiCardsProps {
  summary: FinanceSummary | undefined;
  isLoading: boolean;
}

export function FinanceKpiCards({ summary, isLoading }: FinanceKpiCardsProps) {
  const cards = [
    {
      title: "Ingresos",
      value: summary ? formatCurrency(summary.income) : "—",
      subtitle: summary ? `${summary.salesCount} ventas` : "",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Gastos",
      value: summary ? formatCurrency(summary.expenses) : "—",
      subtitle: summary ? `${summary.expensesCount} registros` : "",
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Ganancia Neta",
      value: summary ? formatCurrency(summary.netProfit) : "—",
      subtitle: summary
        ? summary.netProfit >= 0
          ? "Balance positivo"
          : "Balance negativo"
        : "",
      icon: DollarSign,
      color: summary && summary.netProfit >= 0 ? "text-emerald-600" : "text-red-600",
      bgColor:
        summary && summary.netProfit >= 0
          ? "bg-emerald-500/10"
          : "bg-red-500/10",
    },
    {
      title: "Crédito Pendiente",
      value: summary ? formatCurrency(summary.pendingCredit) : "—",
      subtitle: "Saldo por cobrar",
      icon: CreditCard,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`rounded-md p-2 ${card.bgColor}`}>
              <card.icon className={`size-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            ) : (
              <>
                <p className={`text-2xl font-bold tabular-nums ${card.color}`}>
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {card.subtitle}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
