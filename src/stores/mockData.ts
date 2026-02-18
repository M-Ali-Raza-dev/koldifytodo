// Mock data for MVP — all data access goes through this file
// When MongoDB is integrated, replace these with API calls

export interface Client {
  id: string;
  company_name: string;
  website: string;
  industry: string;
  status: 'active' | 'onboarding' | 'paused' | 'canceled';
  monthly_fee: number;
  start_date: string;
  renewal_date: string;
  main_contact_name: string;
  main_contact_email: string;
  guarantee_leads: number;
  guarantee_target: number;
  guarantee_status: 'safe' | 'at_risk' | 'critical' | 'met';
  guarantee_days_remaining: number;
}

export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string;
  assigned_to: string;
  created_by?: string;
  related_type?: string;
  related_name?: string;
  tags: string[];
}

export interface Tool {
  id: string;
  tool_name: string;
  vendor: string;
  cost: number;
  billing_cycle: 'monthly' | 'annual';
  renewal_date: string;
  autopay: boolean;
  status: 'active' | 'trial' | 'canceled';
}

export interface Tenant {
  id: string;
  tenant_name: string;
  vendor_name: string;
  monthly_cost: number;
  status: 'active' | 'warmup' | 'production' | 'paused' | 'banned';
  inbox_count: number;
  renewal_date: string;
}

export interface Inbox {
  id: string;
  tenant_id: string;
  email_address: string;
  status: 'warming' | 'active' | 'paused' | 'burned';
  daily_limit: number;
  warmup_stage: number;
  last_health_check: string;
}

export interface Domain {
  id: string;
  domain_name: string;
  registrar: string;
  status: 'new' | 'warming' | 'active' | 'burned';
  spf: boolean;
  dkim: boolean;
  dmarc: boolean;
  renewal_date: string;
  age_days: number;
}

export interface Campaign {
  id: string;
  name: string;
  client_name: string;
  status: 'draft' | 'live' | 'paused' | 'completed';
  emails_sent: number;
  open_rate: number;
  reply_rate: number;
  meetings_booked: number;
  start_date: string;
}

export interface CampaignMetric {
  id: string;
  campaign_id: string;
  date: string;
  emails_sent: number;
  opens: number;
  replies: number;
  positive_replies: number;
  bounces: number;
  spam_complaints: number;
  meetings_booked: number;
}

export interface AutomationJob {
  id: string;
  job_name: string;
  job_type: string;
  status: 'running' | 'success' | 'failed';
  started_at: string;
  ended_at?: string;
  error_message?: string;
  retries: number;
}

export interface ApiUsage {
  id: string;
  provider_name: string;
  date: string;
  requests_count: number;
  rate_limit_hits: number;
  cost_estimate: number;
}

export interface InfraHealth {
  id: string;
  tenant_id?: string;
  inbox_id?: string;
  date: string;
  bounce_rate: number;
  spam_rate: number;
  deliverability_score: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  duration_minutes: number;
  type: 'meeting' | 'task' | 'renewal' | 'deadline';
  meeting_link?: string;
  assigned_to: string;
  created_by: string;
  color?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  start_date: string;
  end_date?: string;
  members: string[];
  client_name?: string;
  progress: number;
}

export interface AuditLog {
  id: string;
  action: string;
  user_name: string;
  entity_type: string;
  entity_name: string;
  timestamp: string;
  details?: string;
}

