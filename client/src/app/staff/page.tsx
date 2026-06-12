"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchClient } from "@/api/axiosInstance";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { formatWaitTime } from "@/lib/utils";
import { connectSocket } from "@/lib/socket";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface QueueItem {
  _id: string;
  name: string;
  description: string;
  status: string;
  currentToken: number;
  lastTokenIssued: number;
  waiting: number;
  avgServiceTimeMs: number;
  totalServedToday: number;
  maxCapacity: number;
}

interface CalledInfo {
  tokenNumber: number;
  timestamp: Date;
}

export default function StaffDashboardPage() {
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState<Record<string, boolean>>({});
  const [calledLog, setCalledLog] = useState<Record<string, CalledInfo | null>>({});
  const [error, setError] = useState<Record<string, string>>({});

  const fetchQueues = useCallback(async () => {
    try {
      const res = await fetchClient.get<{ queues: QueueItem[] }>("/queues/my");
      setQueues((res.data as { queues: QueueItem[] }).queues || []);
    } catch {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueues();
  }, [fetchQueues]);

  useEffect(() => {
    if (queues.length === 0) return;
    const socket = connectSocket();

    const onStateUpdate = (state: QueueItem & { _id: string }) => {
      setQueues((prev) =>
        prev.map((pq) => (String(pq._id) === String(state._id) ? { ...pq, ...state } : pq))
      );
    };

    socket.on("queue:state_update", onStateUpdate);
    queues.forEach((q) => {
      socket.emit("join_staff_room", { queueId: q._id });
      socket.emit("join_queue_room", { queueId: q._id });
    });

    return () => {
      socket.off("queue:state_update", onStateUpdate);
    };
  }, [queues.map((q) => q._id).join(",")]);

  const handleCallNext = async (queueId: string) => {
    setCalling((prev) => ({ ...prev, [queueId]: true }));
    setError((prev) => ({ ...prev, [queueId]: "" }));
    try {
      const res = await fetchClient.post<{ calledToken: number }>(`/queues/${queueId}/next`);
      const { calledToken } = res.data as { calledToken: number };
      setCalledLog((prev) => ({ ...prev, [queueId]: { tokenNumber: calledToken, timestamp: new Date() } }));
      // Refresh queue state
      fetchQueues();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to call next";
      setError((prev) => ({ ...prev, [queueId]: msg }));
    } finally {
      setCalling((prev) => ({ ...prev, [queueId]: false }));
    }
  };

  const handleStatusToggle = async (queueId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    try {
      await fetchClient.patch(`/queues/${queueId}/status`, { status: newStatus });
      setQueues((prev) => prev.map((q) => q._id === queueId ? { ...q, status: newStatus } : q));
    } catch {
      // ignore
    }
  };

  return (
    <ProtectedRoute roles={["org_admin", "staff", "super_admin"]} loginRole="staff">
      <PageShell maxWidth="max-w-5xl">
          <PageHeader
            title="Staff Console"
            description="Call tokens and manage queues in real time"
          />

          {loading ? (
            <LoadingSpinner />
          ) : queues.length === 0 ? (
            <EmptyState
              title="No queues assigned"
              description="Contact your organization admin to create or assign queues."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {queues.map((queue, i) => (
                <motion.div
                  key={queue._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6"
                >
                  {/* Queue Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-white">{queue.name}</h2>
                      <p className="text-sm text-neutral-500 mt-0.5">{queue.waiting} waiting</p>
                    </div>
                    <button
                      onClick={() => handleStatusToggle(queue._id, queue.status)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        queue.status === "active"
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                          : "bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                      }`}
                    >
                      {queue.status === "active" ? "● Active" : "⏸ Paused"}
                    </button>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { label: "Now Serving", value: `#${queue.currentToken}` },
                      { label: "Waiting", value: queue.waiting },
                      { label: "Served Today", value: queue.totalServedToday },
                    ].map((stat) => (
                      <div key={stat.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
                        <p className="text-xs text-neutral-500 mb-1">{stat.label}</p>
                        <p className="text-xl font-bold text-white">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Called Log */}
                  <AnimatePresence>
                    {calledLog[queue._id] && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center"
                      >
                        <p className="text-emerald-400 text-sm font-medium">
                          Now calling Token #{calledLog[queue._id]!.tokenNumber} →
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error */}
                  {error[queue._id] && (
                    <p className="mb-4 text-red-400 text-sm text-center">{error[queue._id]}</p>
                  )}

                  {/* Call Next Button */}
                  <ShimmerButton
                    onClick={() => handleCallNext(queue._id)}
                    disabled={calling[queue._id] || queue.status !== "active" || queue.waiting === 0}
                    className="w-full py-4 text-base"
                  >
                    {calling[queue._id] ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        Calling...
                      </span>
                    ) : queue.waiting === 0 ? (
                      "No tokens waiting"
                    ) : (
                      `Call Next Token →`
                    )}
                  </ShimmerButton>

                  {/* Est wait */}
                  <p className="mt-3 text-xs text-neutral-600 text-center">
                    Est. service time: {formatWaitTime(queue.avgServiceTimeMs)} per person
                  </p>
                </motion.div>
              ))}
            </div>
          )}
      </PageShell>
    </ProtectedRoute>
  );
}
