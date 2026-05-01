"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { tokenApi } from "@/api/tokenApi";
import { queueApi } from "@/api/queueApi";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { formatWaitTime, getStatusColor } from "@/lib/utils";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

interface QueueState {
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
  organizationId: { _id: string; name: string; type: string };
}

interface MyToken {
  _id: string;
  tokenNumber: number;
  status: string;
  estimatedWaitMs: number;
  tokensAhead: number;
  queueId?: { _id: string };
}

const orgTypeEmoji: Record<string, string> = {
  hospital: "🏥",
  rto: "🚗",
  bank: "🏦",
  government: "🏛️",
  other: "📋",
};

export default function QueueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { accessToken } = useAuthStore();

  const [queue, setQueue] = useState<QueueState | null>(null);
  const [myToken, setMyToken] = useState<MyToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [justCalled, setJustCalled] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [qRes, tokenRes] = await Promise.all([
        queueApi.getById(id),
        tokenApi.getMyTokens("active"),
      ]);

      const q = (qRes.data as { queue: QueueState }).queue;
      setQueue(q);

      const myTokens = (tokenRes.data as { tokens: MyToken[] }).tokens || [];
      const existing = myTokens.find((t) => t.queueId?._id === id);
      setMyToken(existing || null);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time Socket.io
  useEffect(() => {
    if (!id) return;
    const socket = getSocket(accessToken || undefined);
    if (!socket.connected) socket.connect();

    socket.emit("join_queue_room", { queueId: id });

    socket.on("queue:state_update", (state: Partial<QueueState>) => {
      setQueue((prev) => (prev ? { ...prev, ...state } : prev));
    });

    socket.on("token:called", (data: { queueId: string; tokenNumber: number }) => {
      if (data.queueId === id) {
        setJustCalled(true);
        setTimeout(() => setJustCalled(false), 8000);
        setMyToken((prev) =>
          prev && prev.tokenNumber === data.tokenNumber
            ? { ...prev, status: "called", tokensAhead: 0 }
            : prev
        );
      }
    });

    socket.on("queue:status_change", ({ status }: { status: string }) => {
      setQueue((prev) => (prev ? { ...prev, status } : prev));
    });

    return () => {
      socket.off("queue:state_update");
      socket.off("token:called");
      socket.off("queue:status_change");
    };
  }, [id, accessToken]);

  const handleJoin = async () => {
    setJoining(true);
    setJoinError("");
    try {
      const res = await tokenApi.join(id);
      const { token } = res.data as { token: MyToken };
      setMyToken(token);
      setQueue((prev) =>
        prev
          ? { ...prev, lastTokenIssued: prev.lastTokenIssued + 1, waiting: prev.waiting + 1 }
          : prev
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to join queue. Try again.";
      setJoinError(msg);
    } finally {
      setJoining(false);
    }
  };

  const handleCancel = async () => {
    if (!myToken) return;
    setCancelling(true);
    try {
      await tokenApi.cancel(myToken._id, "User cancelled");
      setMyToken(null);
      setQueue((prev) =>
        prev ? { ...prev, waiting: Math.max(0, prev.waiting - 1) } : prev
      );
    } catch {
      // ignore
    } finally {
      setCancelling(false);
    }
  };

  const tokensAhead = myToken
    ? Math.max(0, myToken.tokenNumber - (queue?.currentToken ?? 0) - 1)
    : 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <div className="max-w-2xl mx-auto px-6 py-12">
          {/* Back */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-8"
            >
              ← Back to Discover
            </Link>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-32">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : !queue ? (
            <div className="text-center py-32">
              <p className="text-neutral-400 text-lg">Queue not found</p>
              <button
                onClick={() => router.push("/discover")}
                className="mt-4 text-sm text-neutral-500 hover:text-white"
              >
                Go back to Discover
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm text-neutral-500 mb-1">
                      {orgTypeEmoji[queue.organizationId?.type] || "📋"}{" "}
                      {queue.organizationId?.name}
                    </p>
                    <h1 className="font-display text-3xl font-bold text-white">
                      {queue.name}
                    </h1>
                    {queue.description && (
                      <p className="text-neutral-400 mt-2 text-sm">{queue.description}</p>
                    )}
                  </div>
                  <span
                    className={`mt-1 px-3 py-1.5 rounded-full text-xs font-medium border ${
                      queue.status === "active"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : queue.status === "paused"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}
                  >
                    {queue.status === "active"
                      ? "● Live"
                      : queue.status === "paused"
                      ? "⏸ Paused"
                      : "✕ Closed"}
                  </span>
                </div>
              </motion.div>

              {/* Live Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-3 gap-3 mb-8"
              >
                {[
                  { label: "Now Serving", value: `#${queue.currentToken}` },
                  { label: "Waiting", value: queue.waiting },
                  {
                    label: "Est. Wait",
                    value: formatWaitTime(queue.waiting * queue.avgServiceTimeMs),
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center"
                  >
                    <p className="text-xs text-neutral-500 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                ))}
              </motion.div>

              {/* "Your token is called" banner */}
              <AnimatePresence>
                {justCalled && myToken && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mb-6 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center"
                  >
                    <p className="text-2xl mb-1">🔔</p>
                    <p className="text-emerald-400 font-semibold text-lg">
                      Token #{myToken.tokenNumber} — It&apos;s your turn!
                    </p>
                    <p className="text-emerald-300/70 text-sm mt-1">
                      Please proceed to the counter now.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* My active token OR Join button */}
              <AnimatePresence mode="wait">
                {myToken ? (
                  <motion.div
                    key="my-token"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-6 rounded-2xl border border-white/[0.1] bg-white/[0.03]"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">
                          Your Token
                        </p>
                        <p className="font-display text-6xl font-black text-white">
                          #{myToken.tokenNumber}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
                          myToken.status
                        )}`}
                      >
                        {myToken.status === "called"
                          ? "🔔 Called!"
                          : myToken.status.replace("_", " ")}
                      </span>
                    </div>

                    {["waiting", "called"].includes(myToken.status) && (
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
                          <p className="text-xs text-neutral-500 mb-1">Ahead of you</p>
                          <p className="text-2xl font-bold text-white">{tokensAhead}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
                          <p className="text-xs text-neutral-500 mb-1">Est. Wait</p>
                          <p className="text-2xl font-bold text-white">
                            {formatWaitTime(tokensAhead * queue.avgServiceTimeMs)}
                          </p>
                        </div>
                      </div>
                    )}

                    {myToken.status === "waiting" && (
                      <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="w-full py-2.5 rounded-xl text-sm font-medium text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                      >
                        {cancelling ? "Cancelling..." : "Leave Queue"}
                      </button>
                    )}

                    {myToken.status === "called" && (
                      <div className="text-center py-2">
                        <p className="text-emerald-400 font-medium animate-pulse">
                          Please go to the counter now!
                        </p>
                      </div>
                    )}

                    {["served", "cancelled", "expired"].includes(myToken.status) && (
                      <button
                        onClick={() => router.push("/discover")}
                        className="w-full py-2.5 rounded-xl text-sm font-medium text-neutral-400 border border-white/[0.08] hover:border-white/20 transition-colors"
                      >
                        Find Another Queue →
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="join"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 space-y-3"
                  >
                    {joinError && (
                      <p className="text-red-400 text-sm text-center py-2">{joinError}</p>
                    )}

                    {queue.status !== "active" ? (
                      <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center">
                        <p className="text-neutral-400">
                          This queue is currently{" "}
                          <span className="text-amber-400 font-medium">{queue.status}</span>
                        </p>
                        <p className="text-neutral-600 text-sm mt-1">Check back soon</p>
                      </div>
                    ) : queue.waiting >= queue.maxCapacity ? (
                      <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-center">
                        <p className="text-red-400 font-medium">Queue is full</p>
                        <p className="text-neutral-600 text-sm mt-1">
                          Max capacity ({queue.maxCapacity}) reached
                        </p>
                      </div>
                    ) : (
                      <ShimmerButton
                        onClick={handleJoin}
                        disabled={joining}
                        className="w-full py-4 text-base"
                      >
                        {joining ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            Joining...
                          </span>
                        ) : (
                          `Join Queue — Get Token #${queue.lastTokenIssued + 1}`
                        )}
                      </ShimmerButton>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Capacity bar */}
              {queue.maxCapacity > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4"
                >
                  <div className="flex justify-between text-xs text-neutral-600 mb-2">
                    <span>Queue capacity</span>
                    <span>
                      {queue.waiting} / {queue.maxCapacity}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(100, (queue.waiting / queue.maxCapacity) * 100)}%`,
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        queue.waiting / queue.maxCapacity > 0.8
                          ? "bg-red-500"
                          : queue.waiting / queue.maxCapacity > 0.5
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                    />
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 text-center"
              >
                <Link
                  href="/my-tokens"
                  className="text-sm text-neutral-600 hover:text-neutral-300 transition-colors"
                >
                  View all my tokens →
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
