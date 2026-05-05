import { Header } from "@/components/shell/header";
import { CheckCircle2, Circle } from "lucide-react";

const pipelines = [
  {
    name: "platform/api — main",
    provider: "GitHub Actions",
    lastRun: "12 min ago",
    checks: [
      { label: "Semgrep", ok: true },
      { label: "Trivy fs + image", ok: true },
      { label: "TruffleHog", ok: true },
      { label: "OWASP ZAP (staging)", ok: false },
    ],
  },
  {
    name: "platform/infra — PR #412",
    provider: "GitHub Actions",
    lastRun: "1 hr ago",
    checks: [
      { label: "Checkov", ok: true },
      { label: "tfsec", ok: true },
      { label: "OPA Conftest", ok: true },
    ],
  },
  {
    name: "data/lakehouse — nightly",
    provider: "Azure DevOps",
    lastRun: "6 hr ago",
    checks: [
      { label: "Snyk SCA", ok: true },
      { label: "CodeQL", ok: true },
      { label: "Secret scanning", ok: true },
    ],
  },
];

export default function PipelinesPage() {
  return (
    <>
      <Header
        title="CI / CD posture"
        subtitle="Required checks, OIDC roles, and artifact provenance — extend with your org's compliance tags."
      />
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto max-w-6xl space-y-4">
          {pipelines.map((p) => (
            <article
              key={p.name}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-semibold text-white">{p.name}</h2>
                <span className="text-xs text-zinc-500">
                  {p.provider} · {p.lastRun}
                </span>
              </div>
              <ul className="mt-4 flex flex-wrap gap-3">
                {p.checks.map((c) => (
                  <li
                    key={c.label}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/25 px-2.5 py-1.5 text-xs text-zinc-300"
                  >
                    {c.ok ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-amber-400" aria-hidden />
                    )}
                    {c.label}
                    {!c.ok && (
                      <span className="ml-1 text-amber-200/90">attention</span>
                    )}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
