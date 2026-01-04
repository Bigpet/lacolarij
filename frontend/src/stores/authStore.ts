/**
 * Zustand store for authentication state.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { api } from "@/lib/api";

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { access_token } = await api.login({ username, password });
          api.setToken(access_token);
          set({ token: access_token });

          // Fetch user info after login
          await get().fetchCurrentUser();
        } catch (err) {
          set({ error: err instanceof Error ? err.message : "Login failed" });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          await api.register({ username, password });
          // Auto-login after registration
          await get().login(username, password);
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : "Registration failed",
          });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        api.setToken(null);
        set({ token: null, user: null, error: null });
      },

      fetchCurrentUser: async () => {
        const { token } = get();
        if (!token) return;

        api.setToken(token);
        try {
          const user = await api.getCurrentUser();
          set({ user });
        } catch {
          // Token might be expired
          get().logout();
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "jiralocal-auth",
      partialize: (state) => ({ token: state.token }),
      onRehydrateStorage: () => (state) => {
        // Restore API token and fetch user on rehydration
        if (state?.token) {
          api.setToken(state.token);
          state.fetchCurrentUser();
        }
      },
    }
  )
);
