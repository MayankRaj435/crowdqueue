"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { AnimatedCounter } from "@/components/ui/animated-effects";
import { useAuthStore } from "@/store/authStore";
import { StaffTab } from "@/components/org/StaffTab";
import { AnalyticsTab } from "@/components/org/AnalyticsTab";
import { PageShell } from "@/components/ui/page-shell";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import fetchClient from "@/api/axiosInstance";

interface QueueInfo {
  _id: string;
  name: string;
  status: string;
  currentToken: number;
  lastTokenIssued: number;
  waiting: number;
  totalServedToday: number;
  avgServiceTimeMs: number;
}

interface OrgData {
  _id: string;
  name: string;
  type: string;
  isVerified: boolean;
}

export default function OrgDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [org, setOrg] = useState<OrgData | null>(null);
  const [queues, setQueues] = useState<QueueInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newQueue, setNewQueue] = useState({ name: "", description: "", maxCapacity: "200" });
  const [creating, setCreating] = useState(false);
  const [qrQueue, setQrQueue] = useState<QueueInfo | null>(null);
  const [activeTab, setActiveTab] = useState("queues");

  const fetchData = async () => {
    if (!user?.organizationId) return;
    try {
      const res = await fetchClient.get(`/orgs/${user.organizationId}`);
      const data = res.data as { organization: OrgData; queues: QueueInfo[] };
      setOrg(data.organization);
      setQueues(data.queues);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user?.organizationId]);

  const handleCreateQueue = async () => {
    setCreating(true);
    try {
      await fetchClient.post("/queues", {
        name: newQueue.name,
        description: newQueue.description,
        maxCapacity: parseInt(newQueue.maxCapacity) || 200,
      });
      setShowCreate(false);
      setNewQueue({ name: "", description: "", maxCapacity: "200" });
      fetchData();
    } catch {
      //
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (queueId: string, status: string) => {
    try {
      await fetchClient.patch(`/queues/${queueId}/status`, { status });
      fetchData();
    } catch {
      //
    }
  };

  const totalWaiting = queues.reduce((sum, q) => sum + (q.waiting || 0), 0);
  const totalServed = queues.reduce((sum, q) => sum + (q.totalServedToday || 0), 0);

  if (!user?.organizationId) {
    return (
      <ProtectedRoute roles={["org_admin"]} loginRole="admin">
        <PageShell className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
          <div className="text-center">
            <p className="text-neutral-400 mb-4">You haven&apos;t registered an organization yet.</p>
            <ShimmerButton onClick={() => router.push("/org/register")}>
              Register Organization
            </ShimmerButton>
          </div>
        </PageShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute roles={["org_admin"]} loginRole="admin">
      <PageShell>
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-3xl font-bold text-white">{org?.name || "Dashboard"}</h1>
                <p className="text-neutral-400 mt-1">Organization Dashboard</p>
              </div>
              <ShimmerButton onClick={() => setShowCreate(true)}>+ New Queue</ShimmerButton>
            </div>
          </motion.div>

          {/* Tabs Navigation */}
          <div className="flex gap-6 mb-8 border-b border-white/[0.04]">
            {["queues", "staff", "analytics"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-medium capitalize transition-colors relative ${
                  activeTab === tab ? "text-white" : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                  />
                )}
              </button>
            ))}
          </div>

          {activeTab === "queues" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: "Active Queues", value: queues.filter((q) => q.status === "active").length },
              { label: "Total Waiting", value: totalWaiting },
              { label: "Served Today", value: totalServed },
              { label: "Total Queues", value: queues.length },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
              >
                <p className="text-xs text-neutral-500 mb-1">{stat.label}</p>
                <AnimatedCounter value={stat.value} className="font-display text-3xl font-bold text-white" />
              </motion.div>
            ))}
          </div>

          {/* Create Queue Modal */}
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 rounded-2xl border border-white/[0.08] bg-[#0A0A0A]"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Create New Queue</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Queue name (e.g. OPD Counter 1)"
                  value={newQueue.name}
                  onChange={(e) => setNewQueue({ ...newQueue, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20 transition-colors"
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newQueue.description}
                  onChange={(e) => setNewQueue({ ...newQueue, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20 transition-colors"
                />
                <input
                  type="number"
                  placeholder="Max capacity (default 200)"
                  value={newQueue.maxCapacity}
                  onChange={(e) => setNewQueue({ ...newQueue, maxCapacity: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20 transition-colors"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreate(false)}
                    className="flex-1 py-3 rounded-full border border-white/10 text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <ShimmerButton onClick={handleCreateQueue} disabled={!newQueue.name || creating} className="flex-1 py-3">
                    {creating ? "Creating..." : "Create Queue"}
                  </ShimmerButton>
                </div>
              </div>
            </motion.div>
          )}

          {/* Queue List */}
          {loading ? (
            <CardGridSkeleton count={4} />
          ) : queues.length === 0 ? (
            <EmptyState
              title="No queues yet"
              description="Create your first queue to get started."
            />
          ) : (
            <div className="space-y-4">
              {queues.map((queue, i) => (
                <motion.div
                  key={queue._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <SpotlightCard>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{queue.name}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            queue.status === "active"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : queue.status === "paused"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-white/10 text-neutral-400"
                          }`}>
                            {queue.status}
                          </span>
                        </div>
                        <div className="flex gap-6 text-sm">
                          <span className="text-neutral-400">
                            Now Serving: <span className="text-white font-medium">#{queue.currentToken}</span>
                          </span>
                          <span className="text-neutral-400">
                            Waiting: <span className="text-white font-medium">{queue.waiting}</span>
                          </span>
                          <span className="text-neutral-400">
                            Served: <span className="text-white font-medium">{queue.totalServedToday}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={`/display/${queue._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-full text-xs border border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                        >
                          Display
                        </a>
                        <button
                          onClick={() => setQrQueue(queue)}
                          className="px-4 py-2 rounded-full text-xs border border-white/20 text-white hover:bg-white/10 transition-colors"
                        >
                          QR Code
                        </button>
                        {queue.status === "active" && (
                          <button
                            onClick={() => handleStatusChange(queue._id, "paused")}
                            className="px-4 py-2 rounded-full text-xs border border-amber-400/20 text-amber-400 hover:bg-amber-400/10 transition-colors"
                          >
                            Pause
                          </button>
                        )}
                        {queue.status === "paused" && (
                          <button
                            onClick={() => handleStatusChange(queue._id, "active")}
                            className="px-4 py-2 rounded-full text-xs border border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                          >
                            Resume
                          </button>
                        )}
                        {queue.status !== "closed" && (
                          <button
                            onClick={() => handleStatusChange(queue._id, "closed")}
                            className="px-4 py-2 rounded-full text-xs border border-red-400/20 text-red-400 hover:bg-red-400/10 transition-colors"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </div>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}



          {activeTab === "staff" && org && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <StaffTab orgId={org._id} />
            </motion.div>
          )}

          {activeTab === "analytics" && org && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AnalyticsTab orgId={org._id} />
            </motion.div>
          )}
      </PageShell>

      {/* QR Code Modal */}
      <AnimatePresence>
        {qrQueue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQrQueue(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          >
            <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-8 rounded-3xl max-w-sm w-full text-center relative shadow-2xl"
            >
              <button
                onClick={() => setQrQueue(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors"
              >
                ✕
              </button>
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-black leading-tight mb-1">{qrQueue.name}</h3>
                <p className="text-sm text-neutral-500 font-medium">Scan to join the queue</p>
              </div>
              
              <div className="bg-white p-4 rounded-2xl border-2 border-neutral-100 inline-block mb-8 shadow-sm">
                <QRCodeSVG 
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/queue/${qrQueue._id}`}
                  size={220}
                  level={"H"}
                  includeMargin={true}
                />
              </div>
              
              <a
                href={`/display/${qrQueue._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 mb-3 border border-neutral-200 text-black rounded-xl font-medium hover:bg-neutral-50 transition-colors"
              >
                Open lobby display
              </a>
              <button 
                type="button"
                onClick={() => window.print()} 
                className="w-full py-4 bg-black text-white rounded-xl font-medium shadow-lg hover:bg-neutral-800 transition-all active:scale-[0.98]"
              >
                Print Poster
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ProtectedRoute>
  );
}