export const mockClients: Client[] = [
  { id: '1', company_name: 'Apex Solutions', website: 'apex.io', industry: 'SaaS', status: 'active', monthly_fee: 3500, start_date: '2024-09-01', renewal_date: '2025-03-01', main_contact_name: 'Sarah Chen', main_contact_email: 'sarah@apex.io', guarantee_leads: 38, guarantee_target: 50, guarantee_status: 'safe', guarantee_days_remaining: 42 },
  { id: '2', company_name: 'Vertex AI', website: 'vertexai.com', industry: 'AI/ML', status: 'active', monthly_fee: 5000, start_date: '2024-10-15', renewal_date: '2025-04-15', main_contact_name: 'Mike Torres', main_contact_email: 'mike@vertexai.com', guarantee_leads: 22, guarantee_target: 50, guarantee_status: 'at_risk', guarantee_days_remaining: 28 },
  { id: '3', company_name: 'CloudNine Corp', website: 'cloudnine.co', industry: 'Cloud', status: 'active', monthly_fee: 4200, start_date: '2024-11-01', renewal_date: '2025-05-01', main_contact_name: 'Lisa Park', main_contact_email: 'lisa@cloudnine.co', guarantee_leads: 12, guarantee_target: 50, guarantee_status: 'critical', guarantee_days_remaining: 15 },
  { id: '4', company_name: 'DataFlow Inc', website: 'dataflow.io', industry: 'Data', status: 'onboarding', monthly_fee: 3000, start_date: '2025-01-10', renewal_date: '2025-07-10', main_contact_name: 'Tom Wright', main_contact_email: 'tom@dataflow.io', guarantee_leads: 0, guarantee_target: 50, guarantee_status: 'safe', guarantee_days_remaining: 88 },
  { id: '5', company_name: 'NexGen Labs', website: 'nexgen.dev', industry: 'DevTools', status: 'active', monthly_fee: 4500, start_date: '2024-08-01', renewal_date: '2025-02-01', main_contact_name: 'Amy Reed', main_contact_email: 'amy@nexgen.dev', guarantee_leads: 51, guarantee_target: 50, guarantee_status: 'met', guarantee_days_remaining: 0 },
  { id: '6', company_name: 'FinServe Pro', website: 'finserve.com', industry: 'FinTech', status: 'paused', monthly_fee: 3800, start_date: '2024-07-01', renewal_date: '2025-01-01', main_contact_name: 'David Kim', main_contact_email: 'david@finserve.com', guarantee_leads: 30, guarantee_target: 50, guarantee_status: 'at_risk', guarantee_days_remaining: 5 },
];

export const mockTasks: Task[] = [
  { id: '1', title: 'Set up email infrastructure for Apex', status: 'in_progress', priority: 'high', due_date: '2025-02-20', assigned_to: 'Jordan Smith', created_by: 'Alex Koldify', related_type: 'client', related_name: 'Apex Solutions', tags: ['infra'] },
  { id: '2', title: 'Launch campaign v2 for Vertex AI', status: 'todo', priority: 'urgent', due_date: '2025-02-19', assigned_to: 'Jordan Smith', created_by: 'Alex Koldify', related_type: 'campaign', related_name: 'Vertex AI', tags: ['campaign'] },
  { id: '3', title: 'Domain warmup check — batch 3', status: 'todo', priority: 'medium', due_date: '2025-02-21', assigned_to: 'Alex Koldify', created_by: 'Alex Koldify', related_type: 'domain', related_name: 'Batch 3', tags: ['domains'] },
  { id: '4', title: 'Client onboarding call — DataFlow', status: 'todo', priority: 'high', due_date: '2025-02-18', assigned_to: 'Jordan Smith', created_by: 'Alex Koldify', related_type: 'client', related_name: 'DataFlow Inc', tags: ['onboarding'] },
  { id: '5', title: 'Update DNS records for burned domains', status: 'blocked', priority: 'high', due_date: '2025-02-17', assigned_to: 'Alex Koldify', created_by: 'Jordan Smith', related_type: 'domain', tags: ['dns'] },
  { id: '6', title: 'Monthly tool audit & cost review', status: 'done', priority: 'medium', due_date: '2025-02-15', assigned_to: 'Alex Koldify', created_by: 'Alex Koldify', related_type: 'tool', tags: ['billing'] },
  { id: '7', title: 'Prepare Q1 campaign report', status: 'in_progress', priority: 'medium', due_date: '2025-02-22', assigned_to: 'Jordan Smith', created_by: 'Alex Koldify', tags: ['reporting'] },
  { id: '8', title: 'Fix Apify scraper — rate limit issue', status: 'todo', priority: 'urgent', due_date: '2025-02-18', assigned_to: 'Jordan Smith', created_by: 'Jordan Smith', related_type: 'automation', tags: ['automation', 'bug'] },
];

export const mockTools: Tool[] = [
  { id: '1', tool_name: 'Instantly', vendor: 'Instantly.ai', cost: 97, billing_cycle: 'monthly', renewal_date: '2025-03-01', autopay: true, status: 'active' },
  { id: '2', tool_name: 'Apify', vendor: 'Apify', cost: 49, billing_cycle: 'monthly', renewal_date: '2025-03-05', autopay: true, status: 'active' },
  { id: '3', tool_name: 'Smartlead', vendor: 'Smartlead.ai', cost: 79, billing_cycle: 'monthly', renewal_date: '2025-03-10', autopay: false, status: 'active' },
  { id: '4', tool_name: 'Clay', vendor: 'Clay.com', cost: 149, billing_cycle: 'monthly', renewal_date: '2025-03-15', autopay: true, status: 'active' },
  { id: '5', tool_name: 'Apollo', vendor: 'Apollo.io', cost: 99, billing_cycle: 'monthly', renewal_date: '2025-02-28', autopay: true, status: 'active' },
  { id: '6', tool_name: 'Zoho CRM', vendor: 'Zoho', cost: 420, billing_cycle: 'annual', renewal_date: '2025-09-01', autopay: false, status: 'active' },
];

