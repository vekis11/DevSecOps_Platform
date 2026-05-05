import Link from "next/link";
import { Header } from "@/components/shell/header";
import { ScansMatrixClient } from "@/components/scans/scans-matrix-client";
import { DOMAIN_CONFIG, type EngineDomain } from "@/lib/scan-domain-config";
import { GitHubMark } from "@/components/icons/github-mark";
import { ArrowRight } from "lucide-react";

const engineCards: EngineDomain[] = ["sast", "dast", "sca", "iac", "secrets", "cloud"];

export default function ScansPage() {
  return (
    <>
      <Header
        title="Scan matrix"
        subtitle="Coverage by modality — interactive table plus quick links to engine rooms. CI publishes results into Nexus ASPM; this view is the operator control surface."
      />
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-8">
        <div className="mx-auto max-w-6xl space-y-10">
          <ScansMatrixClient />

          <section>
            <h2 className="text-sm font-semibold text-white">Engine rooms (GitHub-bound)</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Deep configuration for workflow dispatch, repo binding, and operator notes per engine.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {engineCards.map((id) => {
                const m = DOMAIN_CONFIG[id];
                return (
                  <article
                    key={id}
                    className="flex flex-col rounded-2xl border border-white/[0.08] bg-[#0c101f]/90 p-5 ring-1 ring-inset ring-white/[0.04] transition hover:border-cyan-500/35"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">Engine</p>
                        <h3 className="mt-1 text-lg font-semibold text-white">{m.label}</h3>
                        <p className="mt-1 text-sm text-zinc-400">{m.short}</p>
                      </div>
                      <GitHubMark className="h-5 w-5 text-zinc-600" />
                    </div>
                    <Link
                      href={`/${id}`}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
                    >
                      Open engine room
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <h2 className="text-sm font-semibold text-white">Penetration testing</h2>
            <p className="mt-2 text-sm text-zinc-400">
              PT findings and retests are tracked alongside automated signals. Use the Analysis hub for modality
              context and Documentation for how evidence should attach to Nexus.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/analysis"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
              >
                Open analysis hub
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs#pentesting"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-zinc-200 hover:border-cyan-500/40"
              >
                Pentest documentation
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
