import { useLocation, Link, type LinkProps } from "@tanstack/react-router";
import { useBusinessContext } from "@/features/auth/hooks/useBusinessContext";
import { BusinessUnitSwitcher } from "@/components/business-unit-switcher";
import { SidebarNavUser } from "@/components/sidebar-nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Pill,
  ClipboardList,
  CircleDollarSign,
  Users,
  Tags,
  Truck,
  UserCog,
  Landmark,
} from "lucide-react";
import type { ComponentProps, ComponentType, ReactNode } from "react";

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const { activeRole } = useBusinessContext();
  const pathname = useLocation({ select: (l) => l.pathname });
  const isAdminOrOwner = activeRole === "ADMIN" || activeRole === "OWNER";

  // Activo también en subrutas (p. ej. /products/123)
  const isActive = (to: string) =>
    pathname === to || pathname.startsWith(`${to}/`);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="px-3 pt-4 pb-2">
        <BusinessUnitSwitcher />
      </SidebarHeader>

      <SidebarContent className="gap-4 px-1.5 pt-2">
        <NavGroup label="General">
          <NavItem
            to="/dashboard"
            label="Panel Principal"
            icon={LayoutDashboard}
            isActive={isActive("/dashboard")}
          />
          <NavItem
            to="/products"
            label="Productos"
            icon={Pill}
            isActive={isActive("/products")}
          />
          <NavItem
            to="/inventory"
            label="Inventario"
            icon={ClipboardList}
            isActive={isActive("/inventory")}
          />
          <NavItem
            to="/sales"
            label="Ventas"
            icon={CircleDollarSign}
            isActive={isActive("/sales")}
          />
          <NavItem
            to="/customers"
            label="Clientes"
            icon={Users}
            isActive={isActive("/customers")}
          />
        </NavGroup>

        <NavGroup label="Catálogo">
          <NavItem
            to="/categories"
            label="Categorías"
            icon={Tags}
            isActive={isActive("/categories")}
          />
          <NavItem
            to="/suppliers"
            label="Proveedores"
            icon={Truck}
            isActive={isActive("/suppliers")}
          />
        </NavGroup>

        {isAdminOrOwner && (
          <NavGroup label="Admin">
            <NavItem
              to="/admin/users"
              label="Usuarios"
              icon={UserCog}
              isActive={isActive("/admin/users")}
            />
            <NavItem
              to="/finances"
              label="Finanzas"
              icon={Landmark}
              isActive={isActive("/finances")}
            />
          </NavGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-3 py-3">
        <SidebarNavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

function NavGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <SidebarGroup className="py-0">
      <SidebarGroupLabel className="h-7 px-2.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground/80">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">{children}</SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  isActive,
}: {
  to: LinkProps["to"];
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  isActive: boolean;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={label}
        className={[
          "h-9 rounded-[9px] px-2.5 font-medium text-sidebar-foreground",
          "hover:bg-secondary hover:text-foreground",
          // Activo: verde botica sólido, ícono en verde claro
          "data-[active=true]:bg-sidebar-primary data-[active=true]:font-semibold data-[active=true]:text-sidebar-primary-foreground",
          "data-[active=true]:hover:bg-sidebar-primary data-[active=true]:hover:text-sidebar-primary-foreground",
          "data-[active=true]:[&>svg]:text-[#cfe6d8] dark:data-[active=true]:[&>svg]:text-sidebar-primary-foreground",
          "data-[active=true]:shadow-[inset_0_-2px_0_rgb(0_0_0/0.12)]",
        ].join(" ")}
      >
        <Link to={to}>
          <Icon className="size-[17px]" strokeWidth={1.8} />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
