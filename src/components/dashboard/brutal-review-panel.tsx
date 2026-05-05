"use client";

import { BRUTAL_REVIEW_ITEMS } from "@/lib/brutal-review";
import { ChevronDown, Skull } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";

const areaStyle: Record<string, string> = {
  data: "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30",
  auth: "bg-rose-500/15 text-rose-200 ring-rose-500/35",
  integrations: "bg-cyan-500/15 text-cyan-200 ring-cyan-500/35",
  ux: "bg-amber-500/15 text-amber-200 ring-amber-500/35",
  scale: "bg-violet-500/15 text-violet-200 ring-violet-500/35",
};

export function BrutalReviewPanel() {
  const [open, setOpen] = useState(true);

  return (
    <section className="rounded-2xl border border-rose-500/25 bg-gradient-to-br from-rose-950/40 to-black/50 p-6 ring-1 ring-inset ring-rose-500/10">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 ring-1 ring-rose-400/40">
            <Skull className="h-5 w-5 text-rose-200" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-white">Brutal review (demo honesty)</h2>
            <p className="text-xs text-rose-100/70">
              What is fake, stubbed, or unsafe if mistaken for production — read before you demo to executives.
            </p>
          </div>
        </div>
        <ChevronDown
          className={clsx("h-5 w-5 shrink-0 text-rose-300/80 transition", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <ul className="mt-5 space-y-3">
          {BRUTAL_REVIEW_ITEMS.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 ring-1 ring-inset ring-white/[0.04]"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-white">{item.title}</p>
                <span
                  className={clsx(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset",
                    areaStyle[item.area] ?? areaStyle.data,
                  )}
                >
                  {item.area}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{item.detail}</p>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs text-zinc-500">
        Full narrative also lives in{" "}
        <Link href="/docs#brutal-review" className="text-cyan-400 hover:text-cyan-300">
          Documentation → Brutal review
        </Link>
        .
      </p>
    </section>
  );
}
