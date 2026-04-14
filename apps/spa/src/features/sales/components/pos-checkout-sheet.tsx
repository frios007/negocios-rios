import { useState, useMemo } from "react";
import type { CartItem, PaymentMethod } from "../types/sale.types";
import { PAYMENT_METHOD_LABELS } from "../types/sale.types";
import { useCreateSale } from "../hooks/useSales";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useClientOptions } from "@/features/clients/hooks/useClients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Loader2,
  Plus,
  Minus,
  Trash2,
  Search,
  ShoppingCart,
} from "lucide-react";

interface PosCheckoutSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PosCheckoutSheet({
  open,
  onOpenChange,
}: PosCheckoutSheetProps) {
  const createSale = useCreateSale();
  const { data: productsData } = useProducts(1, 500);
  const { data: clients } = useClientOptions();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [clientId, setClientId] = useState<string>("");
  const [amountPaid, setAmountPaid] = useState("");

  const products = productsData?.data ?? [];

  const filtered = useMemo(() => {
    if (!search.trim()) return [];
    const term = search.toLowerCase();
    return products
      .filter(
        (p) =>
          p.isActive &&
          (p.name.toLowerCase().includes(term) ||
            p.barcode?.toLowerCase().includes(term)),
      )
      .slice(0, 8);
  }, [search, products]);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  function addToCart(product: (typeof products)[number]) {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          productType: (product as any).productType ?? "GOODS",
          unitPrice: Number(product.unitPrice),
          quantity: 1,
        },
      ];
    });
    setSearch("");
  }

  function updateQuantity(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) =>
          i.productId === productId
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }

  function removeItem(productId: string) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  function resetForm() {
    setCart([]);
    setSearch("");
    setPaymentMethod("CASH");
    setClientId("");
    setAmountPaid("");
  }

  function handleSubmit() {
    let paid: number;
    if (paymentMethod === "CREDIT") {
      // For credit: empty field means C$ 0.00 (full credit)
      paid = amountPaid ? parseFloat(amountPaid) : 0;
    } else {
      // For other methods: always pay the full total
      paid = cartTotal;
    }

    createSale.mutate(
      {
        clientId: clientId || null,
        paymentMethod,
        amountPaid: paid,
        details: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        onSuccess: () => {
          resetForm();
          onOpenChange(false);
        },
      },
    );
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  }

  const showAmountPaidInput = paymentMethod === "CREDIT";

  // Derive selected client's credit info
  const selectedClient = clients?.find((c) => c.id === clientId);
  const clientHasCredit =
    selectedClient && Number(selectedClient.creditLimit) > 0;
  const creditDisabled = !clientId || !clientHasCredit;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg overflow-hidden">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="size-5" />
            Nueva Venta
          </SheetTitle>
          <SheetDescription>
            Agrega productos y servicios al carrito.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden px-6 pb-6">
          {/* ─── Product Search ─── */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar producto o servicio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
            {filtered.length > 0 && (
              <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-popover p-1 shadow-md">
                {filtered.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                    onClick={() => addToCart(product)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{product.name}</span>
                      {(product as any).productType === "SERVICE" && (
                        <Badge variant="secondary" className="text-xs">
                          Servicio
                        </Badge>
                      )}
                    </div>
                    <span className="tabular-nums text-muted-foreground">
                      C$ {Number(product.unitPrice).toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Cart ─── */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {cart.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                El carrito está vacío.
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {item.name}
                      </span>
                      {item.productType === "SERVICE" && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          Servicio
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      C$ {item.unitPrice.toFixed(2)} c/u
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7"
                      onClick={() => updateQuantity(item.productId, -1)}
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="w-8 text-center text-sm tabular-nums font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7"
                      onClick={() => updateQuantity(item.productId, 1)}
                    >
                      <Plus className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive"
                      onClick={() => removeItem(item.productId)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                  <span className="ml-3 w-20 text-right text-sm font-medium tabular-nums">
                    C$ {(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>

          <Separator />

          {/* ─── Payment Config ─── */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Cliente (opcional)</Label>
                <Select
                  value={clientId || "__none__"}
                  onValueChange={(v) => {
                    const newClientId = v === "__none__" ? "" : v;
                    setClientId(newClientId);
                    // Reset CREDIT to CASH if client is removed or has no credit
                    if (paymentMethod === "CREDIT") {
                      const newClient = clients?.find((c) => c.id === newClientId);
                      if (!newClientId || !newClient || Number(newClient.creditLimit) <= 0) {
                        setPaymentMethod("CASH");
                      }
                    }
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Sin cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sin cliente</SelectItem>
                    {clients?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.firstName}
                        {c.lastName ? ` ${c.lastName}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Método de pago</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PAYMENT_METHOD_LABELS).map(
                      ([value, label]) => (
                        <SelectItem
                          key={value}
                          value={value}
                          disabled={value === "CREDIT" && creditDisabled}
                        >
                          {label}
                          {value === "CREDIT" && !clientId && (
                            <span className="ml-1 text-muted-foreground">
                              (requiere cliente)
                            </span>
                          )}
                          {value === "CREDIT" &&
                            clientId &&
                            !clientHasCredit && (
                              <span className="ml-1 text-muted-foreground">
                                (sin límite)
                              </span>
                            )}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {showAmountPaidInput && (
              <div className="grid gap-1.5">
                <Label className="text-xs">
                  Monto pagado (dejar vacío para C$ 0.00 — crédito total)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="h-8"
                />
              </div>
            )}

            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span className="tabular-nums">C$ {cartTotal.toFixed(2)}</span>
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={cart.length === 0 || createSale.isPending}
              onClick={handleSubmit}
            >
              {createSale.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <ShoppingCart className="mr-2 size-4" />
              )}
              Completar Venta
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
