import { motion } from 'framer-motion';
import { mockProjects } from '@/stores/mockData';
import { FolderKanban, Users, Calendar, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const statusColors: Record<string, string> = {
  active: 'bg-success/10 text-success',
  completed: 'bg-info/10 text-info',
  paused: 'bg-warning/10 text-warning',
};

const ProjectsPage = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">{mockProjects.length} projects</p>
        </div>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Project</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockProjects.map((project, i) => (
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
                <h3 className="text-sm font-semibold text-foreground">{project.name}</h3>
              </div>
              <Badge variant="outline" className={`text-[10px] ${statusColors[project.status]}`}>{project.status}</Badge>
            </div>

            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{project.description}</p>

            {project.client_name && (
              <p className="text-[11px] text-muted-foreground mb-2">Client: <span className="text-foreground font-medium">{project.client_name}</span></p>
            )}

            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-muted-foreground">Progress</span>
                <span className="text-[11px] font-semibold text-foreground">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-1.5" />
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {project.members.length} members
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {project.start_date}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
