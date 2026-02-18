import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { mockTools, mockTenants, mockDomains } from '@/stores/mockData';
import { CalendarClock, CreditCard, Server, Globe, Wrench, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { exportToCSV } from '@/lib/csv';

interface RenewalItem {
  id: string;
  name: string;
  category: 'tool' | 'tenant' | 'domain';
  cost: number;
  renewal_date: string;
  autopay?: boolean;
  days_until: number;
}

function getUrgencyBadge(days: number) {
  if (days <= 0) return { label: 'Overdue', color: 'bg-destructive/10 text-destructive pulse-glow' };
  if (days <= 7) return { label: `${days}d`, color: 'bg-destructive/10 text-destructive' };
  if (days <= 14) return { label: `${days}d`, color: 'bg-warning/10 text-warning' };
  if (days <= 30) return { label: `${days}d`, color: 'bg-info/10 text-info' };
  return { label: `${days}d`, color: 'bg-muted text-muted-foreground' };
}

const categoryIcons: Record<string, React.ElementType> = { tool: Wrench, tenant: Server, domain: Globe };
const categoryColors: Record<string, string> = { tool: 'text-primary', tenant: 'text-info', domain: 'text-success' };

const RenewalsPage = () => {
  const today = new Date();

  const renewals: RenewalItem[] = useMemo(() => {
    const items: RenewalItem[] = [];
    mockTools.forEach(t => {
      const days = Math.ceil((new Date(t.renewal_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      items.push({ id: `tool-${t.id}`, name: t.tool_name, category: 'tool', cost: t.cost, renewal_date: t.renewal_date, autopay: t.autopay, days_until: days });
    });
    mockTenants.forEach(t => {
      const days = Math.ceil((new Date(t.renewal_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      items.push({ id: `tenant-${t.id}`, name: t.tenant_name, category: 'tenant', cost: t.monthly_cost, renewal_date: t.renewal_date, days_until: days });
    });
    mockDomains.forEach(d => {
      const days = Math.ceil((new Date(d.renewal_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      items.push({ id: `domain-${d.id}`, name: d.domain_name, category: 'domain', cost: 12, renewal_date: d.renewal_date, days_until: days });
    });
    return items.sort((a, b) => a.days_until - b.days_until);
  }, []);

  const totalMonthly = renewals.filter(r => r.category === 'tool' || r.category === 'tenant').reduce((s, r) => s + r.cost, 0);
  const urgentCount = renewals.filter(r => r.days_until <= 14).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Renewals Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">{renewals.length} upcoming renewals · {urgentCount} due within 14 days</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => exportToCSV(renewals as unknown as Record<string, unknown>[], 'renewals')}>Export CSV</Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total Monthly</span>
          </div>
          <p className="text-2xl font-bold text-foreground">${totalMonthly.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Due in 14 Days</span>
          </div>
          <p className="text-2xl font-bold text-warning">{urgentCount}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarClock className="h-4 w-4 text-info" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total Items</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{renewals.length}</p>
        </motion.div>
      </div>

      {/* Renewals list */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Item</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Cost</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Renewal Date</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Urgency</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Autopay</th>
            </tr>
          </thead>
          <tbody>
            {renewals.map((item, i) => {
              const urgency = getUrgencyBadge(item.days_until);
              const Icon = categoryIcons[item.category];
              return (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border hover:bg-secondary/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${categoryColors[item.category]}`} />
                      <span className="font-medium text-foreground">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-[10px] capitalize">{item.category}</Badge></td>
                  <td className="px-4 py-3 text-foreground font-medium">${item.cost}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.renewal_date}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className={`text-[10px] ${urgency.color}`}>{urgency.label}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{item.autopay !== undefined ? (item.autopay ? '✓' : '✗') : '—'}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RenewalsPage;
