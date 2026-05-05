"use client";

import { Bell, Search } from "lucide-react";

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="relative flex shrink-0 flex-col border-b border-white/[0.08] bg-[#070b14]/85 backdrop-blur-xl">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      <div className="flex items-start justify-between gap-4 px-6 py-5 md:px-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white md:text-2xl">{title}</h1>
          {subtitle ? (
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-zinc-400">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <div className="relative hidden lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              placeholder="Repos, CVEs, rules, tickets…"
              className="w-64 rounded-lg border border-white/10 bg-black/40 py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 xl:w-80"
              aria-label="Global search"
            />
          </div>
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-black/30 text-zinc-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 shadow shadow-rose-500/60" />
          </button>
        </div>
      </div>
    </header>
  );
}
