import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { logoutApi } from "@/features/auth/api/auth.api";
import { ProfileSheet } from "@/features/auth/components/profile-sheet";
import { ChangePasswordDialog } from "@/features/auth/components/change-password-dialog";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronsUpDown, LogOut, KeyRound, UserCircle } from "lucide-react";

function UserAvatar({ initials }: { initials: string }) {
  return (
    <Avatar className="size-8 shrink-0 rounded-full ring-1 ring-brass ring-offset-2 ring-offset-sidebar">
      <AvatarFallback className="rounded-full bg-primary font-serif text-[14px] font-bold text-primary-foreground">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export function SidebarNavUser() {
  const { isMobile } = useSidebar();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  if (!user) return null;

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  const fullName = `${user.firstName} ${user.lastName}`;

  async function handleLogout() {
    try {
      await logoutApi();
    } catch {
      // Even if API logout fails, clear local state
    }
    logout();
    navigate({ to: "/login" });
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="gap-2.5 rounded-[10px] hover:bg-secondary data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <UserAvatar initials={initials} />
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-[13.5px] font-semibold text-foreground">
                    {fullName}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    @{user.username}
                  </span>
                </div>
                <ChevronsUpDown
                  className="ml-auto size-4 text-muted-foreground"
                  strokeWidth={1.8}
                />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl p-1.5"
              side={isMobile ? "top" : "right"}
              align="end"
              sideOffset={8}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2.5 px-1.5 py-2 text-left">
                  <UserAvatar initials={initials} />
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate font-serif text-[16px] font-bold">
                      {fullName}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      @{user.username}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2.5 rounded-md"
                onClick={() => setProfileOpen(true)}
              >
                <UserCircle
                  className="size-4 text-muted-foreground"
                  strokeWidth={1.8}
                />
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2.5 rounded-md"
                onClick={() => setPasswordOpen(true)}
              >
                <KeyRound
                  className="size-4 text-muted-foreground"
                  strokeWidth={1.8}
                />
                Cambiar Contraseña
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2.5 rounded-md text-destructive focus:bg-destructive/10 focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="size-4" strokeWidth={1.8} />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />
      <ChangePasswordDialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
      />
    </>
  );
}
