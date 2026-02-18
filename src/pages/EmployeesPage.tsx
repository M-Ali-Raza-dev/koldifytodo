import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { api, authTokenStorage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

const statusLabel: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  blocked: 'Blocked',
  done: 'Done',
};

const priorityLabel: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

type Employee = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status?: string;
  is_active?: boolean;
  last_login?: string;
};

type TaskItem = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
  assigned_to: string;
};

const EmployeesPage = () => {
    const formatLastLogin = (value?: string) => {
      if (!value) return '—';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '—';
      return date.toLocaleString();
    };
  const token = authTokenStorage.get();
  const currentUser = useAuthStore((s) => s.user);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date: string;
    tags: string;
  }>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
    tags: '',
  });

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;
      try {
        const [{ users }, { tasks: taskList }] = await Promise.all([
          api.getUsers(token),
          api.getTasks(token),
        ]);
        setEmployees(users.filter((u) => u.is_active !== false));
        setTasks(taskList as TaskItem[]);
      } catch (error) {
        console.error('Failed to load employees:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  const taskStats = useMemo(() => {
    return employees.map((employee) => {
      const assigned = tasks.filter((task) => task.assigned_to === employee.full_name);
      const done = assigned.filter((task) => task.status === 'done').length;
      return {
        employee,
        total: assigned.length,
        done,
        open: assigned.length - done,
      };
    });
  }, [employees, tasks]);

  const openAssignModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      due_date: '',
      tags: '',
    });
    setShowAssignModal(true);
  };

  const handleAssignTask = async () => {
    if (!token || !selectedEmployee || !formData.title.trim() || !formData.due_date) return;
    setSaving(true);
    try {
      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      await api.createTask(token, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date,
        assigned_to: selectedEmployee.full_name,
        related_name: selectedEmployee.full_name,
        tags,
      });

      const { tasks: updatedTasks } = await api.getTasks(token);
      setTasks(updatedTasks as TaskItem[]);
      setShowAssignModal(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error('Failed to assign task:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading employees...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
        <p className="text-sm text-muted-foreground mt-1">Track employee workload and assign new tasks</p>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Employee</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Last Login</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tasks Done</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Open Tasks</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {taskStats.map(({ employee, total, done, open }) => (
              <tr key={employee.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{employee.full_name}</div>
                  <div className="text-[11px] text-muted-foreground">{employee.email}</div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-[10px] capitalize">{employee.role.replace('_', ' ')}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${employee.is_active === false ? 'text-destructive' : 'text-success'}`}
                  >
                    {employee.is_active === false ? 'Inactive' : 'Active'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {formatLastLogin(employee.last_login)}
                </td>
                <td className="px-4 py-3 text-foreground font-medium">{done} / {total}</td>
                <td className="px-4 py-3 text-muted-foreground">{open}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" onClick={() => openAssignModal(employee)}>Assign Task</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAssignModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg shadow-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold">Assign Task</h2>
                <p className="text-xs text-muted-foreground">{selectedEmployee.full_name}</p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  type="text"
                  placeholder="Task title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Task details"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    {Object.entries(statusLabel).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    {Object.entries(priorityLabel).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tags (comma separated)</label>
                  <Input
                    type="text"
                    placeholder="ops, onboarding"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAssignModal(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignTask}
                  disabled={saving || !formData.title.trim() || !formData.due_date}
                >
                  {saving ? 'Assigning...' : 'Assign Task'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        Viewing as {currentUser?.full_name || 'user'}.
      </div>
    </div>
  );
};

export default EmployeesPage;