export const mockTenants: Tenant[] = [
  { id: '1', tenant_name: 'Koldify Main', vendor_name: 'Microsoft 365', monthly_cost: 120, status: 'production', inbox_count: 12, renewal_date: '2025-04-01' },
  { id: '2', tenant_name: 'Koldify Warmup A', vendor_name: 'Microsoft 365', monthly_cost: 80, status: 'warmup', inbox_count: 8, renewal_date: '2025-04-01' },
  { id: '3', tenant_name: 'Apex Outbound', vendor_name: 'Google Workspace', monthly_cost: 96, status: 'active', inbox_count: 6, renewal_date: '2025-05-15' },
];

export const mockInboxes: Inbox[] = [
  { id: '1', tenant_id: '1', email_address: 'jordan@koldify-outreach.com', status: 'active', daily_limit: 50, warmup_stage: 100, last_health_check: '2025-02-17' },
  { id: '2', tenant_id: '1', email_address: 'alex@koldify-outreach.com', status: 'active', daily_limit: 50, warmup_stage: 100, last_health_check: '2025-02-17' },
  { id: '3', tenant_id: '1', email_address: 'outreach1@koldify-outreach.com', status: 'active', daily_limit: 40, warmup_stage: 100, last_health_check: '2025-02-16' },
  { id: '4', tenant_id: '2', email_address: 'warm1@koldify-warm.com', status: 'warming', daily_limit: 15, warmup_stage: 45, last_health_check: '2025-02-17' },
  { id: '5', tenant_id: '2', email_address: 'warm2@koldify-warm.com', status: 'warming', daily_limit: 15, warmup_stage: 38, last_health_check: '2025-02-17' },
  { id: '6', tenant_id: '3', email_address: 'reach@getapex.io', status: 'active', daily_limit: 35, warmup_stage: 100, last_health_check: '2025-02-16' },
  { id: '7', tenant_id: '3', email_address: 'sales@getapex.io', status: 'paused', daily_limit: 0, warmup_stage: 100, last_health_check: '2025-02-10' },
  { id: '8', tenant_id: '1', email_address: 'burned@coldreach.io', status: 'burned', daily_limit: 0, warmup_stage: 100, last_health_check: '2025-02-05' },
];

export const mockDomains: Domain[] = [
  { id: '1', domain_name: 'koldify-outreach.com', registrar: 'Namecheap', status: 'active', spf: true, dkim: true, dmarc: true, renewal_date: '2025-11-01', age_days: 180 },
  { id: '2', domain_name: 'getapex.io', registrar: 'GoDaddy', status: 'warming', spf: true, dkim: true, dmarc: false, renewal_date: '2025-08-15', age_days: 45 },
  { id: '3', domain_name: 'vertex-mail.com', registrar: 'Cloudflare', status: 'active', spf: true, dkim: true, dmarc: true, renewal_date: '2025-10-01', age_days: 120 },
  { id: '4', domain_name: 'coldreach.io', registrar: 'Namecheap', status: 'burned', spf: false, dkim: false, dmarc: false, renewal_date: '2025-06-01', age_days: 90 },
];

export const mockCampaigns: Campaign[] = [
  { id: '1', name: 'Apex Q1 Outbound', client_name: 'Apex Solutions', status: 'live', emails_sent: 4500, open_rate: 62, reply_rate: 8.2, meetings_booked: 12, start_date: '2025-01-15' },
  { id: '2', name: 'Vertex Decision Makers', client_name: 'Vertex AI', status: 'live', emails_sent: 3200, open_rate: 55, reply_rate: 5.1, meetings_booked: 6, start_date: '2025-01-20' },
  { id: '3', name: 'CloudNine CTO Reach', client_name: 'CloudNine Corp', status: 'paused', emails_sent: 1800, open_rate: 48, reply_rate: 3.5, meetings_booked: 3, start_date: '2025-02-01' },
  { id: '4', name: 'NexGen DevOps Leaders', client_name: 'NexGen Labs', status: 'completed', emails_sent: 6000, open_rate: 67, reply_rate: 9.8, meetings_booked: 18, start_date: '2024-11-01' },
];

