import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  FileBarChart2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MapPinned,
  ScrollText,
  Settings,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
} from "lucide-react";

import { Logo } from "@/components/mna/Logo";
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
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useStaffProfile } from "@/hooks/useStaffProfile";

const MAIN = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Pré-Líderes", url: "/pre-lideres", icon: Users },
  { title: "Avaliações", url: "/avaliacoes", icon: ClipboardList },
  { title: "Presenças", url: "/presencas", icon: CalendarCheck },
  { title: "Formadores", url: "/formadores", icon: GraduationCap },
  { title: "Disciplinas", url: "/disciplinas", icon: BookOpen },
  { title: "Relatórios", url: "/relatorios", icon: FileBarChart2 },
] as const;

const GOVERNANCE = [
  { title: "Regiões e Igrejas", url: "/regioes", icon: MapPinned },
  { title: "Especialidades", url: "/especialidades", icon: Sparkles },
  { title: "Administradores", url: "/administradores", icon: ShieldCheck },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
  { title: "Auditoria", url: "/auditoria", icon: ScrollText },
] as const;

const ACCOUNT = [{ title: "A Minha Conta", url: "/conta", icon: UserCog }] as const;


export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: staff } = useStaffProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="px-3 py-4">
        <Logo tone="light" size={38} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gestão</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MAIN.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {staff?.isSuper && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {GOVERNANCE.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Conta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ACCOUNT.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>


      <SidebarFooter className="gap-2 p-3">
        <div className="rounded-lg bg-sidebar-accent/60 px-3 py-2 text-xs text-sidebar-foreground/80 group-data-[collapsible=icon]:hidden">
          <p className="font-medium text-sidebar-accent-foreground">
            {staff?.profile?.full_name || staff?.profile?.username}
          </p>
          <p className="capitalize">{staff?.roles[0]?.replace(/_/g, " ")}</p>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} tooltip="Sair">
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
