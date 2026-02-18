import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center min-h-[60vh] text-center"
  >
    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-4">
      <Construction className="h-8 w-8 text-primary" />
    </div>
    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
    <p className="text-sm text-muted-foreground mt-2 max-w-md">{description}</p>
  </motion.div>
);

export const Projects = () => <PlaceholderPage title="Projects" description="Project management with team assignments coming in Phase 2." />;
export const Tenants = () => <PlaceholderPage title="Tenants & Inboxes" description="Microsoft tenant and inbox infrastructure management coming soon." />;
export const Automation = () => <PlaceholderPage title="Automation & Logs" description="Job monitoring, API usage tracking, and error logs coming in Phase 2." />;
export const Renewals = () => <PlaceholderPage title="Renewals Calendar" description="Unified renewal calendar for tools, tenants, and domains coming soon." />;
export const Reports = () => <PlaceholderPage title="Reports" description="Profit per client, cost per lead, and revenue analytics coming in Phase 2." />;
export const AdminPanel = () => <PlaceholderPage title="Super Admin Panel" description="User management, audit logs, and system health monitoring." />;
export const SettingsPage = () => <PlaceholderPage title="Settings" description="Profile, workspace, and application settings." />;
