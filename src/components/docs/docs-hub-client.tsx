"use client";

import { DOCS_SECTIONS } from "@/lib/docs-registry";
import { BRUTAL_REVIEW_ITEMS } from "@/lib/brutal-review";
import clsx from "clsx";
import { useEffect, useState } from "react";

const NAV = [
  ...DOCS_SECTIONS.map((s) => ({ href: `#${s.id}`, label: s.title })),
  { href: "#brutal-review", label: "Brutal review (demo)" },
];

export function DocsHubClient() {
  const [hash, setHash] = useState("");

  useEffect(() => {
    const sync = () => setHash(typeof window !== "undefined" ? window.location.hash : "");
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-start">
      <nav className="lg:w-56 lg:shrink-0">
        <div className="sticky top-4 rounded-2xl border border-white/10 bg-[#0c101f]/95 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">On this page</p>
          <ul className="mt-3 space-y-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  className={clsx(
                    "block rounded-lg px-2 py-1.5 text-xs transition",
                    hash === n.href
                      ? "bg-cyan-500/15 text-cyan-100 ring-1 ring-cyan-500/30"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200",
                  )}
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="min-w-0 flex-1 space-y-10">
        {DOCS_SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-white">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.summary}</p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-300">
              {s.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            {s.code && (
              <pre className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-black/50 p-4 font-mono text-xs leading-relaxed text-emerald-200/90">
                {s.code}
              </pre>
            )}
          </section>
        ))}

        <section id="brutal-review" className="scroll-mt-24 rounded-2xl border border-rose-500/25 bg-rose-950/20 p-6">
          <h2 className="text-xl font-semibold text-white">Brutal review (demo)</h2>
          <p className="mt-2 text-sm text-rose-100/80">
            Same content as the dashboard panel — duplicated here for deep links from APIs & keys and onboarding
            emails.
          </p>
          <ul className="mt-4 space-y-3">
            {BRUTAL_REVIEW_ITEMS.map((item) => (
              <li key={item.id} className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm">
                <p className="font-medium text-white">{item.title}</p>
                <p className="mt-1 text-zinc-400">{item.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
