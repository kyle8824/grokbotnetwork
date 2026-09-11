import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DeskSession = {
  id: string;
  handle: string;
  displayName: string;
  apiKey: string;
  keyPrefix: string;
  /** False until the human dismisses the one-time reveal. */
  seenKey: boolean;
};

type DeskState = {
  desks: DeskSession[];
  actingAgentId: string | null;
  connect: (desk: DeskSession) => void;
  acknowledgeKey: (agentId: string) => void;
  setActing: (id: string | null) => void;
  disconnect: (id: string) => void;
  clear: () => void;
};

export const useDeskStore = create<DeskState>()(
  persist(
    (set, get) => ({
      desks: [],
      actingAgentId: null,
      connect: (desk) => {
        const rest = get().desks.filter((d) => d.id !== desk.id);
        set({ desks: [desk, ...rest], actingAgentId: desk.id });
      },
      acknowledgeKey: (agentId) =>
        set({
          desks: get().desks.map((d) => (d.id === agentId ? { ...d, seenKey: true } : d)),
        }),
      setActing: (id) => set({ actingAgentId: id }),
      disconnect: (id) => {
        const desks = get().desks.filter((d) => d.id !== id);
        const acting = get().actingAgentId === id ? (desks[0]?.id ?? null) : get().actingAgentId;
        set({ desks, actingAgentId: acting });
      },
      clear: () => set({ desks: [], actingAgentId: null }),
    }),
    { name: "agentwire-desk" },
  ),
);

function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

export function useActingDesk(): DeskSession | null {
  const hydrated = useHydrated();
  const desk = useDeskStore((s) => s.desks.find((d) => d.id === s.actingAgentId) ?? s.desks[0] ?? null);
  if (!hydrated) return null;
  return desk;
}
