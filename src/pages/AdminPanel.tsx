import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { User } from '@/stores/authStore';
import { Crown, Users, Shield, Activity, Clock, Search, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api, authTokenStorage } from '@/lib/api';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const roleColors: Record<string, string> = {
  super_admin: 'bg-destructive/10 text-destructive',
  ceo: 'bg-primary/10 text-primary',
  employee: 'bg-info/10 text-info',
};

const AdminPanelPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; action: string; actor_email: string; target_user_email?: string; details?: string; destructive: boolean; created_at: string }>>([]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<User['role']>('employee');

  const loadAdminData = async () => {
    const token = authTokenStorage.get();
    if (!token) return;

    try {
      const [{ users }, { logs }] = await Promise.all([api.getUsers(token), api.getAuditLogs(token)]);
      setAllUsers(users);
      setAuditLogs(logs);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load admin data');
    }
  };

  useEffect(() => {
    void loadAdminData();
  }, []);

  const createUser = async () => {
    const token = authTokenStorage.get();
    if (!token) return;
    if (!newUserName || !newUserEmail || !newUserPassword) {
      toast.error('Name, email and password are required');
      return;
    }

    try {
      await api.createUser(token, {
        full_name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
      });
      toast.success('User created');
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('employee');
      await loadAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create user');
    }
  };

  const changeRole = async (userId: string, role: User['role']) => {
    const token = authTokenStorage.get();
    if (!token) return;

    try {
      await api.updateUser(token, userId, { role });
      toast.success('Role updated');
      await loadAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
    }
  };

  const deactivateUser = async (userId: string) => {
    const token = authTokenStorage.get();
    if (!token) return;

    try {
      await api.updateUser(token, userId, { is_active: false });
      toast.success('User deactivated');
      await loadAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to deactivate user');
    }
  };

  const resetPassword = async (userId: string) => {
    const token = authTokenStorage.get();
    if (!token) return;
    const password = window.prompt('Enter new password');
    if (!password) return;

    try {
      await api.resetUserPassword(token, userId, password);
      toast.success('Password reset');
      await loadAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reset password');
    }
  };

  const grantTemporaryAccess = async (userId: string) => {
    const token = authTokenStorage.get();
    if (!token) return;
    const module = window.prompt('Module name to grant temporarily (e.g. reports)');
    if (!module) return;

    try {
      await api.setElevatedAccess(token, userId, { module, expires_in_hours: 24 });
      toast.success('Temporary access granted');
      await loadAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to grant access');
    }
  };

  const filteredUsers = allUsers.filter(u =>
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
            <Button size="sm" onClick={createUser}><Plus className="h-4 w-4 mr-1" /> Add User</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input placeholder="Full name" value={newUserName} onChange={e => setNewUserName(e.target.value)} />
            <Input placeholder="Email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} />
            <Input placeholder="Password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} />
            <Select value={newUserRole} onValueChange={(value: User['role']) => setNewUserRole(value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="ceo">CEO</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
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
                      <Badge variant="outline" className={`text-[10px] ${user.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {user.is_active ? 'active' : 'inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(user.last_login).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        <Select value={user.role} onValueChange={(value: User['role']) => changeRole(user.id, value)}>
                          <SelectTrigger className="h-7 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">employee</SelectItem>
                            <SelectItem value="ceo">ceo</SelectItem>
                            <SelectItem value="super_admin">super_admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => grantTemporaryAccess(user.id)}>Grant Access</Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => resetPassword(user.id)}>Reset Password</Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => deactivateUser(user.id)}>Deactivate</Button>
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
                {auditLogs.map((log, i) => (
                  <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-border hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3"><Badge variant="outline" className={`text-[10px] ${log.destructive ? 'bg-destructive/10 text-destructive' : 'bg-info/10 text-info'}`}>{log.action}</Badge></td>
                    <td className="px-4 py-3 text-foreground font-medium text-xs">{log.actor_email}</td>
                    <td className="px-4 py-3">
                      <div>
                        <Badge variant="outline" className="text-[10px] mr-1">user</Badge>
                        <span className="text-xs text-foreground">{log.target_user_email || 'system'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{log.details || '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(log.created_at).toLocaleString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { title: 'Total Users', value: allUsers.length, icon: Users },
              { title: 'Active Users', value: allUsers.filter(u => u.is_active).length, icon: Activity },
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
