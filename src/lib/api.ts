import type { User } from '@/stores/authStore';
import type { Task } from '@/stores/mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'koldify_token';

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
};

const parseError = async (response: Response) => {
  try {
    const data = await response.json();
    return data?.message || 'Request failed';
  } catch {
    return 'Request failed';
  }
};

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const authTokenStorage = {
  get() {
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
  },
};

type AuthPayload = {
  token: string;
  user: User;
};

export const api = {
  async signup(data: { full_name: string; email: string; password: string }): Promise<AuthPayload> {
    return request<AuthPayload>('/auth/signup', { method: 'POST', body: data });
  },

  async login(data: { email: string; password: string }): Promise<AuthPayload> {
    return request<AuthPayload>('/auth/login', { method: 'POST', body: data });
  },

  async me(token: string): Promise<{ user: User }> {
    return request<{ user: User }>('/auth/me', { token });
  },

  async getUsers(token: string): Promise<{ users: User[] }> {
    return request<{ users: User[] }>('/users', { token });
  },

  async createUser(token: string, data: { full_name: string; email: string; password: string; role: User['role'] }) {
    return request<{ user: User }>('/users', { method: 'POST', token, body: data });
  },

  async updateUser(token: string, userId: string, data: { full_name?: string; role?: User['role']; is_active?: boolean }) {
    return request<{ user: User }>(`/users/${userId}`, { method: 'PATCH', token, body: data });
  },

  async resetUserPassword(token: string, userId: string, password: string) {
    return request<{ message: string }>(`/users/${userId}/password`, { method: 'PATCH', token, body: { password } });
  },

  async deleteUser(token: string, userId: string) {
    return request<void>(`/users/${userId}`, { method: 'DELETE', token });
  },

  async setElevatedAccess(
    token: string,
    userId: string,
    data: { module: string; expires_in_hours?: number; revoke?: boolean },
  ) {
    return request<{ user: User }>(`/users/${userId}/elevated-access`, { method: 'PATCH', token, body: data });
  },

  async getAuditLogs(token: string) {
    return request<{
      logs: Array<{
        id: string;
        action: string;
        actor_email: string;
        target_user_email?: string;
        details?: string;
        destructive: boolean;
        created_at: string;
      }>;
    }>('/audit-logs', { token });
  },

  async getTasks(token: string): Promise<{ tasks: Task[] }> {
    return request<{ tasks: Task[] }>('/tasks', { token });
  },

  async createTask(
    token: string,
    data: {
      title: string;
      description?: string;
      status: Task['status'];
      priority: Task['priority'];
      due_date: string;
      assigned_to: string;
      related_name?: string;
      tags: string[];
    },
  ): Promise<{ task: Task }> {
    return request<{ task: Task }>('/tasks', { method: 'POST', token, body: data });
  },

  // Calendar API methods
  async getCalendarEvents(token: string) {
    return request<{ events: Array<{ id: string; title: string; description: string; start_date: string; end_date: string; location: string; all_day: boolean; color: string; event_type: string; attendees: string[]; created_by: string; created_at: string; updated_at: string }> }>('/calendar', { token });
  },

  async createCalendarEvent(
    token: string,
    data: { title: string; description?: string; start_date: string; end_date: string; location?: string; all_day?: boolean; color?: string; event_type?: string; attendees?: string[] },
  ) {
    return request<{ event: any }>('/calendar', { method: 'POST', token, body: data });
  },

  async updateCalendarEvent(token: string, id: string, data: any) {
    return request<{ event: any }>(`/calendar/${id}`, { method: 'PATCH', token, body: data });
  },

  async deleteCalendarEvent(token: string, id: string) {
    return request<{ message: string }>(`/calendar/${id}`, { method: 'DELETE', token });
  },

  // Client API methods
  async getClients(token: string) {
    return request<{ clients: Array<{ id: string; company_name: string; status: string; monthly_fee: number; contact_name: string; contact_email: string; contact_phone: string; guarantee_leads: number; notes: string; created_by: string; created_at: string; updated_at: string }> }>('/clients', { token });
  },

  async createClient(token: string, data: any) {
    return request<{ client: any }>('/clients', { method: 'POST', token, body: data });
  },

  async updateClient(token: string, id: string, data: any) {
    return request<{ client: any }>(`/clients/${id}`, { method: 'PATCH', token, body: data });
  },

  async deleteClient(token: string, id: string) {
    return request<{ message: string }>(`/clients/${id}`, { method: 'DELETE', token });
  },

  // Project API methods
  async getProjects(token: string) {
    return request<{ projects: Array<{ id: string; project_name: string; description: string; status: string; start_date: string; end_date: string; budget: number; spent: number; team_members: string[]; client_id: string; created_by: string; created_at: string; updated_at: string }> }>('/projects', { token });
  },

  async createProject(token: string, data: any) {
    return request<{ project: any }>('/projects', { method: 'POST', token, body: data });
  },

  async updateProject(token: string, id: string, data: any) {
    return request<{ project: any }>(`/projects/${id}`, { method: 'PATCH', token, body: data });
  },

  async deleteProject(token: string, id: string) {
    return request<{ message: string }>(`/projects/${id}`, { method: 'DELETE', token });
  },

  // Tenant API methods
  async getTenants(token: string) {
    return request<{ tenants: Array<{ id: string; tenant_name: string; status: string; monthly_cost: number; renewal_date: string; features: string[]; description: string; created_by: string; created_at: string; updated_at: string }> }>('/tenants', { token });
  },

  async createTenant(token: string, data: any) {
    return request<{ tenant: any }>('/tenants', { method: 'POST', token, body: data });
  },

  async updateTenant(token: string, id: string, data: any) {
    return request<{ tenant: any }>(`/tenants/${id}`, { method: 'PATCH', token, body: data });
  },

  async deleteTenant(token: string, id: string) {
    return request<{ message: string }>(`/tenants/${id}`, { method: 'DELETE', token });
  },

  // Inbox API methods
  async getInboxes(token: string) {
    return request<{ inboxes: any[] }>('/inboxes', { token });
  },

  async createInbox(token: string, data: any) {
    return request<{ inbox: any }>('/inboxes', { method: 'POST', token, body: data });
  },

  async updateInbox(token: string, id: string, data: any) {
    return request<{ inbox: any }>(`/inboxes/${id}`, { method: 'PATCH', token, body: data });
  },

  async deleteInbox(token: string, id: string) {
    return request<{ message: string }>(`/inboxes/${id}`, { method: 'DELETE', token });
  },

  // Domain API methods
  async getDomains(token: string) {
    return request<{ domains: any[] }>('/domains', { token });
  },

  async createDomain(token: string, data: any) {
    return request<{ domain: any }>('/domains', { method: 'POST', token, body: data });
  },

  async updateDomain(token: string, id: string, data: any) {
    return request<{ domain: any }>(`/domains/${id}`, { method: 'PATCH', token, body: data });
  },

  async deleteDomain(token: string, id: string) {
    return request<{ message: string }>(`/domains/${id}`, { method: 'DELETE', token });
  },

  // Tools API methods
  async getTools(token: string) {
    return request<{ tools: any[] }>('/tools', { token });
  },

  async createTool(token: string, data: any) {
    return request<{ tool: any }>('/tools', { method: 'POST', token, body: data });
  },

  async updateTool(token: string, id: string, data: any) {
    return request<{ tool: any }>(`/tools/${id}`, { method: 'PATCH', token, body: data });
  },

  async deleteTool(token: string, id: string) {
    return request<{ message: string }>(`/tools/${id}`, { method: 'DELETE', token });
  },

  // Campaigns API methods
  async getCampaigns(token: string) {
    return request<{ campaigns: any[] }>('/campaigns', { token });
  },

  async createCampaign(token: string, data: any) {
    return request<{ campaign: any }>('/campaigns', { method: 'POST', token, body: data });
  },

  async updateCampaign(token: string, id: string, data: any) {
    return request<{ campaign: any }>(`/campaigns/${id}`, { method: 'PATCH', token, body: data });
  },

  async deleteCampaign(token: string, id: string) {
    return request<{ message: string }>(`/campaigns/${id}`, { method: 'DELETE', token });
  },

  // Guarantees API methods
  async getGuarantees(token: string) {
    return request<{ guarantees: any[] }>('/guarantees', { token });
  },

  async createGuarantee(token: string, data: any) {
    return request<{ guarantee: any }>('/guarantees', { method: 'POST', token, body: data });
  },

  async updateGuarantee(token: string, id: string, data: any) {
    return request<{ guarantee: any }>(`/guarantees/${id}`, { method: 'PATCH', token, body: data });
  },

  async deleteGuarantee(token: string, id: string) {
    return request<{ message: string }>(`/guarantees/${id}`, { method: 'DELETE', token });
  },

  // Automation API methods
  async getAutomations(token: string) {
    return request<{ automations: any[] }>('/automations', { token });
  },

  async createAutomation(token: string, data: any) {
    return request<{ automation: any }>('/automations', { method: 'POST', token, body: data });
  },

  async updateAutomation(token: string, id: string, data: any) {
    return request<{ automation: any }>(`/automations/${id}`, { method: 'PATCH', token, body: data });
  },

  async deleteAutomation(token: string, id: string) {
    return request<{ message: string }>(`/automations/${id}`, { method: 'DELETE', token });
  },

  // Renewals API methods
  async getRenewals(token: string) {
    return request<{ renewals: any[] }>('/renewals', { token });
  },

  async createRenewal(token: string, data: any) {
    return request<{ renewal: any }>('/renewals', { method: 'POST', token, body: data });
  },

  async updateRenewal(token: string, id: string, data: any) {
    return request<{ renewal: any }>(`/renewals/${id}`, { method: 'PATCH', token, body: data });
  },

  async deleteRenewal(token: string, id: string) {
    return request<{ message: string }>(`/renewals/${id}`, { method: 'DELETE', token });
  },
};
