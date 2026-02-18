import { useState } from 'react';
import { motion } from 'framer-motion';
import { mockTasks, type Task } from '@/stores/mockData';
import { useAuthStore } from '@/stores/authStore';
import { Plus, GripVertical, Calendar, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { exportToCSV } from '@/lib/csv';

const columns = [
  { id: 'todo' as const, label: 'To Do', color: 'bg-muted-foreground' },
  { id: 'in_progress' as const, label: 'In Progress', color: 'bg-primary' },
  { id: 'done' as const, label: 'Done', color: 'bg-success' },
  { id: 'blocked' as const, label: 'Blocked', color: 'bg-destructive' },
];

const priorityColors: Record<string, string> = {
  urgent: 'bg-destructive/10 text-destructive border-destructive/20',
  high: 'bg-warning/10 text-warning border-warning/20',
  medium: 'bg-info/10 text-info border-info/20',
  low: 'bg-muted text-muted-foreground border-border',
};

type View = 'kanban' | 'list';

function TaskCard({ task, index }: { task: Task; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="group rounded-lg border border-border bg-card p-3 hover:border-primary/30 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground/30 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-snug">{task.title}</p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`text-[10px] ${priorityColors[task.priority]}`}>
              {task.priority}
            </Badge>
            {task.related_name && (
              <span className="text-[10px] text-muted-foreground">{task.related_name}</span>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {task.due_date}
            </div>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[9px] font-bold text-primary">
              {task.assigned_to.charAt(0)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const Tasks = () => {
  const user = useAuthStore(s => s.user);
  const [view, setView] = useState<View>('kanban');
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo' as Task['status'],
    priority: 'medium' as Task['priority'],
    due_date: '2025-02-25',
    assigned_to: user?.role === 'employee' ? (user?.full_name || 'Jordan Smith') : 'Jordan Smith',
    related_name: '',
    tags: '',
  });

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    const task: Task = {
      id: String(tasks.length + 1),
      title: newTask.title,
      status: newTask.status,
      priority: newTask.priority,
      due_date: newTask.due_date,
      assigned_to: newTask.assigned_to,
      created_by: user?.full_name || 'Unknown',
      related_name: newTask.related_name || undefined,
      tags: newTask.tags ? newTask.tags.split(',').map(t => t.trim()) : [],
    };
    setTasks([task, ...tasks]);
    setShowAddModal(false);
    setNewTask({ title: '', description: '', status: 'todo', priority: 'medium', due_date: '2025-02-25', assigned_to: user?.role === 'employee' ? (user?.full_name || 'Jordan Smith') : 'Jordan Smith', related_name: '', tags: '' });
    toast.success(`Task "${task.title}" created`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">{tasks.length} tasks across all projects</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border overflow-hidden">
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === 'kanban' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Kanban
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              List
            </button>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => exportToCSV(tasks as unknown as Record<string, unknown>[], 'tasks')}>
            Export
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Task
          </Button>
        </div>
      </div>

      {view === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="rounded-lg bg-surface-1 p-3 min-h-[400px]">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className={`h-2 w-2 rounded-full ${col.color}`} />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{colTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {colTasks.map((task, i) => (
                    <TaskCard key={task.id} task={task} index={i} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Task</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Priority</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Due</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Assignee</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Created By</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, i) => (
                <motion.tr
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border hover:bg-secondary/20 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{task.title}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-[10px] capitalize">{task.status.replace('_', ' ')}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`text-[10px] ${priorityColors[task.priority]}`}>{task.priority}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{task.due_date}</td>
                  <td className="px-4 py-3 text-muted-foreground">{task.assigned_to}</td>
                  <td className="px-4 py-3 text-muted-foreground">{task.created_by || '—'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Task Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Title</Label>
              <Input className="mt-1" value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} placeholder="Task title..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Priority</Label>
                <Select value={newTask.priority} onValueChange={(v: Task['priority']) => setNewTask(p => ({ ...p, priority: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select value={newTask.status} onValueChange={(v: Task['status']) => setNewTask(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Due Date</Label>
              <Input type="date" className="mt-1" value={newTask.due_date} onChange={e => setNewTask(p => ({ ...p, due_date: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Assign To</Label>
              <Select value={newTask.assigned_to} onValueChange={v => setNewTask(p => ({ ...p, assigned_to: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Jordan Smith">Jordan Smith</SelectItem>
                  <SelectItem value="Alex Koldify">Alex Koldify</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Related To (optional)</Label>
              <Input className="mt-1" value={newTask.related_name} onChange={e => setNewTask(p => ({ ...p, related_name: e.target.value }))} placeholder="Client or project name..." />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Tags (comma separated)</Label>
              <Input className="mt-1" value={newTask.tags} onChange={e => setNewTask(p => ({ ...p, tags: e.target.value }))} placeholder="infra, campaign..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddTask}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;
