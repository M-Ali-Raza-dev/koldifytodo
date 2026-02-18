import { useState } from 'react';
import { motion } from 'framer-motion';
import { mockAuditLogs } from '@/stores/mockData';
import { useAuthStore } from '@/stores/authStore';
import { Crown, Users, Shield, Activity, Clock, Search, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockAllUsers = [
  { id: '1', full_name: 'System Admin', email: 'admin@koldify.io', role: 'super_admin', status: 'active', last_login: '2025-02-18T09:00:00' },
  { id: '2', full_name: 'Alex Koldify', email: 'ceo@koldify.io', role: 'ceo', status: 'active', last_login: '2025-02-18T08:30:00' },
  { id: '3', full_name: 'Jordan Smith', email: 'employee@koldify.io', role: 'employee', status: 'active', last_login: '2025-02-18T09:15:00' },
  { id: '4', full_name: 'Sam Rivera', email: 'sam@koldify.io', role: 'employee', status: 'active', last_login: '2025-02-17T14:00:00' },
  { id: '5', full_name: 'Casey Morgan', email: 'casey@koldify.io', role: 'employee', status: 'inactive', last_login: '2025-01-15T10:00:00' },
];

const roleColors: Record<string, string> = {
  super_admin: 'bg-destructive/10 text-destructive',
  ceo: 'bg-primary/10 text-primary',
  employee: 'bg-info/10 text-info',
};

const actionColors: Record<string, string> = {
  create: 'bg-success/10 text-success',
  update: 'bg-info/10 text-info',
  delete: 'bg-destructive/10 text-destructive',
};

const AdminPanelPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredUsers = mockAllUsers.filter(u =>
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Crown className="h-6 w-6 text-primary" /> Super Admin Panel
          </h1>
          <p className="text-sm text-muted-foreground mt-1">System management and audit controls</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="bg-surface-1 border border-border">
          <TabsTrigger value="users" className="text-xs"><Users className="h-3.5 w-3.5 mr-1" /> Users</TabsTrigger>
          <TabsTrigger value="audit" className="text-xs"><Activity className="h-3.5 w-3.5 mr-1" /> Audit Log</TabsTrigger>
          <TabsTrigger value="system" className="text-xs"><Shield className="h-3.5 w-3.5 mr-1" /> System</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-9 h-9 text-sm" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add User</Button>
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">User</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Last Login</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, i) => (
                  <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-border hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{user.full_name}</p>
                        <p className="text-[11px] text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="outline" className={`text-[10px] ${roleColors[user.role]}`}>{user.role.replace('_', ' ')}</Badge></td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-[10px] ${user.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{user.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(user.last_login).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 text-xs">Edit</Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive">Deactivate</Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-3">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">User</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Entity</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Details</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody>
                {mockAuditLogs.map((log, i) => (
                  <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-border hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3"><Badge variant="outline" className={`text-[10px] ${actionColors[log.action]}`}>{log.action}</Badge></td>
                    <td className="px-4 py-3 text-foreground font-medium text-xs">{log.user_name}</td>
                    <td className="px-4 py-3">
                      <div>
                        <Badge variant="outline" className="text-[10px] mr-1">{log.entity_type}</Badge>
                        <span className="text-xs text-foreground">{log.entity_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{log.details}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(log.timestamp).toLocaleString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { title: 'Total Users', value: mockAllUsers.length, icon: Users },
              { title: 'Active Users', value: mockAllUsers.filter(u => u.status === 'active').length, icon: Activity },
              { title: 'Failed Jobs (24h)', value: 2, icon: Shield },
            ].map((stat, i) => (
              <motion.div key={stat.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="h-4 w-4 text-primary" />
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{stat.title}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanelPage;
