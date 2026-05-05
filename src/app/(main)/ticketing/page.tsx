import { Header } from "@/components/shell/header";
import { TicketingHubClient } from "@/components/ticketing/ticketing-hub-client";
import { TicketLogClient } from "@/components/ticketing/ticket-log-client";

export default function TicketingPage() {
  return (
    <>
      <Header
        title="Ticketing & routing"
        subtitle="Jira, ServiceNow, and GitHub Issues — one-click from findings when backends are wired."
      />
      <div className="flex-1 space-y-8 overflow-y-auto px-6 py-8 md:px-8">
        <TicketingHubClient />
        <section>
          <h2 className="text-sm font-semibold text-white">Recent exports from ASPM</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Logged locally for demo. Replace with your API audit trail in production.
          </p>
          <div className="mt-4">
            <TicketLogClient />
          </div>
        </section>
      </div>
    </>
  );
}
