import type { MonthlyTrendItem } from "../types/finance.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface FinanceTrendChartProps {
  data: MonthlyTrendItem[] | undefined;
  isLoading: boolean;
}

function formatMonth(yyyyMM: string) {
  const [year, month] = yyyyMM.split("-");
  const months = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];
  return `${months[parseInt(month, 10) - 1]} ${year.slice(2)}`;
}

function formatCurrency(value: number) {
  return `C$ ${value.toLocaleString("es-NI", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function FinanceTrendChart({
  data,
  isLoading,
}: FinanceTrendChartProps) {
  const chartData = (data ?? []).map((item) => ({
    ...item,
    label: formatMonth(item.month),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ingresos vs Gastos</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <div className="h-full w-full animate-pulse rounded bg-muted" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Sin datos para mostrar.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(v) => `C$ ${(v / 1000).toFixed(0)}k`}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={65}
              />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value)),
                  name === "income" ? "Ingresos" : "Gastos",
                ]}
                labelFormatter={(label) => label}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
              <Legend
                formatter={(value) =>
                  value === "income" ? "Ingresos" : "Gastos"
                }
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="hsl(142, 71%, 45%)"
                strokeWidth={2}
                fill="url(#fillIncome)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="hsl(0, 84%, 60%)"
                strokeWidth={2}
                fill="url(#fillExpenses)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
