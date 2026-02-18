import { useState } from 'react';
import { motion } from 'framer-motion';
import { mockTenants, mockInboxes, mockInfraHealth, type Tenant, type Inbox } from '@/stores/mockData';
import { Server, Mail, Activity, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { exportToCSV } from '@/lib/csv';

const statusColors: Record<string, string> = {
  active: 'bg-success/10 text-success',
  warmup: 'bg-warning/10 text-warning',
  production: 'bg-info/10 text-info',
  paused: 'bg-muted text-muted-foreground',
  banned: 'bg-destructive/10 text-destructive pulse-glow',
};

const inboxStatusColors: Record<string, string> = {
  active: 'bg-success/10 text-success',
  warming: 'bg-warning/10 text-warning',
  paused: 'bg-muted text-muted-foreground',
  burned: 'bg-destructive/10 text-destructive',
};

function getBurnRisk(inboxes: Inbox[], tenantId: string): { label: string; color: string } {
  const tInboxes = inboxes.filter(i => i.tenant_id === tenantId);
  const burnedCount = tInboxes.filter(i => i.status === 'burned').length;
  const warmingCount = tInboxes.filter(i => i.status === 'warming').length;
  const health = mockInfraHealth.filter(h => h.tenant_id === tenantId).sort((a, b) => b.date.localeCompare(a.date))[0];

  let score = 0;
  if (burnedCount > 0) score += 40;
  if (health && health.bounce_rate > 4) score += 25;
  if (health && health.spam_rate > 1) score += 25;
  if (warmingCount > tInboxes.length * 0.5) score += 10;

  if (score >= 50) return { label: 'High', color: 'bg-destructive/10 text-destructive pulse-glow' };
  if (score >= 25) return { label: 'Medium', color: 'bg-warning/10 text-warning' };
  return { label: 'Low', color: 'bg-success/10 text-success' };
}

function TenantRow({ tenant, index }: { tenant: Tenant; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const inboxes = mockInboxes.filter(i => i.tenant_id === tenant.id);
  const health = mockInfraHealth.filter(h => h.tenant_id === tenant.id).sort((a, b) => b.date.localeCompare(a.date))[0];
  const burnRisk = getBurnRisk(mockInboxes, tenant.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <div
        className="flex items-center gap-4 px-4 py-3 border-b border-border hover:bg-secondary/20 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="text-muted-foreground">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
        <Server className="h-4 w-4 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{tenant.tenant_name}</p>
          <p className="text-[11px] text-muted-foreground">{tenant.vendor_name}</p>
        </div>
        <Badge variant="outline" className={`text-[10px] ${statusColors[tenant.status]}`}>{tenant.status}</Badge>
        <div className="text-center w-16">
          <p className="text-sm font-semibold text-foreground">{tenant.inbox_count}</p>
          <p className="text-[10px] text-muted-foreground">inboxes</p>
        </div>
        <div className="text-center w-20">
          <p className="text-sm font-semibold text-foreground">${tenant.monthly_cost}</p>
          <p className="text-[10px] text-muted-foreground">/month</p>
        </div>
        {health && (
          <div className="text-center w-20">
            <p className="text-sm font-semibold text-foreground">{health.deliverability_score}%</p>
            <p className="text-[10px] text-muted-foreground">delivery</p>
          </div>
        )}
        <Badge variant="outline" className={`text-[10px] ${burnRisk.color}`}>{burnRisk.label} Risk</Badge>
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-surface-1 border-b border-border"
        >
          <div className="px-8 py-3">
            {health && (
              <div className="flex gap-4 mb-3 text-xs">
                <span className="text-muted-foreground">Bounce: <span className={`font-semibold ${health.bounce_rate > 4 ? 'text-destructive' : 'text-success'}`}>{health.bounce_rate}%</span></span>
                <span className="text-muted-foreground">Spam: <span className={`font-semibold ${health.spam_rate > 1 ? 'text-destructive' : 'text-success'}`}>{health.spam_rate}%</span></span>
                <span className="text-muted-foreground">Renewal: <span className="text-foreground font-medium">{tenant.renewal_date}</span></span>
              </div>
            )}
            <div className="space-y-1.5">
              {inboxes.map(inbox => (
                <div key={inbox.id} className="flex items-center gap-3 text-xs px-3 py-2 rounded-md bg-card">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-foreground font-mono text-[11px] flex-1">{inbox.email_address}</span>
                  <Badge variant="outline" className={`text-[10px] ${inboxStatusColors[inbox.status]}`}>{inbox.status}</Badge>
                  <span className="text-muted-foreground w-16 text-right">{inbox.daily_limit}/day</span>
                  <span className="text-muted-foreground w-20 text-right">Warmup: {inbox.warmup_stage}%</span>
                </div>
              ))}
              {inboxes.length === 0 && <p className="text-xs text-muted-foreground py-2">No inboxes attached</p>}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

const TenantsPage = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tenants & Inboxes</h1>
          <p className="text-sm text-muted-foreground mt-1">{mockTenants.length} tenants · {mockInboxes.length} inboxes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportToCSV(mockTenants as unknown as Record<string, unknown>[], 'tenants')}>Export CSV</Button>
          <Button size="sm"><Server className="h-4 w-4 mr-1" /> Add Tenant</Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {mockTenants.map((tenant, i) => (
          <TenantRow key={tenant.id} tenant={tenant} index={i} />
        ))}
      </div>

      {/* Infra Health Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-lg border border-border bg-card p-4"
      >
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" /> Infrastructure Health Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {mockTenants.map(t => {
            const health = mockInfraHealth.filter(h => h.tenant_id === t.id).sort((a, b) => b.date.localeCompare(a.date))[0];
            const burnRisk = getBurnRisk(mockInboxes, t.id);
            return (
              <div key={t.id} className="rounded-md bg-surface-1 p-3">
                <p className="text-xs font-semibold text-foreground">{t.tenant_name}</p>
                {health ? (
                  <div className="mt-2 space-y-1 text-[11px]">
                    <div className="flex justify-between"><span className="text-muted-foreground">Deliverability</span><span className="font-semibold text-foreground">{health.deliverability_score}%</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Bounce Rate</span><span className={`font-semibold ${health.bounce_rate > 4 ? 'text-destructive' : 'text-success'}`}>{health.bounce_rate}%</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Spam Rate</span><span className={`font-semibold ${health.spam_rate > 1 ? 'text-destructive' : 'text-success'}`}>{health.spam_rate}%</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Burn Risk</span><Badge variant="outline" className={`text-[10px] ${burnRisk.color}`}>{burnRisk.label}</Badge></div>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground mt-2">No health data</p>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default TenantsPage;
