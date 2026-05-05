import { Header } from "@/components/shell/header";
import { DomainHubClient } from "@/components/engines/domain-hub-client";

export default function ScaPage() {
  return (
    <>
      <Header
        title="SCA control"
        subtitle="Dependencies, SBOM, licenses — block merges on exploitable paths, not CVSS alone."
      />
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-8">
        <DomainHubClient domain="sca" />
      </div>
    </>
  );
}
