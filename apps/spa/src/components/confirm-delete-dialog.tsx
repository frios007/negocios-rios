import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  variant?: "destructive" | "default";
}

/**
 * Reusable confirmation dialog for destructive actions.
 * All text defaults to Spanish.
 */
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  title = "¿Estás seguro?",
  description = "Esta acción no se puede deshacer. El registro será eliminado permanentemente.",
  confirmLabel = "Eliminar",
  variant = "destructive",
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isPending}
            className={
              variant === "destructive"
                ? "bg-destructive text-white hover:bg-destructive/90"
                : ""
            }
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
