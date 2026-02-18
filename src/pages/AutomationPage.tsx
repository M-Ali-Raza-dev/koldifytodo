import { useState } from 'react';
import { motion } from 'framer-motion';
import { mockAutomationJobs, mockApiUsage, type AutomationJob } from '@/stores/mockData';
import { Bot, AlertCircle, CheckCircle, Loader, Clock, Zap, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { exportToCSV } from '@/lib/csv';

const statusConfig: Record<string, { icon: React.ElementType; color: string }> = {
  success: { icon: CheckCircle, color: 'text-success' },
  failed: { icon: AlertCircle, color: 'text-destructive' },
  running: { icon: Loader, color: 'text-info' },
};

function JobRow({ job, index }: { job: AutomationJob; index: number }) {
  const config = statusConfig[job.status];
  const Icon = config.icon;
  const duration = job.ended_at
    ? Math.round((new Date(job.ended_at).getTime() - new Date(job.started_at).getTime()) / 1000)
    : null;

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.04 }}
      className="border-b border-border hover:bg-secondary/20 transition-colors"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${config.color} ${job.status === 'running' ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium text-foreground">{job.job_name}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className="text-[10px]">{job.job_type}</Badge>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className={`text-[10px] ${
          job.status === 'success' ? 'bg-success/10 text-success' :
          job.status === 'failed' ? 'bg-destructive/10 text-destructive' :
          'bg-info/10 text-info'
        }`}>{job.status}</Badge>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {duration !== null ? `${Math.floor(duration / 60)}m ${duration % 60}s` : 'Running...'}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{job.retries > 0 ? `${job.retries} retries` : '—'}</td>
      <td className="px-4 py-3 text-xs">
        {job.error_message ? (
          <span className="text-destructive font-mono text-[11px]">{job.error_message}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(job.started_at).toLocaleString()}</td>
    </motion.tr>
  );
}

const AutomationPage = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const filtered = statusFilter === 'all' ? mockAutomationJobs : mockAutomationJobs.filter(j => j.status === statusFilter);

  // Group API usage by provider (latest date)
  const latestDate = mockApiUsage.reduce((max, u) => u.date > max ? u.date : max, '');
  const todayUsage = mockApiUsage.filter(u => u.date === latestDate);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Automation & Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">{mockAutomationJobs.length} jobs · {mockAutomationJobs.filter(j => j.status === 'failed').length} failed</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportToCSV(mockAutomationJobs as unknown as Record<string, unknown>[], 'automation-jobs')}>Export</Button>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2">
        {['all', 'success', 'failed', 'running'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
              statusFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Jobs table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Job</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Duration</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Retries</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Error</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Started</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((job, i) => (
              <JobRow key={job.id} job={job} index={i} />
            ))}
          </tbody>
        </table>
      </div>

      {/* API Usage */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-lg border border-border bg-card p-4"
      >
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" /> API Usage Today
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {todayUsage.map(usage => (
            <div key={usage.id} className="rounded-md bg-surface-1 p-3">
              <p className="text-xs font-semibold text-foreground">{usage.provider_name}</p>
              <div className="mt-2 space-y-1 text-[11px]">
                <div className="flex justify-between"><span className="text-muted-foreground">Requests</span><span className="font-semibold text-foreground">{usage.requests_count.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Rate Limits</span><span className={`font-semibold ${usage.rate_limit_hits > 5 ? 'text-destructive' : 'text-success'}`}>{usage.rate_limit_hits}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Est. Cost</span><span className="font-semibold text-foreground">${usage.cost_estimate.toFixed(2)}</span></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AutomationPage;
