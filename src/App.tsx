import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Clients from "./pages/Clients";
import Tools from "./pages/Tools";
import Domains from "./pages/Domains";
import Campaigns from "./pages/Campaigns";
import Guarantees from "./pages/Guarantees";
import TenantsPage from "./pages/TenantsPage";
import AutomationPage from "./pages/AutomationPage";
import RenewalsPage from "./pages/RenewalsPage";
import ReportsPage from "./pages/ReportsPage";
import ProjectsPage from "./pages/ProjectsPage";
import AdminPanelPage from "./pages/AdminPanel";
import SettingsPageComponent from "./pages/SettingsPage";
import CalendarPage from "./pages/CalendarPage";
import EmployeesPage from "./pages/EmployeesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoadingAuth = useAuthStore((s) => s.isLoadingAuth);
  if (isLoadingAuth) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function RoleGate({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user || !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/tenants" element={<ProtectedRoute><TenantsPage /></ProtectedRoute>} />
            <Route path="/domains" element={<ProtectedRoute><Domains /></ProtectedRoute>} />
            <Route path="/tools" element={<ProtectedRoute><Tools /></ProtectedRoute>} />
            <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
            <Route path="/guarantees" element={<ProtectedRoute><Guarantees /></ProtectedRoute>} />
            <Route path="/automation" element={<ProtectedRoute><AutomationPage /></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute><RoleGate roles={['super_admin', 'ceo']}><EmployeesPage /></RoleGate></ProtectedRoute>} />
            <Route path="/renewals" element={<ProtectedRoute><RenewalsPage /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><RoleGate roles={['super_admin', 'ceo']}><ReportsPage /></RoleGate></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><RoleGate roles={['super_admin']}><AdminPanelPage /></RoleGate></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPageComponent /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