export const mockCampaignMetrics: CampaignMetric[] = [
  { id: '1', campaign_id: '1', date: '2025-01-15', emails_sent: 500, opens: 310, replies: 41, positive_replies: 28, bounces: 12, spam_complaints: 2, meetings_booked: 1 },
  { id: '2', campaign_id: '1', date: '2025-01-22', emails_sent: 800, opens: 496, replies: 66, positive_replies: 45, bounces: 18, spam_complaints: 3, meetings_booked: 3 },
  { id: '3', campaign_id: '1', date: '2025-01-29', emails_sent: 1200, opens: 744, replies: 98, positive_replies: 67, bounces: 25, spam_complaints: 4, meetings_booked: 4 },
  { id: '4', campaign_id: '1', date: '2025-02-05', emails_sent: 1000, opens: 620, replies: 82, positive_replies: 56, bounces: 20, spam_complaints: 2, meetings_booked: 2 },
  { id: '5', campaign_id: '1', date: '2025-02-12', emails_sent: 1000, opens: 620, replies: 82, positive_replies: 56, bounces: 15, spam_complaints: 1, meetings_booked: 2 },
  { id: '6', campaign_id: '2', date: '2025-01-20', emails_sent: 600, opens: 330, replies: 31, positive_replies: 18, bounces: 15, spam_complaints: 3, meetings_booked: 1 },
  { id: '7', campaign_id: '2', date: '2025-01-27', emails_sent: 900, opens: 495, replies: 46, positive_replies: 28, bounces: 22, spam_complaints: 4, meetings_booked: 2 },
  { id: '8', campaign_id: '2', date: '2025-02-03', emails_sent: 850, opens: 468, replies: 43, positive_replies: 25, bounces: 18, spam_complaints: 2, meetings_booked: 1 },
  { id: '9', campaign_id: '2', date: '2025-02-10', emails_sent: 850, opens: 468, replies: 43, positive_replies: 25, bounces: 16, spam_complaints: 2, meetings_booked: 2 },
];

export const mockAutomationJobs: AutomationJob[] = [
  { id: '1', job_name: 'Apex Lead Scraper', job_type: 'scraper', status: 'success', started_at: '2025-02-18T08:00:00', ended_at: '2025-02-18T08:12:34', retries: 0 },
  { id: '2', job_name: 'Vertex ICP Enrichment', job_type: 'enrichment', status: 'success', started_at: '2025-02-18T06:00:00', ended_at: '2025-02-18T06:45:12', retries: 0 },
  { id: '3', job_name: 'Apify LinkedIn Scrape — Batch 12', job_type: 'scraper', status: 'failed', started_at: '2025-02-17T22:00:00', ended_at: '2025-02-17T22:03:45', error_message: 'Rate limit exceeded — 429 Too Many Requests', retries: 3 },
  { id: '4', job_name: 'Domain Health Checker', job_type: 'health_check', status: 'success', started_at: '2025-02-17T12:00:00', ended_at: '2025-02-17T12:08:22', retries: 0 },
  { id: '5', job_name: 'Instantly Campaign Sync', job_type: 'sync', status: 'running', started_at: '2025-02-18T09:30:00', retries: 0 },
  { id: '6', job_name: 'CloudNine Lead Export', job_type: 'export', status: 'failed', started_at: '2025-02-16T14:00:00', ended_at: '2025-02-16T14:01:10', error_message: 'Authentication token expired — refresh failed', retries: 2 },
  { id: '7', job_name: 'Email Warmup Rotation', job_type: 'warmup', status: 'success', started_at: '2025-02-18T05:00:00', ended_at: '2025-02-18T05:22:00', retries: 0 },
  { id: '8', job_name: 'Bounce Rate Monitor', job_type: 'monitor', status: 'success', started_at: '2025-02-18T07:00:00', ended_at: '2025-02-18T07:05:30', retries: 0 },
];

export const mockApiUsage: ApiUsage[] = [
  { id: '1', provider_name: 'Apify', date: '2025-02-18', requests_count: 2340, rate_limit_hits: 12, cost_estimate: 8.50 },
  { id: '2', provider_name: 'Instantly', date: '2025-02-18', requests_count: 890, rate_limit_hits: 0, cost_estimate: 0 },
  { id: '3', provider_name: 'Apollo', date: '2025-02-18', requests_count: 1200, rate_limit_hits: 3, cost_estimate: 12.00 },
  { id: '4', provider_name: 'Clay', date: '2025-02-18', requests_count: 560, rate_limit_hits: 0, cost_estimate: 4.20 },
  { id: '5', provider_name: 'Apify', date: '2025-02-17', requests_count: 3100, rate_limit_hits: 28, cost_estimate: 11.20 },
  { id: '6', provider_name: 'Apollo', date: '2025-02-17', requests_count: 980, rate_limit_hits: 1, cost_estimate: 9.80 },
];

