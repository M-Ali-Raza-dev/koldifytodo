import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { mockCalendarEvents, type CalendarEvent } from '@/stores/mockData';
import { useAuthStore } from '@/stores/authStore';
import { api, authTokenStorage } from '@/lib/api';
import { Calendar, Clock, Video, Plus, ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const typeColors: Record<string, string> = {
  meeting: 'bg-primary/10 text-primary border-l-primary',
  task: 'bg-info/10 text-info border-l-info',
  renewal: 'bg-warning/10 text-warning border-l-warning',
  deadline: 'bg-destructive/10 text-destructive border-l-destructive',
};

const typeLabels: Record<string, string> = {
  meeting: 'Meeting',
  task: 'Task',
  renewal: 'Renewal',
  deadline: 'Deadline',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const CalendarPage = () => {
  const user = useAuthStore(s => s.user);
  const token = authTokenStorage.get();
  const isCEO = user?.role === 'ceo' || user?.role === 'super_admin';

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 1, 18)); // Feb 2025
  const [selectedDate, setSelectedDate] = useState<string | null>('2025-02-18');
  const [showAddModal, setShowAddModal] = useState(false);
  const [view, setView] = useState<'month' | 'week'>('month');

  // Fetch calendar events from MongoDB
  useEffect(() => {
    const loadEvents = async () => {
      if (!token) return;
      try {
        const response = await api.getCalendarEvents(token);
        const dbEvents = response.events.map((e: any) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          date: e.start_date.split('T')[0],
          time: new Date(e.start_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          duration_minutes: Math.round((new Date(e.end_date).getTime() - new Date(e.start_date).getTime()) / (1000 * 60)),
          type: e.event_type as CalendarEvent['type'],
          meeting_link: '',
          assigned_to: e.attendees[0] || user?.full_name || 'Unknown',
          created_by: e.created_by,
        }));
        setEvents(dbEvents);
      } catch (error) {
        console.error('Failed to load calendar events:', error);
        // Fallback to mock data
        setEvents(mockCalendarEvents);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, [token]);

  // New event form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '2025-02-20',
    time: '10:00',
    duration_minutes: 30,
    type: 'meeting' as CalendarEvent['type'],
    meeting_link: '',
    assigned_to: 'Jordan Smith',
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDate = (dateStr: string) => events.filter(e => e.date === dateStr);

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const handleAddEvent = async () => {
    if (!newEvent.title.trim()) {
      toast.error('Please enter an event title');
      return;
    }
    if (!token) {
      toast.error('Not authenticated');
      return;
    }
    try {
      const startDate = new Date(`${newEvent.date}T${newEvent.time}`);
      const endDate = new Date(startDate.getTime() + newEvent.duration_minutes * 60000);
      
      const response = await api.createCalendarEvent(token, {
        title: newEvent.title,
        description: newEvent.description,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        event_type: newEvent.type,
        attendees: [newEvent.assigned_to],
      });

      const dbEvent = {
        id: response.event.id,
        title: response.event.title,
        description: response.event.description,
        date: newEvent.date,
        time: newEvent.time,
        duration_minutes: newEvent.duration_minutes,
        type: newEvent.type,
        meeting_link: newEvent.meeting_link,
        assigned_to: newEvent.assigned_to,
        created_by: user?.full_name || 'Unknown',
      };
      setEvents([...events, dbEvent]);
      setShowAddModal(false);
      setNewEvent({ title: '', description: '', date: '2025-02-20', time: '10:00', duration_minutes: 30, type: 'meeting', meeting_link: '', assigned_to: 'Jordan Smith' });
      toast.success(`Event "${response.event.title}" saved to calendar`);
    } catch (error) {
      toast.error('Failed to save event');
      console.error(error);
    }
  };

  // Build calendar grid
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">Meetings, deadlines, and renewals</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-md border border-border overflow-hidden">
            <button onClick={() => setView('month')} className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === 'month' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Month</button>
            <button onClick={() => setView('week')} className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === 'week' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Week</button>
          </div>
          {isCEO && (
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Event
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 rounded-lg border border-border bg-card p-4"
        >
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-secondary/50 transition-colors">
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            <h3 className="text-sm font-semibold text-foreground">{MONTHS[month]} {year}</h3>
            <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-secondary/50 transition-colors">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} className="h-20" />;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = getEventsForDate(dateStr);
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === '2025-02-18';

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-20 rounded-md p-1 cursor-pointer transition-all duration-200 border ${
                    isSelected ? 'border-primary bg-primary/5' :
                    isToday ? 'border-primary/30 bg-primary/5' :
                    'border-transparent hover:bg-secondary/30'
                  }`}
                >
                  <span className={`text-xs font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>{day}</span>
                  <div className="mt-0.5 space-y-0.5 overflow-hidden">
                    {dayEvents.slice(0, 2).map(e => (
                      <div key={e.id} className={`text-[9px] px-1 py-0.5 rounded truncate border-l-2 ${typeColors[e.type]}`}>
                        {e.title.slice(0, 18)}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-muted-foreground">+{dayEvents.length - 2} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Event detail panel */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-lg border border-border bg-card p-4"
        >
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date'}
          </h3>

          {selectedDateEvents.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No events on this date</p>
              {isCEO && (
                <Button size="sm" variant="outline" className="mt-3" onClick={() => {
                  setNewEvent(prev => ({ ...prev, date: selectedDate || prev.date }));
                  setShowAddModal(true);
                }}>
                  <Plus className="h-3 w-3 mr-1" /> Add Event
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDateEvents.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-md border border-border bg-surface-1 p-3 border-l-2 ${typeColors[event.type]}`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-sm font-medium text-foreground">{event.title}</h4>
                    <Badge variant="outline" className={`text-[10px] ${typeColors[event.type]}`}>{typeLabels[event.type]}</Badge>
                  </div>
                  {event.description && <p className="text-[11px] text-muted-foreground mb-2">{event.description}</p>}
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    {event.time !== '00:00' && (
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.time}</span>
                    )}
                    {event.duration_minutes > 0 && <span>{event.duration_minutes}min</span>}
                  </div>
                  {event.meeting_link && (
                    <a href={event.meeting_link} target="_blank" rel="noopener noreferrer"
                      className="mt-2 flex items-center gap-1 text-[11px] text-primary hover:underline">
                      <Video className="h-3 w-3" /> Join Meeting <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <div className="mt-2 text-[10px] text-muted-foreground">
                    Assigned: <span className="text-foreground">{event.assigned_to}</span>
                    {event.created_by !== event.assigned_to && <> · By: <span className="text-foreground">{event.created_by}</span></>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Event Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add Calendar Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Title</Label>
              <Input className="mt-1" value={newEvent.title} onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value }))} placeholder="Meeting title..." />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea className="mt-1 min-h-[60px]" value={newEvent.description} onChange={e => setNewEvent(prev => ({ ...prev, description: e.target.value }))} placeholder="Optional description..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Date</Label>
                <Input type="date" className="mt-1" value={newEvent.date} onChange={e => setNewEvent(prev => ({ ...prev, date: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Time</Label>
                <Input type="time" className="mt-1" value={newEvent.time} onChange={e => setNewEvent(prev => ({ ...prev, time: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Duration (min)</Label>
                <Input type="number" className="mt-1" value={newEvent.duration_minutes} onChange={e => setNewEvent(prev => ({ ...prev, duration_minutes: Number(e.target.value) }))} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Type</Label>
                <Select value={newEvent.type} onValueChange={(v: CalendarEvent['type']) => setNewEvent(prev => ({ ...prev, type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {newEvent.type === 'meeting' && (
              <div>
                <Label className="text-xs text-muted-foreground">Meeting Link</Label>
                <Input className="mt-1" value={newEvent.meeting_link} onChange={e => setNewEvent(prev => ({ ...prev, meeting_link: e.target.value }))} placeholder="https://zoom.us/j/..." />
              </div>
            )}
            <div>
              <Label className="text-xs text-muted-foreground">Assign To</Label>
              <Select value={newEvent.assigned_to} onValueChange={v => setNewEvent(prev => ({ ...prev, assigned_to: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Jordan Smith">Jordan Smith</SelectItem>
                  <SelectItem value="Alex Koldify">Alex Koldify</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddEvent}>Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
