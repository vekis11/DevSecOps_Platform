import { Header } from "@/components/shell/header";
import { integrationCatalog } from "@/lib/integrations";
import { ExternalLink, Link2 } from "lucide-react";
import clsx from "clsx";

function StatusPill({ status }: { status: (typeof integrationCatalog)[0]["status"] }) {
  const map = {
    connected: "bg-emerald-500/15 text-emerald-200 ring-emerald-500/35",
    available: "bg-sky-500/15 text-sky-200 ring-sky-500/35",
    planned: "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30",
  };
  return (
    <span
      className={clsx(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset",
        map[status],
      )}
    >
      {status}
    </span>
  );
}

export default function IntegrationsPage() {
  const grouped = integrationCatalog.reduce(
    (acc, tool) => {
      acc[tool.category] = acc[tool.category] ?? [];
      acc[tool.category].push(tool);
      return acc;
    },
    {} as Record<string, typeof integrationCatalog>,
  );

  const order = ["iac", "sast", "dast", "sca", "secrets", "cicd", "k8s"];

  return (
    <>
      <Header
        title="Integrations"
        subtitle="Nexus ASPM ingests signals from your toolchain — SARIF, webhooks, and CI artifacts — so posture is owned in one place, not brokered vendor-to-vendor."
      />
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto max-w-6xl space-y-10">
          <section className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
            <div className="flex flex-wrap items-center gap-3">
              <Link2 className="h-5 w-5 text-cyan-300" />
              <div>
                <h2 className="text-sm font-semibold text-white">Ingest into Nexus ASPM</h2>
                <p className="text-xs text-zinc-400">
                  Your scanners and pipelines publish <strong className="text-zinc-300">to Nexus</strong> (for
                  example SARIF 2.1.0 via{" "}
                  <code className="rounded bg-black/40 px-1 text-cyan-200">POST /api/ingest/sarif</code> in this
                  build). GitHub, GitLab, and Azure DevOps authenticate <em>to Nexus</em> so results and policy
                  converge here — Nexus is not a passthrough between third-party tools and your SCM.
                </p>
              </div>
            </div>
          </section>

          {order.map((cat) => {
            const tools = grouped[cat];
            if (!tools?.length) return null;
            return (
              <section key={cat}>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                  {cat}
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {tools.map((t) => (
                    <article
                      key={t.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-white">{t.name}</h3>
                          <p className="text-xs text-zinc-500">{t.vendor}</p>
                        </div>
                        <StatusPill status={t.status} />
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{t.description}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {t.ingest.map((i) => (
                          <span
                            key={i}
                            className="rounded-md bg-black/30 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400"
                          >
                            {i}
                          </span>
                        ))}
                      </div>
                      <a
                        href={t.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-cyan-300 hover:text-cyan-200"
                      >
                        Documentation
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