export const mockInfraHealth: InfraHealth[] = [
  { id: '1', tenant_id: '1', date: '2025-02-18', bounce_rate: 2.1, spam_rate: 0.3, deliverability_score: 97.2 },
  { id: '2', tenant_id: '2', date: '2025-02-18', bounce_rate: 4.5, spam_rate: 1.2, deliverability_score: 91.8 },
  { id: '3', tenant_id: '3', date: '2025-02-18', bounce_rate: 3.0, spam_rate: 0.8, deliverability_score: 94.5 },
  { id: '4', tenant_id: '1', date: '2025-02-17', bounce_rate: 1.8, spam_rate: 0.2, deliverability_score: 97.8 },
  { id: '5', tenant_id: '2', date: '2025-02-17', bounce_rate: 5.2, spam_rate: 1.5, deliverability_score: 89.3 },
];

export const mockCalendarEvents: CalendarEvent[] = [
  { id: '1', title: 'Apex Solutions — Weekly Sync', description: 'Review campaign metrics and lead pipeline', date: '2025-02-18', time: '10:00', duration_minutes: 30, type: 'meeting', meeting_link: 'https://meet.google.com/abc-defg-hij', assigned_to: 'Jordan Smith', created_by: 'Alex Koldify' },
  { id: '2', title: 'DataFlow Onboarding Kickoff', description: 'Initial setup call with DataFlow team', date: '2025-02-18', time: '14:00', duration_minutes: 60, type: 'meeting', meeting_link: 'https://zoom.us/j/123456789', assigned_to: 'Jordan Smith', created_by: 'Alex Koldify' },
  { id: '3', title: 'Team Standup', description: 'Daily standup — review blockers', date: '2025-02-19', time: '09:00', duration_minutes: 15, type: 'meeting', meeting_link: 'https://meet.google.com/xyz-uvwx-rst', assigned_to: 'Jordan Smith', created_by: 'Alex Koldify' },
  { id: '4', title: 'Vertex AI Strategy Review', description: 'Discuss campaign pivot for Q2', date: '2025-02-19', time: '11:00', duration_minutes: 45, type: 'meeting', meeting_link: 'https://zoom.us/j/987654321', assigned_to: 'Alex Koldify', created_by: 'Alex Koldify' },
  { id: '5', title: 'Domain Renewal Check', description: 'Review upcoming domain renewals', date: '2025-02-20', time: '09:00', duration_minutes: 30, type: 'task', assigned_to: 'Alex Koldify', created_by: 'Alex Koldify' },
  { id: '6', title: 'Smartlead Renewal Due', description: 'Smartlead.ai subscription renewal', date: '2025-03-10', time: '00:00', duration_minutes: 0, type: 'renewal', assigned_to: 'Alex Koldify', created_by: 'System' },
  { id: '7', title: 'CloudNine Guarantee Deadline', description: 'CloudNine Corp guarantee window closes', date: '2025-03-05', time: '00:00', duration_minutes: 0, type: 'deadline', assigned_to: 'Jordan Smith', created_by: 'System' },
  { id: '8', title: 'Campaign Performance Review', description: 'Monthly campaign performance deep dive with full team', date: '2025-02-21', time: '15:00', duration_minutes: 60, type: 'meeting', meeting_link: 'https://meet.google.com/monthly-review', assigned_to: 'Jordan Smith', created_by: 'Alex Koldify' },
  { id: '9', title: 'NexGen Labs QBR Prep', description: 'Prepare quarterly business review deck', date: '2025-02-22', time: '10:00', duration_minutes: 120, type: 'task', assigned_to: 'Jordan Smith', created_by: 'Alex Koldify' },
];

