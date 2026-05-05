"use client";

import { useMemo, useState } from "react";
import type { Finding, Severity } from "@/lib/types";
import { readStore, writeStore, STORE_KEYS } from "@/lib/client-store";
import { defaultTicketingState } from "@/lib/ticketing-types";
import type { TicketLogEntry } from "@/lib/ticketing-types";
import clsx from "clsx";
import { ChevronDown, ExternalLink, Loader2, Sparkles, TicketPlus } from "lucide-react";
import { FindingIntelPanel } from "@/components/findings/finding-intel-panel";

const severityStyle: Record<Severity, string> = {
  critical: "bg-rose-500/20 text-rose-200 ring-rose-500/40",
  high: "bg-orange-500/20 text-orange-200 ring-orange-500/40",
  medium: "bg-amber-500/15 text-amber-100 ring-amber-500/35",
  low: "bg-sky-500/15 text-sky-100 ring-sky-500/35",
  info: "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30",
};

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function findingBody(f: Finding) {
  return [
    `**Rule:** \`${f.ruleId}\``,
    `**Tool:** ${f.tool}`,
    `**Severity:** ${f.severity}`,
    `**Location:** \`${f.file}${f.line > 0 ? `:${f.line}` : ""}\``,
    `**Repo:** ${f.repo} @ ${f.branch}`,
    "",
    "_Created from Nexus ASPM._",
  ].join("\n");
}

