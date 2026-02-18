import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard, CheckSquare, Users, Server, Globe,
  Wrench, Megaphone, ShieldCheck, Bot, CalendarClock,
  BarChart3, Settings, Crown, FolderKanban, Calendar,
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from '@/components/ui/sidebar';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard, roles: ['super_admin', 'ceo', 'employee'] },
  { title: 'Tasks', url: '/tasks', icon: CheckSquare, roles: ['super_admin', 'ceo', 'employee'] },
  { title: 'Calendar', url: '/calendar', icon: Calendar, roles: ['super_admin', 'ceo', 'employee'] },
  { title: 'Projects', url: '/projects', icon: FolderKanban, roles: ['super_admin', 'ceo', 'employee'] },
  { title: 'Clients', url: '/clients', icon: Users, roles: ['super_admin', 'ceo', 'employee'] },
  { title: 'Employees', url: '/employees', icon: Users, roles: ['super_admin', 'ceo'] },
  { title: 'Tenants & Inboxes', url: '/tenants', icon: Server, roles: ['super_admin', 'ceo', 'employee'] },
  { title: 'Domains & DNS', url: '/domains', icon: Globe, roles: ['super_admin', 'ceo', 'employee'] },
  { title: 'Tools & Billing', url: '/tools', icon: Wrench, roles: ['super_admin', 'ceo', 'employee'] },
  { title: 'Campaigns', url: '/campaigns', icon: Megaphone, roles: ['super_admin', 'ceo', 'employee'] },
  { title: 'Guarantees / SLA', url: '/guarantees', icon: ShieldCheck, roles: ['super_admin', 'ceo', 'employee'] },
  { title: 'Automation & Logs', url: '/automation', icon: Bot, roles: ['super_admin', 'ceo', 'employee'] },
  { title: 'Renewals Calendar', url: '/renewals', icon: CalendarClock, roles: ['super_admin', 'ceo'] },
  { title: 'Reports', url: '/reports', icon: BarChart3, roles: ['super_admin', 'ceo'] },
  { title: 'Super Admin', url: '/admin', icon: Crown, roles: ['super_admin'] },
  { title: 'Settings', url: '/settings', icon: Settings, roles: ['super_admin', 'ceo', 'employee'] },
];

export function AppSidebar() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const role = user?.role || 'employee';

  const filtered = navItems.filter((item) => item.roles.includes(role));

  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <div className="flex h-14 items-center border-b border-border px-4">
        <div>
          <span className="text-base font-bold tracking-tight text-gradient">Koldify</span>
          <span className="block text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Control</span>
        </div>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/60">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filtered.map((item) => {
                const isActive = location.pathname === item.url || (item.url !== '/' && location.pathname.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === '/'}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }`}
                        activeClassName="bg-primary/10 text-primary"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.title}</span>
                        {isActive && (
                          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
