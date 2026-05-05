"use client";

import { useEffect, useMemo, useState } from "react";
import type { IaCException } from "@/lib/types";
import { exceptionToSnippets } from "@/lib/iac-exception-snippets";
import { Copy, Plus, Trash2 } from "lucide-react";

const STORAGE_KEY = "nexus-aspm-iac-exceptions";

const defaultSeed: IaCException[] = [
  {
    id: "ex-1",
    ruleId: "CKV_AWS_79",
    resourcePath: "infra/modules/s3/main.tf",
    line: 42,
    reason: "Legacy bucket; encryption migration tracked in INFRA-8842",
    approvedBy: "sec-champion@example.com",
    expiresAt: "2026-06-30",
    createdAt: "2026-04-15",
    engine: "checkov",
  },
];

function load(): IaCException[] {
  if (typeof window === "undefined") return defaultSeed;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSeed));
      return defaultSeed;
    }
    return JSON.parse(raw) as IaCException[];
  } catch {
    return defaultSeed;
  }
}

function save(list: IaCException[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function ExceptionManager() {
  const [items, setItems] = useState<IaCException[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setItems(load());
  }, []);

  const selected = useMemo(
    () => items.find((i) => i.id === selectedId) ?? items[0] ?? null,
    [items, selectedId],
  );

  useEffect(() => {
    if (items.length && !selectedId) setSelectedId(items[0].id);
  }, [items, selectedId]);

  function addException() {
    const id = `ex-${crypto.randomUUID().slice(0, 8)}`;
    const next: IaCException = {
      id,
      ruleId: "CKV_AWS_19",
      resourcePath: "infra/example.tf",
      line: 1,
      reason: "Document risk and owner",
      approvedBy: "you@company.com",
      expiresAt: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      createdAt: new Date().toISOString().slice(0, 10),
      engine: "checkov",
    };
    const list = [next, ...items];
    setItems(list);
    save(list);
    setSelectedId(id);
  }

  function remove(id: string) {
    const list = items.filter((i) => i.id !== id);
    setItems(list);
    save(list);
    setSelectedId(list[0]?.id ?? null);
  }

  function patch(id: string, partial: Partial<IaCException>) {
    const list = items.map((i) => (i.id === id ? { ...i, ...partial } : i));
    setItems(list);
    save(list);
  }

  const snippets = selected ? exceptionToSnippets(selected) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,1.1fr]">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-white">Active exceptions</h2>
          <button
            type="button"
            onClick={addException}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/20 px-3 py-1.5 text-xs font-medium text-cyan-200 ring-1 ring-cyan-500/40 hover:bg-cyan-500/30"
          >
            <Plus className="h-3.5 w-3.5" />
            New exception
          </button>
        </div>
        <ul className="flex max-h-[420px] flex-col gap-2 overflow-y-auto pr-1">
          {items.map((ex) => (
            <li key={ex.id}>
              <button
                type="button"
                onClick={() => setSelectedId(ex.id)}
                className={`flex w-full flex-col rounded-xl border px-3 py-3 text-left transition ${
                  selected?.id === ex.id
                    ? "border-cyan-500/50 bg-cyan-500/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                <span className="text-xs font-mono text-cyan-300">{ex.ruleId}</span>
                <span className="mt-1 truncate text-sm text-zinc-200">{ex.resourcePath}</span>
                <span className="mt-1 text-[11px] text-zinc-500">
                  Expires {ex.expiresAt} · {ex.engine}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        {selected ? (
          <>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-4 flex items-start justify-between gap-2">
                <h2 className="text-sm font-semibold text-white">Exception detail</h2>
                <button
                  type="button"
                  onClick={() => remove(selected.id)}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-300"
                  aria-label="Delete exception"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs text-zinc-500">
                  Rule ID
                  <input
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 font-mono text-sm text-white"
                    value={selected.ruleId}
                    onChange={(e) => patch(selected.id, { ruleId: e.target.value })}
                  />
                </label>
                <label className="text-xs text-zinc-500">
                  Engine
                  <select
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
                    value={selected.engine}
                    onChange={(e) =>
                      patch(selected.id, { engine: e.target.value as IaCException["engine"] })
                    }
                  >
                    <option value="checkov">Checkov</option>
                    <option value="tfsec">tfsec</option>
                    <option value="trivy">Trivy (config)</option>
                    <option value="kics">KICS</option>
                    <option value="terrascan">Terrascan</option>
                  </select>
                </label>
                <label className="text-xs text-zinc-500 sm:col-span-2">
                  Resource path
                  <input
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 font-mono text-sm text-white"
                    value={selected.resourcePath}
                    onChange={(e) => patch(selected.id, { resourcePath: e.target.value })}
                  />
                </label>
                <label className="text-xs text-zinc-500">
                  Line
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
                    value={selected.line}
                    onChange={(e) => patch(selected.id, { line: Number(e.target.value) })}
                  />
                </label>
                <label className="text-xs text-zinc-500">
                  Expires
                  <input
                    type="date"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
                    value={selected.expiresAt}
                    onChange={(e) => patch(selected.id, { expiresAt: e.target.value })}
                  />
                </label>
                <label className="text-xs text-zinc-500 sm:col-span-2">
                  Reason (audit trail)
                  <textarea
                    className="mt-1 min-h-[72px] w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
                    value={selected.reason}
                    onChange={(e) => patch(selected.id, { reason: e.target.value })}
                  />
                </label>
                <label className="text-xs text-zinc-500 sm:col-span-2">
                  Approved by
                  <input
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
                    value={selected.approvedBy}
                    onChange={(e) => patch(selected.id, { approvedBy: e.target.value })}
                  />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="text-sm font-semibold text-white">Inline suppression snippets</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Paste beside the resource. Your CI should still fail if the exception expires or the
                rule ID drifts.
              </p>
              <div className="mt-4 space-y-3">
                {snippets &&
                  Object.entries(snippets).map(([k, v]) => (
                    <div key={k}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                          {k}
                        </span>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(v)}
                          className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-300 hover:bg-white/10"
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </button>
                      </div>
                      <pre className="overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-3 text-xs leading-relaxed text-cyan-100/90">
                        {v}
                      </pre>
                    </div>
                  ))}
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-zinc-500">No exceptions yet. Create one to generate snippets.</p>
        )}
      </div>
    </div>
  );
}
