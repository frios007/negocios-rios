import { useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import { PosCheckoutSheet } from "@/features/sales/components/pos-checkout-sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";

function PendingComponent() {
  return (
    <div className="flex h-48 items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export const Route = createFileRoute("/_auth/_appLayout")({
  component: AppLayout,
  pendingComponent: PendingComponent,
});

function AppLayout() {
  const [posOpen, setPosOpen] = useState(false);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4!" />
            {/* TODO: Breadcrumbs */}
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </SidebarInset>

        {/* ─── Floating Action Button — Quick Sale ─── */}
        <Button
          size="lg"
          className="fixed bottom-6 right-6 z-50 size-14 rounded-full shadow-lg hover:shadow-xl transition-shadow md:size-14"
          onClick={() => setPosOpen(true)}
        >
          <ShoppingCart className="size-6" />
          <span className="sr-only">Nueva Venta</span>
        </Button>

        <PosCheckoutSheet open={posOpen} onOpenChange={setPosOpen} />
      </SidebarProvider>
    </TooltipProvider>
  );
}

