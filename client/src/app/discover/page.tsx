"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { queueApi } from "@/api/queueApi";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { formatWaitTime } from "@/lib/utils";
import Link from "next/link";

interface QueueInfo {
  _id: string;
  name: string;
  status: string;
  waiting: number;
  avgServiceTimeMs: number;
}

interface OrgInfo {
  _id: string;
  name: string;
  type: string;
  address: { city: string };
  queues: QueueInfo[];
}

const orgTypeLabels: Record<string, string> = {
  hospital: "🏥 Hospital",
  rto: "🚗 RTO",
  bank: "🏦 Bank",
  government: "🏛️ Government",
  other: "📋 Other",
};

export default function DiscoverPage() {
  const [orgs, setOrgs] = useState<OrgInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchNearby = async () => {
      try {
        let lng = 77.209;
        let lat = 28.6139;

        if (navigator.geolocation) {
          try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
            );
            lng = pos.coords.longitude;
            lat = pos.coords.latitude;
          } catch {
            // Use Delhi defaults
          }
        }

        // 50km radius — practical for city-wide discovery
        const res = await queueApi.getNearby(lng, lat, 50000, filter !== "all" ? filter : undefined);
        setOrgs((res.data as { organizations: OrgInfo[] }).organizations || []);
      } catch {
        setOrgs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNearby();
  }, [filter]);

  const filtered = orgs.filter((org) =>
    org.name.toLowerCase().includes(search.toLowerCase())
  );

  const filters = ["all", "hospital", "bank", "government", "rto", "other"];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-3xl font-bold text-white mb-2">Discover Queues</h1>
            <p className="text-neutral-400 mb-8">Find active queues near your location</p>
          </motion.div>

          {/* Search + Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 space-y-4"
          >
            <input
              type="text"
              placeholder="Search by organization name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20 transition-colors"
            />

            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setLoading(true); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filter === f
                      ? "bg-white text-black"
                      : "bg-white/[0.05] text-neutral-400 hover:text-white hover:bg-white/[0.08]"
                  }`}
                >
                  {f === "all" ? "All" : orgTypeLabels[f] || f}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Results */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-neutral-500 text-lg">No queues found nearby</p>
              <p className="text-neutral-600 text-sm mt-2">Try adjusting your filters or search</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((org, i) => (
                <motion.div
                  key={org._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <SpotlightCard className="h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{org.name}</h3>
                        <p className="text-sm text-neutral-500">{org.address?.city}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs bg-white/[0.05] text-neutral-400">
                        {orgTypeLabels[org.type] || org.type}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {org.queues?.map((queue) => (
                        <Link
                          key={queue._id}
                          href={`/queue/${queue._id}`}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-colors group"
                        >
                          <div>
                            <span className="text-sm font-medium text-white group-hover:text-white/90">
                              {queue.name}
                            </span>
                            <span className="block text-xs text-neutral-500 mt-0.5">
                              {queue.waiting} waiting
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-neutral-300">
                              {formatWaitTime(queue.waiting * queue.avgServiceTimeMs)}
                            </span>
                            <span
                              className={`block text-xs mt-0.5 ${
                                queue.status === "active" ? "text-emerald-400" : "text-neutral-500"
                              }`}
                            >
                              {queue.status}
                            </span>
                          </div>
                        </Link>
                      ))}
                      {(!org.queues || org.queues.length === 0) && (
                        <p className="text-sm text-neutral-600 text-center py-3">No active queues</p>
                      )}
                    </div>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
