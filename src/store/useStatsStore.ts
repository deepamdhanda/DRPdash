import { create } from "zustand";

export interface Stat {
  label: string;
  count: string;
}

interface StatsStore {
  stats: Stat[] | null;
  setStatsStore: (stat: Stat[]) => void;
  reset: () => void;
}

export const useStatsStore = create<StatsStore>((set) => ({
  stats: null,
  setStatsStore: (stat: Stat[]) => set({ stats: stat }),
  reset: () => set({ stats: null }),
}));
