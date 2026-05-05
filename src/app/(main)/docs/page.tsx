import { Header } from "@/components/shell/header";
import { DocsHubClient } from "@/components/docs/docs-hub-client";

export default function DocsPage() {
  return (
    <>
      <Header
        title="Documentation"
        subtitle="Nexus ASPM concepts: ingest, authentication, policies, portfolio, pentesting, and training — with runnable curl examples where applicable."
      />
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-8">
        <DocsHubClient />
      </div>
    </>
  );
}
