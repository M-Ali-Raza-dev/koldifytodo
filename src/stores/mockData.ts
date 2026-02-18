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

export const mockClients: Client[] = [
  { id: '1', company_name: 'Apex Solutions', website: 'apex.io', industry: 'SaaS', status: 'active', monthly_fee: 3500, start_date: '2024-09-01', renewal_date: '2025-03-01', main_contact_name: 'Sarah Chen', main_contact_email: 'sarah@apex.io', guarantee_leads: 38, guarantee_target: 50, guarantee_status: 'safe', guarantee_days_remaining: 42 },
  { id: '2', company_name: 'Vertex AI', website: 'vertexai.com', industry: 'AI/ML', status: 'active', monthly_fee: 5000, start_date: '2024-10-15', renewal_date: '2025-04-15', main_contact_name: 'Mike Torres', main_contact_email: 'mike@vertexai.com', guarantee_leads: 22, guarantee_target: 50, guarantee_status: 'at_risk', guarantee_days_remaining: 28 },
  { id: '3', company_name: 'CloudNine Corp', website: 'cloudnine.co', industry: 'Cloud', status: 'active', monthly_fee: 4200, start_date: '2024-11-01', renewal_date: '2025-05-01', main_contact_name: 'Lisa Park', main_contact_email: 'lisa@cloudnine.co', guarantee_leads: 12, guarantee_target: 50, guarantee_status: 'critical', guarantee_days_remaining: 15 },
  { id: '4', company_name: 'DataFlow Inc', website: 'dataflow.io', industry: 'Data', status: 'onboarding', monthly_fee: 3000, start_date: '2025-01-10', renewal_date: '2025-07-10', main_contact_name: 'Tom Wright', main_contact_email: 'tom@dataflow.io', guarantee_leads: 0, guarantee_target: 50, guarantee_status: 'safe', guarantee_days_remaining: 88 },
  { id: '5', company_name: 'NexGen Labs', website: 'nexgen.dev', industry: 'DevTools', status: 'active', monthly_fee: 4500, start_date: '2024-08-01', renewal_date: '2025-02-01', main_contact_name: 'Amy Reed', main_contact_email: 'amy@nexgen.dev', guarantee_leads: 51, guarantee_target: 50, guarantee_status: 'met', guarantee_days_remaining: 0 },
  { id: '6', company_name: 'FinServe Pro', website: 'finserve.com', industry: 'FinTech', status: 'paused', monthly_fee: 3800, start_date: '2024-07-01', renewal_date: '2025-01-01', main_contact_name: 'David Kim', main_contact_email: 'david@finserve.com', guarantee_leads: 30, guarantee_target: 50, guarantee_status: 'at_risk', guarantee_days_remaining: 5 },
];

export const mockTasks: Task[] = [
  { id: '1', title: 'Set up email infrastructure for Apex', status: 'in_progress', priority: 'high', due_date: '2025-02-20', assigned_to: 'Jordan Smith', related_type: 'client', related_name: 'Apex Solutions', tags: ['infra'] },
  { id: '2', title: 'Launch campaign v2 for Vertex AI', status: 'todo', priority: 'urgent', due_date: '2025-02-19', assigned_to: 'Jordan Smith', related_type: 'campaign', related_name: 'Vertex AI', tags: ['campaign'] },
  { id: '3', title: 'Domain warmup check — batch 3', status: 'todo', priority: 'medium', due_date: '2025-02-21', assigned_to: 'Alex Koldify', related_type: 'domain', related_name: 'Batch 3', tags: ['domains'] },
  { id: '4', title: 'Client onboarding call — DataFlow', status: 'todo', priority: 'high', due_date: '2025-02-18', assigned_to: 'Jordan Smith', related_type: 'client', related_name: 'DataFlow Inc', tags: ['onboarding'] },
  { id: '5', title: 'Update DNS records for burned domains', status: 'blocked', priority: 'high', due_date: '2025-02-17', assigned_to: 'Alex Koldify', related_type: 'domain', tags: ['dns'] },
  { id: '6', title: 'Monthly tool audit & cost review', status: 'done', priority: 'medium', due_date: '2025-02-15', assigned_to: 'Alex Koldify', related_type: 'tool', tags: ['billing'] },
  { id: '7', title: 'Prepare Q1 campaign report', status: 'in_progress', priority: 'medium', due_date: '2025-02-22', assigned_to: 'Jordan Smith', tags: ['reporting'] },
  { id: '8', title: 'Fix Apify scraper — rate limit issue', status: 'todo', priority: 'urgent', due_date: '2025-02-18', assigned_to: 'Jordan Smith', related_type: 'automation', tags: ['automation', 'bug'] },
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
