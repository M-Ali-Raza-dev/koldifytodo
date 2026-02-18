import { motion } from 'framer-motion';
import { mockDomains } from '@/stores/mockData';
import { useAuthStore } from '@/stores/authStore';
import { api, authTokenStorage } from '@/lib/api';
import { CheckCircle2, XCircle, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

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
  const token = authTokenStorage.get();
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ domain_name: '', registrar: '', status: 'active', renewal_date: '' });
  const [saving, setSaving] = useState(false);

  // Fetch domains from MongoDB
  useEffect(() => {
    const loadDomains = async () => {
      if (!token) return;
      try {
        const response = await api.getDomains(token);
        setDomains(response.domains);
      } catch (error) {
        console.error('Failed to load domains:', error);
        setDomains(mockDomains);
      } finally {
        setLoading(false);
      }
    };
    loadDomains();
  }, [token]);

  const handleAddDomain = async () => {
    if (!formData.domain_name || !formData.registrar) {
      alert('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      await api.createDomain(token, {
        domain_name: formData.domain_name,
        registrar: formData.registrar,
        status: formData.status,
        renewal_date: formData.renewal_date,
        spf: true,
        dkim: true,
        dmarc: true,
      });
      const response = await api.getDomains(token);
      setDomains(response.domains);
      setShowAddModal(false);
      setFormData({ domain_name: '', registrar: '', status: 'active', renewal_date: '' });
    } catch (error) {
      console.error('Failed to add domain:', error);
      alert('Failed to add domain');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Domains & DNS</h1>
          <p className="text-sm text-muted-foreground mt-1">{domains.length} domains tracked</p>
        </div>
        <Button size="sm" onClick={() => setShowAddModal(true)}><Plus className="h-4 w-4 mr-1" /> Add Domain</Button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add New Domain</h2>
              <button onClick={() => setShowAddModal(false)}><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground">Domain Name *</label>
                <Input placeholder="example.com" value={formData.domain_name} onChange={(e) => setFormData({...formData, domain_name: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Registrar *</label>
                <Input placeholder="GoDaddy, Namecheap, etc." value={formData.registrar} onChange={(e) => setFormData({...formData, registrar: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm">
                  <option value="new">New</option>
                  <option value="warming">Warming</option>
                  <option value="active">Active</option>
                  <option value="burned">Burned</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Renewal Date</label>
                <Input type="date" value={formData.renewal_date} onChange={(e) => setFormData({...formData, renewal_date: e.target.value})} />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
                <Button size="sm" onClick={handleAddDomain} disabled={saving} className="flex-1">{saving ? 'Adding...' : 'Add Domain'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            {domains.map((domain, i) => (
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
