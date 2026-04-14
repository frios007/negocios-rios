import { useEffect, useState } from "react";
import type { Expense, ExpensePaymentMethod, CreateExpensePayload } from "../types/finance.types";
import { EXPENSE_PAYMENT_METHOD_LABELS } from "../types/finance.types";
import { useExpenseCategories, useCreateExpense, useUpdateExpense } from "../hooks/useFinance";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
}

export function ExpenseFormDialog({
  open,
  onOpenChange,
  expense,
}: ExpenseFormDialogProps) {
  const isEdit = !!expense;
  const activeBU = useAuthStore((s) => s.activeBusinessUnitId);
  const { data: categories } = useExpenseCategories(activeBU ?? undefined);
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string>("__none__");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [paymentMethod, setPaymentMethod] = useState<ExpensePaymentMethod>("CASH");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      if (expense) {
        setDescription(expense.description);
        setAmount(expense.amount);
        setCategoryId(expense.categoryId ?? "__none__");
        setExpenseDate(expense.expenseDate);
        setPaymentMethod(expense.paymentMethod);
        setReferenceNumber(expense.referenceNumber ?? "");
        setNotes(expense.notes ?? "");
      } else {
        setDescription("");
        setAmount("");
        setCategoryId("__none__");
        setExpenseDate(new Date().toISOString().split("T")[0]);
        setPaymentMethod("CASH");
        setReferenceNumber("");
        setNotes("");
      }
    }
  }, [open, expense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateExpensePayload = {
      description,
      amount: parseFloat(amount),
      categoryId: categoryId === "__none__" ? undefined : categoryId,
      expenseDate,
      paymentMethod,
      referenceNumber: referenceNumber || undefined,
      notes: notes || undefined,
    };

    if (isEdit) {
      updateMutation.mutate(
        { id: expense!.id, payload },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Gasto" : "Registrar Gasto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="description">Descripción *</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Pago de luz del mes"
              required
              minLength={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="amount">Monto (C$) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max="99999999.99"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="expenseDate">Fecha *</Label>
              <Input
                id="expenseDate"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>Categoría</Label>
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sin categoría</SelectItem>
                  {(categories ?? []).map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Método de pago</Label>
              <Select
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as ExpensePaymentMethod)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EXPENSE_PAYMENT_METHOD_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="referenceNumber">Nº Referencia</Label>
            <Input
              id="referenceNumber"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Opcional"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Guardando..."
                : isEdit
                  ? "Actualizar"
                  : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
