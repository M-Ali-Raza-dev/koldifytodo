import { motion } from 'framer-motion';
import { mockProjects } from '@/stores/mockData';
import { useAuthStore } from '@/stores/authStore';
import { api, authTokenStorage } from '@/lib/api';
import { FolderKanban, Users, Calendar, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

const statusColors: Record<string, string> = {
  planning: 'bg-info/10 text-info',
  in_progress: 'bg-success/10 text-success',
  completed: 'bg-success/10 text-success',
  on_hold: 'bg-warning/10 text-warning',
};

const ProjectsPage = () => {
  const user = useAuthStore((s) => s.user);
  const token = authTokenStorage.get();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ project_name: '', description: '', budget: 0, status: 'planning', start_date: '' });
  const [saving, setSaving] = useState(false);

  // Fetch projects from MongoDB
  useEffect(() => {
    const loadProjects = async () => {
      if (!token) return;
      try {
        const response = await api.getProjects(token);
        setProjects(response.projects);
      } catch (error) {
        console.error('Failed to load projects:', error);
        // Fallback to mock data
        setProjects(mockProjects);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, [token]);

  const handleAddProject = async () => {
    if (!formData.project_name || !formData.start_date) {
      alert('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      await api.createProject(token, {
        project_name: formData.project_name,
        description: formData.description,
        status: formData.status,
        start_date: formData.start_date,
        budget: parseFloat(formData.budget.toString()),
        team_members: [],
      });
      const response = await api.getProjects(token);
      setProjects(response.projects);
      setShowAddModal(false);
      setFormData({ project_name: '', description: '', budget: 0, status: 'active', start_date: '' });
    } catch (error) {
      console.error('Failed to add project:', error);
      alert('Failed to add project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">{projects.length} projects</p>
        </div>
        <Button size="sm" onClick={() => setShowAddModal(true)}><Plus className="h-4 w-4 mr-1" /> New Project</Button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Project</h2>
              <button onClick={() => setShowAddModal(false)}><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground">Project Name *</label>
                <Input placeholder="Project Acme Phase 2" value={formData.project_name} onChange={(e) => setFormData({...formData, project_name: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <Input placeholder="Brief description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Budget *</label>
                <Input type="number" placeholder="50000" value={formData.budget} onChange={(e) => setFormData({...formData, budget: parseFloat(e.target.value) || 0})} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Start Date</label>
                <Input type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm">
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
                <Button size="sm" onClick={handleAddProject} disabled={saving} className="flex-1">{saving ? 'Adding...' : 'Create Project'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">{project.project_name}</h3>
              </div>
              <Badge variant="outline" className={`text-[10px] ${statusColors[project.status] || 'bg-muted text-muted-foreground'}`}>{project.status}</Badge>
            </div>

            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{project.description}</p>

            {project.client_id && (
              <p className="text-[11px] text-muted-foreground mb-2">Client: <span className="text-foreground font-medium">{project.client_id}</span></p>
            )}

            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-muted-foreground">Budget</span>
                <span className="text-[11px] font-semibold text-foreground">${project.budget?.toLocaleString() || 0}</span>
              </div>
              <Progress value={project.budget && project.spent ? (project.spent / project.budget) * 100 : 0} className="h-1.5" />
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {project.team_members?.length || 0} members
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {project.start_date ? new Date(project.start_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) : 'N/A'}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
