import { motion } from 'framer-motion';
import { mockClients } from '@/stores/mockData';

const statusConfig: Record<string, { color: string; ringColor: string }> = {
  safe: { color: 'text-success', ringColor: 'stroke-success' },
  at_risk: { color: 'text-warning', ringColor: 'stroke-warning' },
  critical: { color: 'text-destructive', ringColor: 'stroke-destructive' },
  met: { color: 'text-info', ringColor: 'stroke-info' },
};

function ProgressRing({ progress, status, size = 80 }: { progress: number; status: string; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;
  const config = statusConfig[status] || statusConfig.safe;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={config.ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-sm font-bold ${config.color}`}>{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

const Guarantees = () => {
  const clientsWithGuarantees = mockClients.filter((c) => c.status !== 'canceled');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Guarantees / SLA</h1>
        <p className="text-sm text-muted-foreground mt-1">50 interested leads in 90 days per client</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientsWithGuarantees.map((client, i) => {
          const progress = (client.guarantee_leads / client.guarantee_target) * 100;
          const config = statusConfig[client.guarantee_status] || statusConfig.safe;
          return (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className="rounded-lg border border-border bg-card p-5 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{client.company_name}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{client.industry}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  client.guarantee_status === 'safe' ? 'bg-success/10 text-success' :
                  client.guarantee_status === 'at_risk' ? 'bg-warning/10 text-warning pulse-glow' :
                  client.guarantee_status === 'critical' ? 'bg-destructive/10 text-destructive pulse-glow' :
                  'bg-info/10 text-info'
                }`}>
                  {client.guarantee_status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <ProgressRing progress={progress} status={client.guarantee_status} />
                <div className="space-y-1">
                  <p className="text-sm text-foreground">
                    <span className="font-bold">{client.guarantee_leads}</span>
                    <span className="text-muted-foreground"> / {client.guarantee_target} leads</span>
                  </p>
                  <p className={`text-xs font-medium ${config.color}`}>
                    {client.guarantee_days_remaining > 0 ? `${client.guarantee_days_remaining} days remaining` : 'Completed'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    ${client.monthly_fee.toLocaleString()}/mo
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Guarantees;
