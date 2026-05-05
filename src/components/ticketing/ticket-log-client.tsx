"use client";

import { useEffect, useState } from "react";
import { readStore, STORE_KEYS } from "@/lib/client-store";
import type { TicketLogEntry } from "@/lib/ticketing-types";
import { ExternalLink } from "lucide-react";

export function TicketLogClient() {
  const [log, setLog] = useState<TicketLogEntry[]>([]);

  useEffect(() => {
    setLog(readStore<TicketLogEntry[]>(STORE_KEYS.ticketLog, []));
    const id = setInterval(
      () => setLog(readStore<TicketLogEntry[]>(STORE_KEYS.ticketLog, [])),
      2000,
    );
    return () => clearInterval(id);
  }, []);

  if (!log.length) {
    return (
      <p className="rounded-xl border border-dashed border-white/15 bg-black/20 px-4 py-6 text-center text-sm text-zinc-500">
        No tickets created from findings yet. Open <strong className="text-zinc-300">Findings</strong>{" "}
        and use <strong className="text-zinc-300">Create issue</strong> after connecting a target here.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-white/10 rounded-xl border border-white/10 bg-[#0c101f]/80">
      {log.map((e) => (
        <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-white">{e.title}</p>
            <p className="text-[11px] text-zinc-500">
              {e.target.toUpperCase()} · {new Date(e.createdAt).toLocaleString()} · {e.id}
            </p>
          </div>
          <a
            href={e.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-cyan-300 hover:bg-white/10"
          >
            Open
            <ExternalLink className="h-3 w-3" />
          </a>
        </li>
      ))}
    </ul>
  );
}
