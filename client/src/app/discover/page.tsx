"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { queueApi } from "@/api/queueApi";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { FormInput } from "@/components/ui/form-input";
import { EmptyState } from "@/components/ui/empty-state";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import { DiscoverMap, type MapOrg } from "@/components/discover/discover-map";
import { formatWaitTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface QueueInfo {
  _id: string;
  name: string;
  status: string;
  waiting: number;
  avgServiceTimeMs: number;
}

interface OrgInfo extends MapOrg {
  queues: QueueInfo[];
}

const orgTypeLabels: Record<string, string> = {
  hospital: "🏥 Hospital",
  rto: "🚗 RTO",
  bank: "🏦 Bank",
  government: "🏛️ Government",
  other: "📋 Other",
};

const filters = ["all", "hospital", "bank", "government", "rto", "other"];

export default function DiscoverPage() {
  const [orgs, setOrgs] = useState<OrgInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"split" | "list" | "map">("split");
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.209]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNearby = async () => {
      setLoading(true);
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
            setGeoError(null);
          } catch {
            setGeoError("Using default location — enable GPS for accurate results");
          }
        }

        setMapCenter([lat, lng]);
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

  const listOrgs =
    selectedOrgId && view !== "list"
      ? filtered.filter((o) => o._id === selectedOrgId)
      : filtered;

  return (
    <ProtectedRoute loginRole="customer">
      <PageShell>
        <PageHeader
          title="Discover Queues"
          description="Find active queues near you on the map or list"
          action={
            <div className="flex rounded-full border border-white/[0.08] p-1 bg-white/[0.02]">
              {(["split", "list", "map"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setView(v);
                    if (v === "list") setSelectedOrgId(null);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all",
                    view === v ? "bg-white text-black" : "text-neutral-400 hover:text-white"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          }
        />

        <div className="mb-6 space-y-4">
          <FormInput
            type="search"
            placeholder="Search by organization name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {geoError && <p className="text-xs text-amber-500/90">{geoError}</p>}
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  filter === f
                    ? "bg-white text-black"
                    : "bg-white/[0.05] text-neutral-400 hover:text-white hover:bg-white/[0.08]"
                )}
              >
                {f === "all" ? "All" : orgTypeLabels[f] || f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <CardGridSkeleton count={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No queues found nearby"
            description="Try adjusting your filters or search radius"
          />
        ) : (
          <div
            className={cn(
              "gap-6",
              view === "split" ? "grid grid-cols-1 lg:grid-cols-2" : "flex flex-col"
            )}
          >
            {(view === "split" || view === "map") && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={view === "map" ? "w-full" : ""}
              >
                <DiscoverMap
                  orgs={filtered}
                  center={mapCenter}
                  selectedId={selectedOrgId}
                  onSelect={setSelectedOrgId}
                />
                {selectedOrgId && view === "split" && (
                  <button
                    type="button"
                    onClick={() => setSelectedOrgId(null)}
                    className="mt-3 text-xs text-neutral-500 hover:text-white transition-colors"
                  >
                    Show all organizations
                  </button>
                )}
              </motion.div>
            )}

            {(view === "split" || view === "list") && (
              <div
                className={cn(
                  "grid gap-4",
                  view === "list"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1 max-h-[520px] overflow-y-auto pr-1"
                )}
              >
                {listOrgs.map((org, i) => (
                  <motion.div
                    key={org._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedOrgId(org._id)}
                    className={cn(
                      "cursor-pointer transition-opacity",
                      selectedOrgId && selectedOrgId !== org._id && view === "split"
                        ? "opacity-50"
                        : ""
                    )}
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
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-colors group"
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
                                className={cn(
                                  "block text-xs mt-0.5",
                                  queue.status === "active" ? "text-emerald-400" : "text-neutral-500"
                                )}
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
        )}
      </PageShell>
    </ProtectedRoute>
  );
}
