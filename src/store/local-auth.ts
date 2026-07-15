/**
 * Local auth — works without Supabase. Stores a user profile in localStorage.
 * When Supabase IS configured, the Supabase auth takes over (see auth-store).
 * This provides a login/profile experience for all users, even offline.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LocalUser {
  id: string;
  email: string;
  name: string;
  avatarColor: string;
  createdAt: number;
  lastLogin: number;
}

interface LocalAuthState {
  user: LocalUser | null;
  isAuthed: boolean;
  signIn: (email: string, name: string) => void;
  signOut: () => void;
  updateProfile: (patch: Partial<LocalUser>) => void;
}

const AVATAR_COLORS = [
  "#ff7a1a", "#e8421b", "#ff9a3c", "#ffd27a",
  "#ff5a1f", "#d8421b", "#ffae42", "#ff6b35",
];

export const useLocalAuth = create<LocalAuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthed: false,

      signIn: (email, name) => {
        const user: LocalUser = {
          id: `local-${Date.now()}`,
          email,
          name: name || email.split("@")[0],
          avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
          createdAt: Date.now(),
          lastLogin: Date.now(),
        };
        set({ user, isAuthed: true });
      },

      signOut: () => set({ user: null, isAuthed: false }),

      updateProfile: (patch) =>
        set((s) => ({
          user: s.user ? { ...s.user, ...patch } : null,
        })),
    }),
    { name: "spyro-v1-local-auth" }
  )
);
