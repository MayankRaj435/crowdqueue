"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { TextFlippingBoard } from "@/components/ui/text-flipping-board";
import { queueApi } from "@/api/queueApi";
import { formatWaitTime } from "@/lib/utils";

interface QueueDisplay {
  _id: string;
  name: string;
  status: string;
  currentToken: number;
  waiting: number;
  avgServiceTimeMs: number;
  organizationId?: { name: string };
}

function buildBoardMessage(queue: QueueDisplay): string {
  const org = queue.organizationId?.name ?? "CROWDQUEUE";
  if (queue.status === "paused") {
    return `${org}\nQUEUE PAUSED\nPLEASE WAIT`;
  }
  if (queue.status === "closed") {
    return `${org}\nQUEUE CLOSED\nSEE YOU SOON`;
  }
  const wait = formatWaitTime(queue.waiting * queue.avgServiceTimeMs);
  return `NOW SERVING\nTOKEN #${queue.currentToken}\n${queue.waiting} WAITING · ${wait}`;
}

export default function QueueDisplayPage() {
  const { id } = useParams<{ id: string }>();
  const [queue, setQueue] = useState<QueueDisplay | null>(null);
  const [error, setError] = useState("");
  const [msgIndex, setMsgIndex] = useState(0);

  const fetchQueue = useCallback(async () => {
    try {
      const res = await queueApi.getById(id);
      const q = (res.data as { queue: QueueDisplay }).queue;
      setQueue(q);
      setError("");
    } catch {
      setError("Unable to load queue display");
    }
  }, [id]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 4000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const messages = useMemo(() => {
    if (!queue) return ["LOADING QUEUE\nPLEASE WAIT"];
    const primary = buildBoardMessage(queue);
    const secondary =
      queue.status === "active"
        ? `${queue.name}\nEST. WAIT ${formatWaitTime(queue.waiting * queue.avgServiceTimeMs)}`
        : "SKIP THE LINE\nNOT THE SERVICE";
    return [primary, secondary];
  }, [queue]);

  const boardText = messages[msgIndex % messages.length];

  useEffect(() => {
    const t = setInterval(() => setMsgIndex((i) => i + 1), 8000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setMsgIndex(0);
  }, [boardText]);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-8">
        {error ? (
          <p className="text-red-400 font-mono">{error}</p>
        ) : (
          <>
            <TextFlippingBoard text={boardText} className="max-w-4xl w-full" />
            {queue && (
              <p className="text-neutral-500 text-sm font-mono tracking-widest uppercase text-center">
                {queue.name} · Live display
              </p>
            )}
          </>
        )}
      </div>
      <footer className="py-4 text-center border-t border-white/[0.04]">
        <Link
          href={`/queue/${id}`}
          className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
        >
          Join this queue on your phone →
        </Link>
      </footer>
    </div>
  );
}
