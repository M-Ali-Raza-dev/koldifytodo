import { motion } from 'framer-motion';
import { mockClients } from '@/stores/mockData';
import { Plus, Search, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const statusColors: Record<string, string> = {
  active: 'bg-success/10 text-success',
  onboarding: 'bg-info/10 text-info',
  paused: 'bg-warning/10 text-warning',
  canceled: 'bg-destructive/10 text-destructive',
};

const guaranteeColors: Record<string, string> = {
  safe: 'bg-success/10 text-success',
  at_risk: 'bg-warning/10 text-warning',
  critical: 'bg-destructive/10 text-destructive',
  met: 'bg-info/10 text-info',
};

const Clients = () => {
  const [search, setSearch] = useState('');
  const filtered = mockClients.filter((c) =>
    c.company_name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">{mockClients.length} clients</p>
        </div>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Client</Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Company</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Industry</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">MRR</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Guarantee</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Contact</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client, i) => (
              <motion.tr
                key={client.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-border hover:bg-secondary/20 transition-colors cursor-pointer group"
              >
                <td className="px-4 py-3">
                  <div>
                    <span className="font-medium text-foreground">{client.company_name}</span>
                    <span className="block text-[11px] text-muted-foreground">{client.website}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{client.industry}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusColors[client.status]}`}>
                    {client.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-foreground">${client.monthly_fee.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          client.guarantee_status === 'met' ? 'bg-info' :
                          client.guarantee_status === 'safe' ? 'bg-success' :
                          client.guarantee_status === 'at_risk' ? 'bg-warning' : 'bg-destructive'
                        }`}
                        style={{ width: `${Math.min((client.guarantee_leads / client.guarantee_target) * 100, 100)}%` }}
                      />
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${guaranteeColors[client.guarantee_status]} ${
                      client.guarantee_status === 'at_risk' || client.guarantee_status === 'critical' ? 'pulse-glow' : ''
                    }`}>
                      {client.guarantee_leads}/{client.guarantee_target}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{client.main_contact_name}</td>
                <td className="px-4 py-3">
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Clients;
