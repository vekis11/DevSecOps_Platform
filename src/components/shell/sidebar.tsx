"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Briefcase,
  Cloud,
  Code2,
  CreditCard,
  FileWarning,
  GitBranch,
  Globe,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  Layers,
  LineChart,
  Package,
  Plug,
  Scale,
  ScanSearch,
  Shield,
  ShieldAlert,
  Sparkles,
  Terminal,
  Ticket,
} from "lucide-react";
import clsx from "clsx";
import { useSubscriptionModules, canShowEngine } from "@/hooks/use-subscription-modules";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const primary: NavItem[] = [
  { href: "/dashboard", label: "Command center", icon: LayoutDashboard },
  { href: "/findings", label: "Findings", icon: ShieldAlert },
  { href: "/ticketing", label: "Ticketing", icon: Ticket },
];

const engines: NavItem[] = [
  { href: "/sast", label: "SAST", icon: Code2 },
  { href: "/dast", label: "DAST", icon: Globe },
  { href: "/sca", label: "SCA", icon: Package },
  { href: "/iac", label: "IaC", icon: Layers },
  { href: "/secrets", label: "Secrets", icon: KeyRound },
  { href: "/cloud", label: "Cloud", icon: Cloud },
];

const platform: NavItem[] = [
  { href: "/apis", label: "APIs & keys", icon: Terminal },
  { href: "/policies", label: "Policies", icon: Scale },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/analysis", label: "Analysis hub", icon: LineChart },
];

const ops: NavItem[] = [
  { href: "/billing", label: "Subscriptions", icon: CreditCard },
  { href: "/scans", label: "Scan matrix", icon: ScanSearch },
  { href: "/integrations", label: "Integrations", icon: Plug },
  { href: "/exceptions", label: "IaC exceptions", icon: FileWarning },
  { href: "/pipelines", label: "Pipelines", icon: GitBranch },
];

const learn: NavItem[] = [
  { href: "/training", label: "Training", icon: GraduationCap },
  { href: "/docs", label: "Documentation", icon: BookOpen },
];

function NavGroup({
  title,
  items,
  pathname,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <div className="px-2">
      <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">
        {title}
      </p>
      <div className="flex flex-col gap-0.5">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-gradient-to-r from-cyan-500/15 to-violet-600/10 text-white ring-1 ring-cyan-500/35"
                  : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100",
              )}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-85" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const modules = useSubscriptionModules();
  const enginesFiltered = engines.filter((e) => canShowEngine(modules, e.href));

  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-white/[0.08] bg-[#050814]/95 shadow-[4px_0_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
          <Sparkles className="h-5 w-5 text-white" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-white">Nexus ASPM</p>
          <p className="text-[10px] font-medium uppercase tracking-widest text-cyan-400/90">
            Your security posture platform
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto py-4">
        <NavGroup title="Posture" items={primary} pathname={pathname} />
        <NavGroup title="Engines" items={enginesFiltered} pathname={pathname} />
        <NavGroup title="Platform" items={platform} pathname={pathname} />
        <NavGroup title="Operations" items={ops} pathname={pathname} />
        <NavGroup title="Learn" items={learn} pathname={pathname} />
      </nav>

      <div className="border-t border-white/[0.08] p-4">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2">
          <Shield className="h-4 w-4 text-emerald-400/90" aria-hidden />
          <p className="text-[11px] leading-snug text-zinc-500">
            Entitlements: <span className="text-zinc-400">Subscriptions</span>. Repo prefs in{" "}
            <span className="text-zinc-400">localStorage</span>; server secrets in{" "}
            <span className="text-zinc-400">.env.local</span>.
          </p>
        </div>
      </div>
    </aside>
  );
}
