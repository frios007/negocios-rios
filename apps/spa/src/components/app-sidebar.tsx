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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  DollarSign,
  Users,
  PawPrint,
  Stethoscope,
  BedDouble,
  Tags,
  Truck,
  Landmark,
} from "lucide-react";
import type { ComponentProps } from "react";

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const { isVet, activeRole } = useBusinessContext();
  const location = useLocation({ select: (l) => l.pathname });
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <BusinessUnitSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem
                to="/dashboard"
                label="Panel Principal"
                icon={LayoutDashboard}
                isActive={location === "/dashboard"}
              />
              <NavItem
                to="/products"
                label="Productos"
                icon={Package}
                isActive={location === "/products"}
              />
              <NavItem
                to="/inventory"
                label="Inventario"
                icon={ClipboardList}
                isActive={location === "/inventory"}
              />
              <NavItem
                to="/sales"
                label="Ventas"
                icon={DollarSign}
                isActive={location === "/sales"}
              />
              <NavItem
                to="/customers"
                label="Clientes"
                icon={Users}
                isActive={location === "/customers"}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Catálogo</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem
                to="/categories"
                label="Categorías"
                icon={Tags}
                isActive={location === "/categories"}
              />
              <NavItem
                to="/suppliers"
                label="Proveedores"
                icon={Truck}
                isActive={location === "/suppliers"}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ─── Clínica (Vet only) ──────────────── */}
        {isVet && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Clínica</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavItem
                    to="/clinical/patients"
                    label="Pacientes"
                    icon={PawPrint}
                    isActive={location === "/clinical/patients"}
                  />
                  <NavItem
                    to="/clinical/records"
                    label="Consultas"
                    icon={Stethoscope}
                    isActive={location === "/clinical/records"}
                  />
                  <NavItem
                    to="/clinical/hospitalizations"
                    label="Hospitalización"
                    icon={BedDouble}
                    isActive={location === "/clinical/hospitalizations"}
                  />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {(activeRole === "ADMIN" || activeRole === "OWNER") && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavItem
                    to="/admin/users"
                    label="Usuarios"
                    icon={Users}
                    isActive={location === "/admin/users"}
                  />
                  <NavItem
                    to="/finances"
                    label="Finanzas"
                    icon={Landmark}
                    isActive={location === "/finances"}
                  />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarNavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
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
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
        <Link to={to}>
          <Icon />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
