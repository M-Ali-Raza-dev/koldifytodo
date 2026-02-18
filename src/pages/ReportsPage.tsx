import { motion } from 'framer-motion';
import { mockClients, mockTools, mockTenants, leadsMetricsData, mrrTrendData, expensesTrendData } from '@/stores/mockData';
import { BarChart3, DollarSign, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToCSV } from '@/lib/csv';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';

const ReportsPage = () => {
  const totalMRR = mockClients.filter(c => c.status === 'active').reduce((s, c) => s + c.monthly_fee, 0);
  const totalToolCost = mockTools.reduce((s, t) => s + (t.billing_cycle === 'annual' ? t.cost / 12 : t.cost), 0);
  const totalTenantCost = mockTenants.reduce((s, t) => s + t.monthly_cost, 0);
  const totalExpenses = totalToolCost + totalTenantCost;
  const grossProfit = totalMRR - totalExpenses;
  const grossMargin = totalMRR > 0 ? (grossProfit / totalMRR) * 100 : 0;

  const clientProfitability = mockClients.filter(c => c.status === 'active').map(c => ({
    name: c.company_name,
    revenue: c.monthly_fee,
    estimated_cost: Math.round(totalExpenses / mockClients.filter(cl => cl.status === 'active').length),
    profit: c.monthly_fee - Math.round(totalExpenses / mockClients.filter(cl => cl.status === 'active').length),
    cost_per_lead: c.guarantee_leads > 0 ? Math.round((totalExpenses / mockClients.filter(cl => cl.status === 'active').length) / c.guarantee_leads) : 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Financial and performance analytics</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => exportToCSV(clientProfitability as unknown as Record<string, unknown>[], 'profitability-report')}>Export Report</Button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { title: 'Total MRR', value: `$${totalMRR.toLocaleString()}`, icon: DollarSign },
          { title: 'Total Expenses', value: `$${Math.round(totalExpenses).toLocaleString()}`, icon: TrendingUp },
          { title: 'Gross Profit', value: `$${grossProfit.toLocaleString()}`, icon: BarChart3 },
          { title: 'Gross Margin', value: `${grossMargin.toFixed(1)}%`, icon: Users },
        ].map((kpi, i) => (
          <motion.div key={kpi.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{kpi.title}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-4">Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mrrTrendData.map((m, i) => ({ ...m, expenses: expensesTrendData[i]?.expenses || 0 }))}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,15%)" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(0,0%,50%)', fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: 'hsl(0,0%,50%)', fontSize: 12 }} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip contentStyle={{ background: 'hsl(0,0%,7%)', border: '1px solid hsl(0,0%,14%)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="mrr" name="Revenue" stroke="hsl(142, 71%, 45%)" fill="url(#revGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="hsl(0, 72%, 51%)" fill="url(#expGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-4">Leads & Meetings Trend</h3>
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

      {/* Profit per Client */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold">Profit per Client</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Client</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Revenue</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Est. Cost</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Profit</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Cost/Lead</th>
            </tr>
          </thead>
          <tbody>
            {clientProfitability.map((c, i) => (
              <motion.tr key={c.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.04 }}
                className="border-b border-border hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                <td className="px-4 py-3 text-right text-foreground">${c.revenue.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">${c.estimated_cost.toLocaleString()}</td>
                <td className={`px-4 py-3 text-right font-semibold ${c.profit > 0 ? 'text-success' : 'text-destructive'}`}>${c.profit.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{c.cost_per_lead > 0 ? `$${c.cost_per_lead}` : '—'}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default ReportsPage;
