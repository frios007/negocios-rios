import { useAuthStore } from "@/features/auth/store/auth.store";
import { useBusinessContext } from "@/features/auth/hooks/useBusinessContext";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown, Pill, Store, Check } from "lucide-react";

export function BusinessUnitSwitcher() {
  const { isMobile } = useSidebar();
  const { activeBU, canSwitchBU, businessUnits } = useBusinessContext();
  const setActiveBusinessUnit = useAuthStore((s) => s.setActiveBusinessUnit);

  if (!activeBU) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Pill className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeBU.businessUnit?.name ?? "Sin sucursal"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Sucursal
                </span>
              </div>
              {canSwitchBU && <ChevronsUpDown className="ml-auto" />}
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          {canSwitchBU && (
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Sucursales
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {businessUnits.map((bu) => {
                const isActive = bu.businessUnitId === activeBU.businessUnitId;

                return (
                  <DropdownMenuItem
                    key={bu.businessUnitId}
                    onClick={() => setActiveBusinessUnit(bu.businessUnitId)}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      <Store className="size-4 shrink-0" />
                    </div>
                    <span className="flex-1">{bu.businessUnit?.name}</span>
                    {isActive && <Check className="size-4 text-primary" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
