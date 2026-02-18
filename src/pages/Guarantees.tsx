import { motion } from 'framer-motion';
import { mockClients } from '@/stores/mockData';
import { api, authTokenStorage } from '@/lib/api';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

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
  const token = authTokenStorage.get();
  const [guarantees, setGuarantees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    guarantee_leads: 0,
    guarantee_target: 50,
    guarantee_status: 'safe',
    guarantee_days: 90,
  });

  // Fetch guarantees from MongoDB
  useEffect(() => {
    const loadGuarantees = async () => {
      if (!token) return;
      try {
        const response = await api.getGuarantees(token);
        setGuarantees(response.guarantees);
      } catch (error) {
        console.error('Failed to load guarantees:', error);
        // Fallback: use clients data for guarantee progress display
        try {
          const clientsResponse = await api.getClients(token);
          setGuarantees(clientsResponse.clients.filter((c: any) => c.status !== 'canceled'));
        } catch {
          setGuarantees(mockClients.filter((c) => c.status !== 'canceled'));
        }
      } finally {
        setLoading(false);
      }
    };
    loadGuarantees();
  }, [token]);

  const clientsWithGuarantees = guarantees;

  const handleAddGuarantee = async () => {
    if (!formData.client_id || !token) return;
    setSaving(true);
    try {
      await api.createGuarantee(token, {
        client_id: formData.client_id,
        guarantee_leads: parseInt(String(formData.guarantee_leads)),
        guarantee_target: parseInt(String(formData.guarantee_target)),
        guarantee_status: formData.guarantee_status,
        guarantee_days: parseInt(String(formData.guarantee_days)),
      });
      setShowAddModal(false);
      setFormData({
        client_id: '',
        guarantee_leads: 0,
        guarantee_target: 50,
        guarantee_status: 'safe',
        guarantee_days: 90,
      });
      // Refresh guarantees
      const response = await api.getGuarantees(token);
      setGuarantees(response.guarantees);
    } catch (error) {
      console.error('Failed to add guarantee:', error);
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Guarantees / SLA</h1>
          <p className="text-sm text-muted-foreground mt-1">50 interested leads in 90 days per client</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>Add Guarantee</Button>
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add Guarantee</h2>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Client ID</label>
                <Input
                  type="text"
                  placeholder="Client ID"
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Current Leads</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.guarantee_leads}
                  onChange={(e) => setFormData({ ...formData, guarantee_leads: parseInt(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Target Leads</label>
                <Input
                  type="number"
                  placeholder="50"
                  value={formData.guarantee_target}
                  onChange={(e) => setFormData({ ...formData, guarantee_target: parseInt(e.target.value) || 50 })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={formData.guarantee_status}
                  onChange={(e) => setFormData({ ...formData, guarantee_status: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="safe">Safe</option>
                  <option value="at_risk">At Risk</option>
                  <option value="critical">Critical</option>
                  <option value="met">Met</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Days</label>
                <Input
                  type="number"
                  placeholder="90"
                  value={formData.guarantee_days}
                  onChange={(e) => setFormData({ ...formData, guarantee_days: parseInt(e.target.value) || 90 })}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddGuarantee}
                  disabled={saving || !formData.client_id}
                >
                  {saving ? 'Adding...' : 'Add Guarantee'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guarantees;
