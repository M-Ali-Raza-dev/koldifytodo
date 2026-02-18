import { motion } from 'framer-motion';
import { mockClients } from '@/stores/mockData';
import { useAuthStore } from '@/stores/authStore';
import { api, authTokenStorage } from '@/lib/api';
import { Plus, Search, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

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
  const user = useAuthStore((s) => s.user);
  const token = authTokenStorage.get();
  const isEmployee = user?.role === 'employee';
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ company_name: '', website: '', industry: '', monthly_fee: 0, main_contact_name: '', status: 'active' });
  const [saving, setSaving] = useState(false);

  // Fetch clients from MongoDB
  useEffect(() => {
    const loadClients = async () => {
      if (!token) return;
      try {
        const response = await api.getClients(token);
        setClients(response.clients);
      } catch (error) {
        console.error('Failed to load clients:', error);
        // Fallback to mock data
        setClients(mockClients);
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, [token]);

  const handleAddClient = async () => {
    if (!formData.company_name || !formData.website) {
      alert('Please fill in required fields');
      return;
    }
    setSaving(true);
    try {
      await api.createClient(token, {
        ...formData,
        monthly_fee: parseFloat(formData.monthly_fee.toString()),
        guarantee_leads: 0,
        guarantee_target: 50,
        guarantee_status: 'safe',
        guarantee_days_remaining: 90,
      });
      const response = await api.getClients(token);
      setClients(response.clients);
      setShowAddModal(false);
      setFormData({ company_name: '', website: '', industry: '', monthly_fee: 0, main_contact_name: '', status: 'active' });
    } catch (error) {
      console.error('Failed to add client:', error);
      alert('Failed to add client');
    } finally {
      setSaving(false);
    }
  };

  const filtered = clients.filter((c) =>
    c.company_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">{clients.length} clients</p>
        </div>
        <Button size="sm" onClick={() => setShowAddModal(true)}><Plus className="h-4 w-4 mr-1" /> Add Client</Button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add New Client</h2>
              <button onClick={() => setShowAddModal(false)}><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground">Company Name *</label>
                <Input placeholder="Acme Corp" value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Website *</label>
                <Input placeholder="example.com" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Industry</label>
                <Input placeholder="Tech, Finance, etc." value={formData.industry} onChange={(e) => setFormData({...formData, industry: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Monthly Fee</label>
                <Input type="number" placeholder="5000" value={formData.monthly_fee} onChange={(e) => setFormData({...formData, monthly_fee: parseFloat(e.target.value) || 0})} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Main Contact</label>
                <Input placeholder="John Doe" value={formData.main_contact_name} onChange={(e) => setFormData({...formData, main_contact_name: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm">
                  <option value="active">Active</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="paused">Paused</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
                <Button size="sm" onClick={handleAddClient} disabled={saving} className="flex-1">{saving ? 'Adding...' : 'Add Client'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <td className="px-4 py-3 font-mono text-foreground">{isEmployee ? 'Restricted' : `$${client.monthly_fee.toLocaleString()}`}</td>
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
