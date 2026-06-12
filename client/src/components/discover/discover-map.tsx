"use client";

import dynamic from "next/dynamic";
import type { MapOrg } from "./discover-map-inner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const DiscoverMapInner = dynamic(
  () => import("./discover-map-inner").then((m) => m.DiscoverMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] rounded-2xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-center">
        <LoadingSpinner className="py-0" size="md" />
      </div>
    ),
  }
);

export type { MapOrg };

export function DiscoverMap(props: {
  orgs: MapOrg[];
  center: [number, number];
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
}) {
  return (
    <div className="h-[420px] md:h-[480px] rounded-2xl border border-white/[0.08] overflow-hidden relative">
      <DiscoverMapInner {...props} />
    </div>
  );
}
