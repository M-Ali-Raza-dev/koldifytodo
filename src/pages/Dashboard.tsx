import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { dashboardKPIs, mrrTrendData, leadsMetricsData, mockClients, mockTasks } from '@/stores/mockData';
import {
  DollarSign, TrendingUp, Users, Target, CalendarCheck, Activity,
  Flame, Server, AlertTriangle, ChevronRight,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';

// Animated counter hook
function useCounter(end: number, duration = 1200, decimals = 0) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const start = 0;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Number((start + (end - start) * eased).toFixed(decimals)));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [end, duration, decimals]);

  return count;
}

interface KPICardProps {
  title: string;
  value: string;
  suffix?: string;
  icon: React.ElementType;
  delay: number;
  trend?: string;
  trendUp?: boolean;
}

function KPICard({ title, value, suffix, icon: Icon, delay, trend, trendUp }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.08, ease: 'easeOut' }}
      className="rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-colors duration-300"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{title}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight text-foreground">
        {value}{suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
      </div>
      {trend && (
        <p className={`mt-1 text-[11px] font-medium ${trendUp ? 'text-success' : 'text-destructive'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </p>
      )}
    </motion.div>
  );
}

const statusColors: Record<string, string> = {
  safe: 'bg-success/10 text-success',
  at_risk: 'bg-warning/10 text-warning pulse-glow',
  critical: 'bg-destructive/10 text-destructive pulse-glow',
  met: 'bg-info/10 text-info',
};

const Dashboard = () => {
  const user = useAuthStore((s) => s.user);
  const isCEO = user?.role === 'ceo' || user?.role === 'super_admin';
  const kpis = dashboardKPIs;

  const mrr = useCounter(kpis.totalMRR, 1400);
  const expenses = useCounter(kpis.monthlyExpenses, 1200);
  const margin = useCounter(kpis.grossMargin, 1000, 1);
  const clients = useCounter(kpis.activeClients, 800);
  const leads = useCounter(kpis.leadsThisMonth, 1000);
  const meetings = useCounter(kpis.meetingsThisMonth, 900);
  const deliverability = useCounter(kpis.avgDeliverability, 1100, 1);
  const utilization = useCounter(kpis.tenantUtilization, 1000);

  const overdueTasks = mockTasks.filter((t) => t.status !== 'done' && new Date(t.due_date) < new Date());
  const atRiskClients = mockClients.filter((c) => c.guarantee_status === 'at_risk' || c.guarantee_status === 'critical');

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-bold tracking-tight">
          {isCEO ? 'Executive Dashboard' : 'My Dashboard'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, {user?.full_name}. Here's your overview.
        </p>
      </motion.div>

      {/* KPI Grid */}
      {isCEO ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          <KPICard title="Total MRR" value={`$${mrr.toLocaleString()}`} icon={DollarSign} delay={0} trend="+18.8% from last month" trendUp />
          <KPICard title="Expenses" value={`$${expenses.toLocaleString()}`} icon={TrendingUp} delay={1} trend="+$120 from last month" trendUp={false} />
          <KPICard title="Gross Margin" value={`${margin}`} suffix="%" icon={Activity} delay={2} trend="+2.1pp" trendUp />
          <KPICard title="Active Clients" value={`${clients}`} icon={Users} delay={3} />
          <KPICard title="Leads This Month" value={`${leads}`} icon={Target} delay={4} trend="+9.2%" trendUp />
          <KPICard title="Meetings Booked" value={`${meetings}`} icon={CalendarCheck} delay={5} trend="+7.7%" trendUp />
          <KPICard title="Deliverability" value={`${deliverability}`} suffix="%" icon={Activity} delay={6} />
          <KPICard title="Burned Domains" value={`${kpis.burnedDomains}`} icon={Flame} delay={7} />
          <KPICard title="Tenant Util." value={`${utilization}`} suffix="%" icon={Server} delay={8} />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPICard title="Tasks Due Today" value={`${mockTasks.filter(t => t.due_date === '2025-02-18' && t.status !== 'done').length}`} icon={Target} delay={0} />
          <KPICard title="In Progress" value={`${mockTasks.filter(t => t.status === 'in_progress').length}`} icon={Activity} delay={1} />
          <KPICard title="Completed" value={`${mockTasks.filter(t => t.status === 'done').length}`} icon={CalendarCheck} delay={2} />
          <KPICard title="Overdue" value={`${overdueTasks.length}`} icon={AlertTriangle} delay={3} />
        </div>
      )}

      {/* Charts — CEO only */}
      {isCEO && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="rounded-lg border border-border bg-card p-4"
          >
            <h3 className="text-sm font-semibold mb-4">MRR Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={mrrTrendData}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(28, 82%, 56%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(28, 82%, 56%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,15%)" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(0,0%,50%)', fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: 'hsl(0,0%,50%)', fontSize: 12 }} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ background: 'hsl(0,0%,7%)', border: '1px solid hsl(0,0%,14%)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, 'MRR']}
                />
                <Area type="monotone" dataKey="mrr" stroke="hsl(28, 82%, 56%)" fill="url(#mrrGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="rounded-lg border border-border bg-card p-4"
          >
            <h3 className="text-sm font-semibold mb-4">Leads & Meetings</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={leadsMetricsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,15%)" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(0,0%,50%)', fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: 'hsl(0,0%,50%)', fontSize: 12 }} axisLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(0,0%,7%)', border: '1px solid hsl(0,0%,14%)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="leads" fill="hsl(28, 82%, 56%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="meetings" fill="hsl(210, 100%, 56%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}

      {/* Alerts */}
      {isCEO && atRiskClients.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="rounded-lg border border-warning/30 bg-warning/5 p-4"
        >
          <h3 className="text-sm font-semibold text-warning mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Guarantee Alerts
          </h3>
          <div className="space-y-2">
            {atRiskClients.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium">{c.company_name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{c.guarantee_leads}/{c.guarantee_target} leads · {c.guarantee_days_remaining}d left</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusColors[c.guarantee_status]}`}>
                    {c.guarantee_status.replace('_', ' ')}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="rounded-lg border border-border bg-card p-4"
      >
        <h3 className="text-sm font-semibold mb-3">{isCEO ? 'Team Tasks' : 'My Tasks'}</h3>
        <div className="space-y-1">
          {mockTasks.slice(0, 5).map((task, i) => {
            const priorityColors: Record<string, string> = {
              urgent: 'bg-destructive/10 text-destructive',
              high: 'bg-warning/10 text-warning',
              medium: 'bg-info/10 text-info',
              low: 'bg-muted text-muted-foreground',
            };
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.05 }}
                className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${task.status === 'done' ? 'bg-success' : task.status === 'blocked' ? 'bg-destructive' : 'bg-primary'}`} />
                  <span className="text-sm text-foreground">{task.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                  <span className="text-xs text-muted-foreground">{task.due_date}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