export const mockProjects: Project[] = [
  { id: '1', name: 'Apex Q1 Campaign', description: 'Full outbound campaign execution for Apex Solutions Q1 targets', status: 'active', start_date: '2025-01-01', end_date: '2025-03-31', members: ['Jordan Smith', 'Alex Koldify'], client_name: 'Apex Solutions', progress: 65 },
  { id: '2', name: 'Vertex AI Expansion', description: 'Scale outbound for Vertex AI — target CTO/VP Eng titles', status: 'active', start_date: '2025-01-15', members: ['Jordan Smith'], client_name: 'Vertex AI', progress: 40 },
  { id: '3', name: 'Infrastructure Scale-Up', description: 'Add 20 new inboxes, 5 domains, warm up for Q2 volume', status: 'active', start_date: '2025-02-01', end_date: '2025-03-15', members: ['Alex Koldify', 'Jordan Smith'], progress: 30 },
  { id: '4', name: 'DataFlow Onboarding', description: 'Full onboarding workflow for new client DataFlow Inc', status: 'active', start_date: '2025-01-10', end_date: '2025-02-28', members: ['Jordan Smith'], client_name: 'DataFlow Inc', progress: 55 },
  { id: '5', name: 'NexGen QBR', description: 'Prepare and deliver Q1 business review for NexGen Labs', status: 'completed', start_date: '2024-12-15', end_date: '2025-01-31', members: ['Alex Koldify'], client_name: 'NexGen Labs', progress: 100 },
];

export const mockAuditLogs: AuditLog[] = [
  { id: '1', action: 'create', user_name: 'Alex Koldify', entity_type: 'task', entity_name: 'Launch campaign v2 for Vertex AI', timestamp: '2025-02-18T09:15:00', details: 'Created task with urgent priority' },
  { id: '2', action: 'update', user_name: 'Jordan Smith', entity_type: 'campaign', entity_name: 'Apex Q1 Outbound', timestamp: '2025-02-18T08:45:00', details: 'Updated daily send volume from 100 to 150' },
  { id: '3', action: 'create', user_name: 'Alex Koldify', entity_type: 'meeting', entity_name: 'DataFlow Onboarding Kickoff', timestamp: '2025-02-17T16:30:00', details: 'Scheduled meeting for Jordan Smith' },
  { id: '4', action: 'update', user_name: 'System', entity_type: 'domain', entity_name: 'coldreach.io', timestamp: '2025-02-17T12:00:00', details: 'Status changed from active to burned — blacklisted' },
  { id: '5', action: 'delete', user_name: 'Alex Koldify', entity_type: 'inbox', entity_name: 'burned@coldreach.io', timestamp: '2025-02-17T12:05:00', details: 'Removed burned inbox from rotation' },
  { id: '6', action: 'update', user_name: 'Jordan Smith', entity_type: 'task', entity_name: 'Set up email infrastructure for Apex', timestamp: '2025-02-17T10:00:00', details: 'Status changed from todo to in_progress' },
  { id: '7', action: 'create', user_name: 'Alex Koldify', entity_type: 'client', entity_name: 'DataFlow Inc', timestamp: '2025-01-10T09:00:00', details: 'New client onboarded — $3000/mo' },
  { id: '8', action: 'update', user_name: 'System', entity_type: 'guarantee', entity_name: 'NexGen Labs', timestamp: '2025-02-01T00:00:00', details: 'Guarantee status changed to met — 51/50 leads' },
];

// Dashboard KPIs
export const dashboardKPIs = {
  totalMRR: 24000,
  monthlyExpenses: 3870,
  grossMargin: 83.9,
  activeClients: 5,
  leadsThisMonth: 142,
  meetingsThisMonth: 28,
  avgDeliverability: 94.2,
  burnedDomains: 1,
  tenantUtilization: 87,
};

// Chart data
export const mrrTrendData = [
  { month: 'Sep', mrr: 7000 },
  { month: 'Oct', mrr: 12000 },
  { month: 'Nov', mrr: 16500 },
  { month: 'Dec', mrr: 20200 },
  { month: 'Jan', mrr: 24000 },
  { month: 'Feb', mrr: 24000 },
];

export const leadsMetricsData = [
  { month: 'Sep', leads: 45, meetings: 8 },
  { month: 'Oct', leads: 78, meetings: 15 },
  { month: 'Nov', leads: 95, meetings: 20 },
  { month: 'Dec', leads: 110, meetings: 22 },
  { month: 'Jan', leads: 130, meetings: 26 },
  { month: 'Feb', leads: 142, meetings: 28 },
];

export const expensesTrendData = [
  { month: 'Sep', expenses: 2100 },
  { month: 'Oct', expenses: 2600 },
  { month: 'Nov', expenses: 3100 },
  { month: 'Dec', expenses: 3400 },
  { month: 'Jan', expenses: 3700 },
  { month: 'Feb', expenses: 3870 },
];