export function FindingsTableClient({ rows }: { rows: Finding[] }) {
  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) => {
        const order: Severity[] = ["critical", "high", "medium", "low", "info"];
        return order.indexOf(a.severity) - order.indexOf(b.severity);
      }),
    [rows],
  );

  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [creating, setCreating] = useState<string | null>(null);
  const [intelFinding, setIntelFinding] = useState<Finding | null>(null);

  const createTicket = async (finding: Finding, target: TicketLogEntry["target"]) => {
    const t = readStore(STORE_KEYS.ticketing, defaultTicketingState());
    const log = readStore<TicketLogEntry[]>(STORE_KEYS.ticketLog, []);
    const id = `TKT-${Date.now().toString(36).toUpperCase()}`;
    setOpenMenu(null);

    if (target === "jira" && !t.jira.connected) {
      setToast({ type: "err", text: "Verify Jira on the Ticketing page first." });
      setTimeout(() => setToast(null), 5000);
      return;
    }
    if (target === "servicenow" && !t.servicenow.connected) {
      setToast({ type: "err", text: "Verify ServiceNow on the Ticketing page first." });
      setTimeout(() => setToast(null), 5000);
      return;
    }
    if (target === "github" && !t.githubIssues.connected) {
      setToast({ type: "err", text: "Verify GitHub backlog repo on the Ticketing page first." });
      setTimeout(() => setToast(null), 5000);
      return;
    }

    setCreating(`${finding.id}-${target}`);
    try {
      let url = "";
      if (target === "jira") {
        const res = await fetch("/api/integrations/jira/issue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectKey: t.jira.projectKey,
            summary: `[ASPM] ${finding.title}`.slice(0, 255),
            description: findingBody(finding),
            issueType: t.jira.issueType,
          }),
        });
        const data = (await res.json()) as { error?: string; url?: string; key?: string };
        if (!res.ok) throw new Error(data.error || res.statusText);
        url = data.url ?? "";
      } else if (target === "servicenow") {
        const res = await fetch("/api/integrations/servicenow/incident", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            table: t.servicenow.table,
            short_description: `[ASPM] ${finding.title}`.slice(0, 160),
            description: findingBody(finding),
          }),
        });
        const data = (await res.json()) as { error?: string; url?: string };
        if (!res.ok) throw new Error(data.error || res.statusText);
        url = data.url ?? "";
      } else {
        const labels = t.githubIssues.label
          ? t.githubIssues.label.split(",").map((s) => s.trim()).filter(Boolean)
          : [];
        const res = await fetch("/api/integrations/github/issue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            owner: t.githubIssues.owner,
            repo: t.githubIssues.repo,
            title: `[ASPM] ${finding.title}`.slice(0, 200),
            body: findingBody(finding),
            labels,
          }),
        });
        const data = (await res.json()) as { error?: string; url?: string };
        if (!res.ok) throw new Error(data.error || res.statusText);
        url = data.url ?? "";
      }

      const entry: TicketLogEntry = {
        id,
        target,
        findingId: finding.id,
        title: finding.title,
        createdAt: new Date().toISOString(),
        url,
      };
      writeStore(STORE_KEYS.ticketLog, [entry, ...log]);
      setToast({ type: "ok", text: `Created in ${target.toUpperCase()} — opening…` });
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setToast({
        type: "err",
        text: e instanceof Error ? e.message : "Ticketing API failed",
      });
    } finally {
      setCreating(null);
      setTimeout(() => setToast(null), 6000);
    }
  };

  return (
    <div className="relative">
      {toast && (
        <div
          className={clsx(
            "fixed bottom-6 right-6 z-50 max-w-md rounded-xl border px-4 py-3 text-sm shadow-2xl ring-1 ring-black/50",
            toast.type === "ok"
              ? "border-emerald-500/30 bg-zinc-950/95 text-emerald-100 ring-white/10"
              : "border-rose-500/40 bg-zinc-950/95 text-rose-100 ring-white/10",
          )}
        >
          {toast.text}
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0e18]/80 shadow-xl shadow-black/40">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="border-b border-white/10 bg-black/40 text-[11px] uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Severity</th>
              <th className="px-4 py-3 font-semibold">Finding</th>
              <th className="px-4 py-3 font-semibold">Domain</th>
              <th className="px-4 py-3 font-semibold">Tool</th>
              <th className="px-4 py-3 font-semibold">Location</th>
              <th className="px-4 py-3 font-semibold">Repo</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Intel</th>
              <th className="px-4 py-3 font-semibold">Ticketing</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {sorted.map((f) => (
              <tr key={f.id} className="hover:bg-white/[0.03]">
                <td className="px-4 py-3 align-top">
                  <span
                    className={clsx(
                      "inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset",
                      severityStyle[f.severity],
                    )}
                  >
                    {f.severity}
                  </span>
                </td>
                <td className="max-w-xs px-4 py-3 align-top">
                  <span className="font-medium text-zinc-100">{f.title}</span>
                  <div className="mt-0.5 font-mono text-[11px] text-zinc-500">{f.ruleId}</div>
                </td>
                <td className="px-4 py-3 align-top capitalize text-zinc-400">{f.category}</td>
                <td className="px-4 py-3 align-top text-zinc-400">{f.tool}</td>
                <td className="px-4 py-3 align-top font-mono text-xs text-cyan-200/90">
                  {f.file}
                  {f.line > 0 ? `:${f.line}` : ""}
                </td>
                <td className="px-4 py-3 align-top text-xs text-zinc-500">
                  {f.repo}
                  <span className="text-zinc-700"> · </span>
                  {f.branch}
                </td>
                <td className="px-4 py-3 align-top text-xs">
                  {f.suppressed ? (
                    <span className="text-violet-300">Suppressed</span>
                  ) : (
                    <span className="text-amber-200/90">Open</span>
                  )}
                </td>
                <td className="px-4 py-3 align-top">
                  <button
                    type="button"
                    onClick={() => setIntelFinding(f)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-1.5 text-xs font-medium text-violet-200 hover:border-violet-400/50 hover:bg-violet-500/20"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    OSV / NVD / AI
                  </button>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="relative">
                    <button
                      type="button"
                      disabled={Boolean(creating?.startsWith(`${f.id}-`))}
                      onClick={() => setOpenMenu((m) => (m === f.id ? null : f.id))}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-white disabled:opacity-50"
                    >
                      {creating?.startsWith(`${f.id}-`) ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <TicketPlus className="h-3.5 w-3.5" />
                      )}
                      Create issue
                      <ChevronDown className="h-3 w-3 opacity-60" />
                    </button>
                    {openMenu === f.id && (
                      <>
                        <button
                          type="button"
                          className="fixed inset-0 z-10 cursor-default bg-transparent"
                          aria-label="Close menu"
                          onClick={() => setOpenMenu(null)}
                        />
                        <div className="absolute right-0 z-20 mt-1 min-w-[200px] rounded-xl border border-white/10 bg-zinc-950 py-1 shadow-2xl ring-1 ring-black/60">
                          <button
                            type="button"
                            className="flex w-full items-center justify-between px-3 py-2 text-left text-xs text-zinc-200 hover:bg-white/10"
                            onClick={() => void createTicket(f, "jira")}
                          >
                            Jira
                            <ExternalLink className="h-3 w-3 opacity-50" />
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center justify-between px-3 py-2 text-left text-xs text-zinc-200 hover:bg-white/10"
                            onClick={() => void createTicket(f, "servicenow")}
                          >
                            ServiceNow
                            <ExternalLink className="h-3 w-3 opacity-50" />
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center justify-between px-3 py-2 text-left text-xs text-zinc-200 hover:bg-white/10"
                            onClick={() => void createTicket(f, "github")}
                          >
                            GitHub Issue
                            <ExternalLink className="h-3 w-3 opacity-50" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-zinc-600">key: aspm-{slug(f.title)}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-zinc-600">
        <strong className="text-zinc-500">Intel</strong> calls live{" "}
        <a
          href="https://google.github.io/osv.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-500 hover:underline"
        >
          OSV
        </a>
        ,{" "}
        <a
          href="https://nvd.nist.gov/developers/vulnerabilities"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-500 hover:underline"
        >
          NVD
        </a>
        , MITRE, and GitHub advisory links. Optional GPT remediation uses{" "}
        <code className="text-zinc-500">OPENAI_API_KEY</code>. Issues use ticketing API routes — verify
        targets on{" "}
        <a href="/ticketing" className="text-cyan-500 hover:underline">
          Ticketing
        </a>
        .
      </p>

      <FindingIntelPanel
        finding={intelFinding}
        open={intelFinding != null}
        onClose={() => setIntelFinding(null)}
      />
    </div>
  );
}
