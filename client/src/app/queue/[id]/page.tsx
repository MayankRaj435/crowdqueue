"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { queueApi } from "@/api/queueApi";
import { tokenApi } from "@/api/tokenApi";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { MovingBorder } from "@/components/ui/moving-border";
import { AnimatedCounter } from "@/components/ui/animated-effects";
import { formatWaitTime } from "@/lib/utils";

interface QueueDetail {
  _id: string;
  name: string;
  description: string;
  status: string;
  currentToken: number;
  lastTokenIssued: number;
  maxCapacity: number;
  avgServiceTimeMs: number;
  waiting: number;
  totalServedToday: number;
  organizationId: { _id: string; name: string; type: string; address: { city: string } };
}

export default function QueueDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [queue, setQueue] = useState<QueueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinResult, setJoinResult] = useState<{ tokenNumber: number; position: number } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await queueApi.getById(id as string);
        setQueue((res.data as { queue: QueueDetail }).queue);
      } catch {
        setError("Queue not found");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleJoin = async () => {
    if (!queue) return;
    setJoining(true);
    setError("");
    try {
      const res = await tokenApi.join(queue._id);
      const data = res.data as { token: { tokenNumber: number; position: number } };
      setJoinResult(data.token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to join queue");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!queue) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <p className="text-neutral-500">Queue not found</p>
        </div>
      </ProtectedRoute>
    );
  }

  const capacityPercent = Math.min(100, (queue.waiting / queue.maxCapacity) * 100);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="mb-8">
              <span className="text-sm text-neutral-500">{queue.organizationId?.name}</span>
              <h1 className="font-display text-3xl font-bold text-white mt-1">{queue.name}</h1>
              {queue.description && (
                <p className="text-neutral-400 mt-2">{queue.description}</p>
              )}
            </div>

            {/* Join Success */}
            {joinResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8"
              >
                <MovingBorder className="p-8 text-center">
                  <p className="text-sm text-neutral-400 mb-2">Your Token Number</p>
                  <p className="font-display text-6xl font-bold text-white mb-4">
                    #{joinResult.tokenNumber}
                  </p>
                  <p className="text-sm text-neutral-400">
                    Position: {joinResult.position} in queue
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/my-tokens")}
                    className="mt-6 px-6 py-2 rounded-full border border-white/20 text-sm text-white hover:bg-white/5 transition-colors"
                  >
                    View My Tokens →
                  </motion.button>
                </MovingBorder>
              </motion.div>
            )}

            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Now Serving", value: queue.currentToken, prefix: "#" },
                { label: "Waiting", value: queue.waiting },
                { label: "Est. Wait", value: formatWaitTime(queue.waiting * queue.avgServiceTimeMs) },
                { label: "Served Today", value: queue.totalServedToday },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
                >
                  <p className="text-xs text-neutral-500 mb-1">{stat.label}</p>
                  {typeof stat.value === "number" ? (
                    <AnimatedCounter
                      value={stat.value}
                      prefix={stat.prefix}
                      className="font-display text-2xl font-bold text-white"
                    />
                  ) : (
                    <p className="font-display text-2xl font-bold text-white">{stat.value}</p>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Capacity Bar */}
            <div className="mb-8 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-neutral-400">Queue Capacity</span>
                <span className="text-neutral-300">{queue.waiting}/{queue.maxCapacity}</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${capacityPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    capacityPercent > 90
                      ? "bg-red-400"
                      : capacityPercent > 60
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                  }`}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Join Button */}
            {!joinResult && (
              <ShimmerButton
                onClick={handleJoin}
                disabled={joining || queue.status !== "active"}
                className="w-full py-4 text-lg"
              >
                {joining ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Joining...
                  </span>
                ) : queue.status !== "active" ? (
                  `Queue is ${queue.status}`
                ) : (
                  "Join This Queue"
                )}
              </ShimmerButton>
            )}

            {/* Status */}
            <div className="mt-4 text-center">
              <span className={`inline-flex items-center gap-2 text-sm ${
                queue.status === "active" ? "text-emerald-400" : "text-neutral-500"
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  queue.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"
                }`} />
                {queue.status.charAt(0).toUpperCase() + queue.status.slice(1)}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
