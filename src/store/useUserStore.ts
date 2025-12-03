import { create } from "zustand";

interface UserStore {
  username: string | null;
  setUsername: (name: string) => void;
  reset: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  username: null,
  setUsername: (name) => set({ username: name }),
  reset: () => set({ username: null }),
}));
