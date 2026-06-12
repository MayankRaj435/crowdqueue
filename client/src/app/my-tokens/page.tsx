"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { tokenApi } from "@/api/tokenApi";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { MovingBorder } from "@/components/ui/moving-border";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatWaitTime, getStatusColor } from "@/lib/utils";
import Link from "next/link";

interface Token {
  _id: string;
  tokenNumber: number;
  status: string;
  estimatedWaitMs: number;
  tokensAhead: number;
  createdAt: string;
  queueId: { _id: string; name: string; currentToken: number };
  organizationId: { _id: string; name: string; type: string };
}

export default function MyTokensPage() {
  const [active, setActive] = useState<Token[]>([]);
  const [past, setPast] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "past">("active");

  const fetchTokens = async () => {
    try {
      const [activeRes, pastRes] = await Promise.all([
        tokenApi.getMyTokens("active"),
        tokenApi.getMyTokens("past"),
      ]);
      setActive((activeRes.data as { tokens: Token[] }).tokens || []);
      setPast((pastRes.data as { tokens: Token[] }).tokens || []);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTokens(); }, []);

  const handleCancel = async (id: string) => {
    try {
      await tokenApi.cancel(id, "User cancelled");
      fetchTokens();
    } catch {
      // fail silently
    }
  };

  const tokens = tab === "active" ? active : past;

  return (
    <ProtectedRoute loginRole="customer">
      <PageShell maxWidth="max-w-3xl">
          <PageHeader title="My Tokens" description="Track all your queue tokens" />

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            {(["active", "past"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  tab === t
                    ? "bg-white text-black"
                    : "bg-white/[0.05] text-neutral-400 hover:text-white"
                }`}
              >
                {t === "active" ? `Active (${active.length})` : `Past (${past.length})`}
              </button>
            ))}
          </div>

          {/* Token List */}
          {loading ? (
            <LoadingSpinner />
          ) : tokens.length === 0 ? (
            <EmptyState
              title={tab === "active" ? "No active tokens" : "No past tokens"}
              description={
                tab === "active"
                  ? "Join a queue from Discover to get started."
                  : "Completed tokens will appear here."
              }
              action={
                tab === "active" ? (
                  <Link
                    href="/discover"
                    className="inline-block text-sm text-white border border-white/10 px-5 py-2 rounded-full hover:bg-white/5 transition-colors"
                  >
                    Discover queues
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-4">
              {tokens.map((token, i) => {
                const isActive = ["waiting", "called", "serving"].includes(token.status);
                const CardWrapper = isActive ? MovingBorder : motion.div;
                const wrapperProps = isActive
                  ? { className: "p-6" }
                  : {
                      initial: { opacity: 0, y: 10 } as const,
                      animate: { opacity: 1, y: 0 } as const,
                      transition: { delay: i * 0.05 },
                      className: "p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]",
                    };

                return (
                  <CardWrapper key={token._id} {...(wrapperProps as Record<string, unknown>)}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-neutral-500">{token.organizationId?.name}</p>
                        <p className="text-white font-medium">{token.queueId?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-3xl font-bold text-white">
                          #{token.tokenNumber}
                        </p>
                        <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(token.status)}`}>
                          {token.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    {isActive && (
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex gap-6">
                          <div>
                            <p className="text-xs text-neutral-500">Ahead</p>
                            <p className="text-lg font-semibold text-white">{token.tokensAhead}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500">Est. Wait</p>
                            <p className="text-lg font-semibold text-white">
                              {formatWaitTime(token.estimatedWaitMs || 0)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCancel(token._id)}
                          className="px-4 py-2 rounded-full text-sm text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </CardWrapper>
                );
              })}
            </div>
          )}
      </PageShell>
    </ProtectedRoute>
  );
}
