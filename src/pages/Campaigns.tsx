import { motion } from 'framer-motion';
import { mockCampaigns } from '@/stores/mockData';
import { Plus, Mail, Eye, MessageSquare, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  live: 'bg-success/10 text-success',
  paused: 'bg-warning/10 text-warning',
  completed: 'bg-info/10 text-info',
};

const Campaigns = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">{mockCampaigns.length} campaigns</p>
        </div>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Campaign</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockCampaigns.map((campaign, i) => (
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
