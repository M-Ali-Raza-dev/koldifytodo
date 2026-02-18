import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { Settings, User, Bell, Palette, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SettingsPageComponent = () => {
  const user = useAuthStore(s => s.user);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [taskReminders, setTaskReminders] = useState(true);
  const [renewalAlerts, setRenewalAlerts] = useState(true);

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-surface-1 border border-border">
          <TabsTrigger value="profile" className="text-xs"><User className="h-3.5 w-3.5 mr-1" /> Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs"><Bell className="h-3.5 w-3.5 mr-1" /> Notifications</TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs"><Palette className="h-3.5 w-3.5 mr-1" /> Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4 mt-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-border bg-card p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Full Name</Label>
                <Input defaultValue={user?.full_name} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <Input defaultValue={user?.email} className="mt-1.5" disabled />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Timezone</Label>
                <Input defaultValue={user?.timezone} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Role</Label>
                <Input defaultValue={user?.role.replace('_', ' ')} className="mt-1.5 capitalize" disabled />
              </div>
            </div>
            <Button size="sm">Save Changes</Button>
          </motion.div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 mt-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-border bg-card p-5 space-y-4">
            {[
              { label: 'Email Notifications', desc: 'Receive email for task assignments and updates', checked: emailNotifs, onChange: setEmailNotifs },
              { label: 'Push Notifications', desc: 'Browser push notifications for urgent items', checked: pushNotifs, onChange: setPushNotifs },
              { label: 'Task Reminders', desc: 'Get reminded before task due dates', checked: taskReminders, onChange: setTaskReminders },
              { label: 'Renewal Alerts', desc: 'Alert when renewals are approaching', checked: renewalAlerts, onChange: setRenewalAlerts },
            ].map((item, i) => (
              <div key={item.label} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
                <Switch checked={item.checked} onCheckedChange={item.onChange} />
              </div>
            ))}
          </motion.div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4 mt-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Theme settings are available via the toggle in the top bar.</p>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPageComponent;
