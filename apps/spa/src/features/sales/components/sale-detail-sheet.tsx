import type { Sale } from "../types/sale.types";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  SALE_STATUS_LABELS,
} from "../types/sale.types";
import { useSaleDetail } from "../hooks/useSales";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";

interface SaleDetailSheetProps {
  sale: Sale | null;
  onClose: () => void;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm">{children}</span>
    </div>
  );
}

function formatCurrency(value: string | number) {
  return `C$ ${Number(value).toFixed(2)}`;
}

export function SaleDetailSheet({ sale, onClose }: SaleDetailSheetProps) {
  const { data: detail, isLoading } = useSaleDetail(sale?.id ?? null);

  return (
    <Sheet
      open={sale !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalle de Venta</SheetTitle>
          <SheetDescription>
            Información completa de la transacción.
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : detail ? (
          <div className="px-6 pb-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Cliente">
                {detail.client
                  ? `${detail.client.firstName}${detail.client.lastName ? ` ${detail.client.lastName}` : ""}`
                  : "Sin cliente"}
              </Field>
              <Field label="Vendedor">
                {detail.user.firstName} {detail.user.lastName}
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field label="Estado">
                <Badge
                  variant="outline"
                  className={
                    detail.status === "COMPLETED"
                      ? "border-green-500 text-green-600"
                      : "border-red-500 text-red-600"
                  }
                >
                  {SALE_STATUS_LABELS[detail.status]}
                </Badge>
              </Field>
              <Field label="Método de pago">
                {PAYMENT_METHOD_LABELS[detail.paymentMethod]}
              </Field>
              <Field label="Estado de pago">
                <Badge
                  variant="outline"
                  className={
                    detail.paymentStatus === "PAID"
                      ? "border-green-500 text-green-600"
                      : detail.paymentStatus === "PARTIAL"
                        ? "border-yellow-500 text-yellow-600"
                        : "border-red-500 text-red-600"
                  }
                >
                  {PAYMENT_STATUS_LABELS[detail.paymentStatus]}
                </Badge>
              </Field>
            </div>

            <Field label="Fecha">
              {new Date(detail.createdAt).toLocaleDateString("es-NI", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Field>

            <Separator />

            <div>
              <h4 className="mb-3 text-sm font-semibold">Artículos</h4>
              <div className="space-y-2">
                {detail.details.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {item.product?.name ?? item.productId}
                      </span>
                      {item.product?.productType === "SERVICE" && (
                        <Badge variant="secondary" className="text-xs">
                          Servicio
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 tabular-nums">
                      <span className="text-muted-foreground">
                        ×{item.quantity}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(
                          Number(item.unitPrice) * item.quantity,
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">
                  {formatCurrency(detail.subTotal)}
                </span>
              </div>
              {Number(detail.discountAmount) > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Descuento</span>
                  <span className="tabular-nums">
                    -{formatCurrency(detail.discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span className="tabular-nums">
                  {formatCurrency(detail.totalAmount)}
                </span>
              </div>
            </div>

            {detail.payments.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="mb-3 text-sm font-semibold">
                    Historial de Pagos
                  </h4>
                  <div className="space-y-2">
                    {detail.payments.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                      >
                        <div>
                          <span className="font-medium">
                            {formatCurrency(p.amount)}
                          </span>
                          <span className="ml-2 text-muted-foreground">
                            {PAYMENT_METHOD_LABELS[p.paymentMethod]}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(p.createdAt).toLocaleDateString("es-NI")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
