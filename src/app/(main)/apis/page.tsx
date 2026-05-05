import { Header } from "@/components/shell/header";
import { ApiAccessClient } from "@/components/platform/api-access-client";

export default function ApisPage() {
  return (
    <>
      <Header
        title="APIs & keys"
        subtitle="Create Nexus API keys, review integration endpoints, and read how CI should authenticate into Nexus — not broker vendors through your SCM."
      />
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-8">
        <ApiAccessClient />
      </div>
    </>
  );
}
