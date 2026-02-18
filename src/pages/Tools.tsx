import { motion } from 'framer-motion';
import { mockTools } from '@/stores/mockData';
import { Plus, CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function renewalBadge(days: number) {
  if (days <= 7) return 'bg-destructive/10 text-destructive';
  if (days <= 14) return 'bg-warning/10 text-warning';
  if (days <= 30) return 'bg-info/10 text-info';
  return 'bg-success/10 text-success';
}

const Tools = () => {
  const totalMonthly = mockTools.filter(t => t.billing_cycle === 'monthly').reduce((s, t) => s + t.cost, 0);
  const totalAnnual = mockTools.filter(t => t.billing_cycle === 'annual').reduce((s, t) => s + t.cost, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tools & Billing</h1>
          <p className="text-sm text-muted-foreground mt-1">{mockTools.length} tools tracked</p>
        </div>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Tool</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Monthly Spend</span>
          </div>
          <p className="text-2xl font-bold">${totalMonthly}/mo</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="h-4 w-4 text-info" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Annual Contracts</span>
          </div>
          <p className="text-2xl font-bold">${totalAnnual}/yr</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="h-4 w-4 text-warning" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Renewals Soon</span>
          </div>
          <p className="text-2xl font-bold">{mockTools.filter(t => daysUntil(t.renewal_date) <= 14).length}</p>
        </motion.div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tool</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Vendor</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Cost</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Billing</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Renewal</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Autopay</th>
            </tr>
          </thead>
          <tbody>
            {mockTools.map((tool, i) => {
              const days = daysUntil(tool.renewal_date);
              return (
                <motion.tr
                  key={tool.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-border hover:bg-secondary/20 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{tool.tool_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{tool.vendor}</td>
                  <td className="px-4 py-3 font-mono text-foreground">${tool.cost}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{tool.billing_cycle}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${renewalBadge(days)}`}>
                      {days}d
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className={`h-2 w-2 rounded-full ${tool.autopay ? 'bg-success' : 'bg-muted-foreground/30'}`} />
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tools;
