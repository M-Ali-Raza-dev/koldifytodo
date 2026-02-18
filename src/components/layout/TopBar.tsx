import { useAuthStore } from '@/stores/authStore';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, Search, Sun, Moon, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TopBar() {
  const { user, logout } = useAuthStore();
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('light');
  };

  const roleLabel = {
    super_admin: 'Super Admin',
    ceo: 'CEO',
    employee: 'Employee',
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm px-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="hidden md:flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm text-muted-foreground">
          <Search className="h-3.5 w-3.5" />
          <span>Search...</span>
          <kbd className="ml-4 text-[10px] font-mono bg-background px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Workspace pill */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          <div className="h-2 w-2 rounded-full bg-success" />
          Koldify Core
        </div>

        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary" />
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={toggleTheme}>
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 gap-2 px-2 text-sm">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <span className="hidden md:inline text-foreground">{user?.full_name}</span>
              <span className="hidden md:inline text-[10px] text-muted-foreground">({roleLabel[user?.role || 'employee']})</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
