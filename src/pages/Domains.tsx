import { motion } from 'framer-motion';
import { mockDomains } from '@/stores/mockData';
import { CheckCircle2, XCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const statusColors: Record<string, string> = {
  new: 'bg-info/10 text-info',
  warming: 'bg-warning/10 text-warning',
  active: 'bg-success/10 text-success',
  burned: 'bg-destructive/10 text-destructive',
};

function DnsCheck({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
  ) : (
    <XCircle className="h-3.5 w-3.5 text-destructive" />
  );
}

const Domains = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Domains & DNS</h1>
          <p className="text-sm text-muted-foreground mt-1">{mockDomains.length} domains tracked</p>
        </div>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Domain</Button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Domain</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Registrar</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">SPF</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">DKIM</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">DMARC</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Age</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Renewal</th>
            </tr>
          </thead>
          <tbody>
            {mockDomains.map((domain, i) => (
              <motion.tr
                key={domain.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-border hover:bg-secondary/20 transition-colors"
              >
                <td className="px-4 py-3 font-mono text-sm text-foreground">{domain.domain_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{domain.registrar}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusColors[domain.status]} ${domain.status === 'burned' ? 'pulse-glow' : ''}`}>
                    {domain.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center"><DnsCheck ok={domain.spf} /></td>
                <td className="px-4 py-3 text-center"><DnsCheck ok={domain.dkim} /></td>
                <td className="px-4 py-3 text-center"><DnsCheck ok={domain.dmarc} /></td>
                <td className="px-4 py-3 text-muted-foreground">{domain.age_days}d</td>
                <td className="px-4 py-3 text-muted-foreground">{domain.renewal_date}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Domains;
