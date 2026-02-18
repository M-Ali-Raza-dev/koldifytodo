import { create } from 'zustand';
import { api, authTokenStorage } from '@/lib/api';

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
  isLoadingAuth: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  signup: (full_name: string, email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoadingAuth: true,
  initialize: async () => {
    const token = authTokenStorage.get();
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoadingAuth: false });
      return;
    }

    try {
      const { user } = await api.me(token);
      set({ user, isAuthenticated: true, isLoadingAuth: false });
    } catch {
      authTokenStorage.clear();
      set({ user: null, isAuthenticated: false, isLoadingAuth: false });
    }
  },
  login: async (email: string, password: string) => {
    try {
      const { token, user } = await api.login({ email, password });
      authTokenStorage.set(token);
      set({ user, isAuthenticated: true, isLoadingAuth: false });
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : 'Login failed' };
    }
  },
  signup: async (full_name: string, email: string, password: string) => {
    try {
      const { token, user } = await api.signup({ full_name, email, password });
      authTokenStorage.set(token);
      set({ user, isAuthenticated: true, isLoadingAuth: false });
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : 'Signup failed' };
    }
  },
  logout: () => {
    authTokenStorage.clear();
    set({ user: null, isAuthenticated: false });
  },
}));
