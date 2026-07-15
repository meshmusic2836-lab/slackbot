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

/** Check if the user is a guest. */
export function isGuest(user: LocalUser | null): boolean {
  return user?.email === "guest@spyro.ai";
}

/** Tools available to guests (limited). Others require full account. */
export const GUEST_TOOLS = new Set([
  "image-gen", // Image Studio only (rate-limited)
]);

/** Check if a tool is available to the current user. */
export function canAccessTool(toolId: string, user: LocalUser | null): boolean {
  if (!isGuest(user)) return true;
  return GUEST_TOOLS.has(toolId);
}
