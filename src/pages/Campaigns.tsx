import { motion } from 'framer-motion';
import { mockCampaigns } from '@/stores/mockData';
import { useAuthStore } from '@/stores/authStore';
import { api, authTokenStorage } from '@/lib/api';
import { Plus, Mail, Eye, MessageSquare, CalendarCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  live: 'bg-success/10 text-success',
  paused: 'bg-warning/10 text-warning',
  completed: 'bg-info/10 text-info',
};

const Campaigns = () => {
  const user = useAuthStore((s) => s.user);
  const token = authTokenStorage.get();
  const isEmployee = user?.role === 'employee';
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', client_name: '', status: 'draft', emails_sent: 0 });
  const [saving, setSaving] = useState(false);

  // Fetch campaigns from MongoDB
  useEffect(() => {
    const loadCampaigns = async () => {
      if (!token) return;
      try {
        const response = await api.getCampaigns(token);
        setCampaigns(response.campaigns);
      } catch (error) {
        console.error('Failed to load campaigns:', error);
        setCampaigns(mockCampaigns);
      } finally {
        setLoading(false);
      }
    };
    loadCampaigns();
  }, [token]);

  const handleAddCampaign = async () => {
    if (!formData.name || !formData.client_name) {
      alert('Please fill in required fields');
      return;
    }
    setSaving(true);
    try {
      await api.createCampaign(token, {
        campaign_name: formData.name,
        client_name: formData.client_name,
        status: formData.status,
        start_date: new Date().toISOString().split('T')[0],
        emails_sent: parseInt(formData.emails_sent.toString()),
        open_rate: 0,
        click_rate: 0,
        reply_rate: 0,
        meetings_booked: 0,
      });
      const response = await api.getCampaigns(token);
      setCampaigns(response.campaigns);
      setShowAddModal(false);
      setFormData({ name: '', client_name: '', status: 'draft', emails_sent: 0 });
    } catch (error) {
      console.error('Failed to add campaign:', error);
      alert('Failed to add campaign');
    } finally {
      setSaving(false);
    }
  };

  const visibleCampaigns = isEmployee
    ? campaigns.filter((campaign) =>
        campaign.assigned_team?.includes(user?.full_name || '') || campaign.created_by === user?.email
      )
    : campaigns;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">{visibleCampaigns.length} campaigns</p>
        </div>
        <Button size="sm" onClick={() => setShowAddModal(true)}><Plus className="h-4 w-4 mr-1" /> New Campaign</Button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Campaign</h2>
              <button onClick={() => setShowAddModal(false)}><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground">Campaign Name *</label>
                <Input placeholder="Q1 Outreach" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Client Name *</label>
                <Input placeholder="Acme Corp" value={formData.client_name} onChange={(e) => setFormData({...formData, client_name: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Emails Sent</label>
                <Input type="number" placeholder="5000" value={formData.emails_sent} onChange={(e) => setFormData({...formData, emails_sent: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm">
                  <option value="draft">Draft</option>
                  <option value="live">Live</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
                <Button size="sm" onClick={handleAddCampaign} disabled={saving} className="flex-1">{saving ? 'Adding...' : 'Create Campaign'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleCampaigns.map((campaign, i) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{campaign.name}</h3>
                <p className="text-[11px] text-muted-foreground">{campaign.client_name}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusColors[campaign.status]}`}>
                {campaign.status}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <Mail className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
                <p className="text-lg font-bold text-foreground">{(campaign.emails_sent / 1000).toFixed(1)}k</p>
                <p className="text-[10px] text-muted-foreground">Sent</p>
              </div>
              <div className="text-center">
                <Eye className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
                <p className="text-lg font-bold text-foreground">{campaign.open_rate}%</p>
                <p className="text-[10px] text-muted-foreground">Opens</p>
              </div>
              <div className="text-center">
                <MessageSquare className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
                <p className="text-lg font-bold text-foreground">{campaign.reply_rate}%</p>
                <p className="text-[10px] text-muted-foreground">Replies</p>
              </div>
              <div className="text-center">
                <CalendarCheck className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
                <p className="text-lg font-bold text-primary">{campaign.meetings_booked}</p>
                <p className="text-[10px] text-muted-foreground">Meetings</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Campaigns;
