import { Header } from "@/components/shell/header";
import { DomainHubClient } from "@/components/engines/domain-hub-client";

export default function DastPage() {
  return (
    <>
      <Header
        title="DAST control"
        subtitle="Authenticated API and browser coverage in ephemeral environments — correlate with deploy IDs."
      />
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-8">
        <DomainHubClient domain="dast" />
      </div>
    </>
  );
}
