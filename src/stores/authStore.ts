import { create } from 'zustand';

export type Role = 'super_admin' | 'ceo' | 'employee';

export interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  timezone: string;
  status: 'online' | 'away' | 'offline';
  role: Role;
  is_active: boolean;
  created_at: string;
  last_login: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  switchRole: (role: Role) => void;
}

const mockUsers: Record<string, User> = {
  'admin@koldify.io': {
    id: '1',
    full_name: 'System Admin',
    email: 'admin@koldify.io',
    timezone: 'America/New_York',
    status: 'online',
    role: 'super_admin',
    is_active: true,
    created_at: '2024-01-01',
    last_login: new Date().toISOString(),
  },
  'ceo@koldify.io': {
    id: '2',
    full_name: 'Alex Koldify',
    email: 'ceo@koldify.io',
    timezone: 'America/New_York',
    status: 'online',
    role: 'ceo',
    is_active: true,
    created_at: '2024-01-01',
    last_login: new Date().toISOString(),
  },
  'employee@koldify.io': {
    id: '3',
    full_name: 'Jordan Smith',
    email: 'employee@koldify.io',
    timezone: 'America/Chicago',
    status: 'online',
    role: 'employee',
    is_active: true,
    created_at: '2024-03-15',
    last_login: new Date().toISOString(),
  },
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (email: string, _password: string) => {
    const user = mockUsers[email];
    if (user) {
      set({ user, isAuthenticated: true });
      return true;
    }
    return false;
  },
  logout: () => set({ user: null, isAuthenticated: false }),
  switchRole: (role: Role) =>
    set((state) => ({
      user: state.user ? { ...state.user, role } : null,
    })),
}));
