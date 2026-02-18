import { motion } from 'framer-motion';
import { mockTools } from '@/stores/mockData';
import { useAuthStore } from '@/stores/authStore';
import { api, authTokenStorage } from '@/lib/api';
import { Plus, CreditCard, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

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
  const user = useAuthStore((s) => s.user);
  const token = authTokenStorage.get();
  const isEmployee = user?.role === 'employee';
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ tool_name: '', cost: 0, billing_cycle: 'monthly', renewal_date: '' });
  const [saving, setSaving] = useState(false);

  // Fetch tools from MongoDB
  useEffect(() => {
    const loadTools = async () => {
      if (!token) return;
      try {
        const response = await api.getTools(token);
        setTools(response.tools);
      } catch (error) {
        console.error('Failed to load tools:', error);
        setTools(mockTools);
      } finally {
        setLoading(false);
      }
    };
    loadTools();
  }, [token]);

  const handleAddTool = async () => {
    if (!formData.tool_name || formData.cost <= 0) {
      alert('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      await api.createTool(token, {
        tool_name: formData.tool_name,
        cost: parseFloat(formData.cost.toString()),
        billing_cycle: formData.billing_cycle,
        renewal_date: formData.renewal_date,
      });
      const response = await api.getTools(token);
      setTools(response.tools);
      setShowAddModal(false);
      setFormData({ tool_name: '', cost: 0, billing_cycle: 'monthly', renewal_date: '' });
    } catch (error) {
      console.error('Failed to add tool:', error);
      alert('Failed to add tool');
    } finally {
      setSaving(false);
    }
  };

  const totalMonthly = tools.filter(t => t.billing_cycle === 'monthly').reduce((s, t) => s + t.cost, 0);
  const totalAnnual = tools.filter(t => t.billing_cycle === 'annual').reduce((s, t) => s + t.cost, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tools & Billing</h1>
          <p className="text-sm text-muted-foreground mt-1">{tools.length} tools tracked</p>
        </div>
        <Button size="sm" onClick={() => setShowAddModal(true)}><Plus className="h-4 w-4 mr-1" /> Add Tool</Button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add New Tool</h2>
              <button onClick={() => setShowAddModal(false)}><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground">Tool Name *</label>
                <Input placeholder="Salesforce, Stripe, etc." value={formData.tool_name} onChange={(e) => setFormData({...formData, tool_name: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Cost *</label>
                <Input type="number" placeholder="29.99" value={formData.cost} onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value) || 0})} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Billing Cycle</label>
                <select value={formData.billing_cycle} onChange={(e) => setFormData({...formData, billing_cycle: e.target.value})} className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm">
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Renewal Date</label>
                <Input type="date" value={formData.renewal_date} onChange={(e) => setFormData({...formData, renewal_date: e.target.value})} />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
                <Button size="sm" onClick={handleAddTool} disabled={saving} className="flex-1">{saving ? 'Adding...' : 'Add Tool'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Monthly Spend</span>
          </div>
          <p className="text-2xl font-bold">{isEmployee ? 'Restricted' : `$${totalMonthly}/mo`}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="h-4 w-4 text-info" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Annual Contracts</span>
          </div>
          <p className="text-2xl font-bold">{isEmployee ? 'Restricted' : `$${totalAnnual}/yr`}</p>
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
            {tools.map((tool, i) => {
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
                  <td className="px-4 py-3 font-mono text-foreground">{isEmployee ? '—' : `$${tool.cost}`}</td>
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
