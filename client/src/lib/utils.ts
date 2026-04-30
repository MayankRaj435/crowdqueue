import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatWaitTime(ms: number): string {
  if (ms <= 0) return "Now";
  const minutes = Math.ceil(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `${hours}h ${remaining}m`;
}

export function getWaitColor(ms: number): string {
  const minutes = ms / 60000;
  if (minutes < 5) return "text-red-400";
  if (minutes < 15) return "text-amber-400";
  return "text-emerald-400";
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "waiting": return "bg-white/10 text-white";
    case "called": return "bg-amber-500/20 text-amber-400";
    case "serving": return "bg-emerald-500/20 text-emerald-400";
    case "served": return "bg-emerald-500/20 text-emerald-400";
    case "cancelled": return "bg-white/5 text-neutral-500";
    case "no_show": return "bg-red-500/20 text-red-400";
    case "expired": return "bg-white/5 text-neutral-500";
    case "skipped": return "bg-amber-500/20 text-amber-400";
    default: return "bg-white/10 text-white";
  }
}
