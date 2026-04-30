import { create } from "zustand";

interface QueueData {
  _id: string;
  name: string;
  status: string;
  currentToken: number;
  lastTokenIssued: number;
  avgServiceTimeMs: number;
  maxCapacity: number;
  waiting: number;
  organizationId: {
    _id: string;
    name: string;
    type: string;
  };
}

interface TokenData {
  _id: string;
  tokenNumber: number;
  status: string;
  estimatedWaitMs: number;
  tokensAhead: number;
  queueId: {
    _id: string;
    name: string;
    currentToken: number;
  };
  organizationId: {
    _id: string;
    name: string;
    type: string;
  };
  createdAt: string;
}

interface QueueState {
  nearbyOrgs: Array<Record<string, unknown>>;
  selectedQueue: QueueData | null;
  myTokens: TokenData[];
  setNearbyOrgs: (orgs: Array<Record<string, unknown>>) => void;
  setSelectedQueue: (queue: QueueData | null) => void;
  setMyTokens: (tokens: TokenData[]) => void;
  updateQueueState: (queueId: string, updates: Partial<QueueData>) => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  nearbyOrgs: [],
  selectedQueue: null,
  myTokens: [],

  setNearbyOrgs: (orgs) => set({ nearbyOrgs: orgs }),
  setSelectedQueue: (queue) => set({ selectedQueue: queue }),
  setMyTokens: (tokens) => set({ myTokens: tokens }),

  updateQueueState: (queueId, updates) =>
    set((state) => ({
      selectedQueue:
        state.selectedQueue?._id === queueId
          ? { ...state.selectedQueue, ...updates }
          : state.selectedQueue,
    })),
}));
