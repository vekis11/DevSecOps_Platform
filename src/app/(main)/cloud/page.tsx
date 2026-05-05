import { Header } from "@/components/shell/header";
import { DomainHubClient } from "@/components/engines/domain-hub-client";

export default function CloudPage() {
  return (
    <>
      <Header
        title="Cloud security control"
        subtitle="CSPM, IAM blast radius, CI OIDC roles — one graph across build, deploy, and runtime."
      />
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-8">
        <DomainHubClient domain="cloud" />
      </div>
    </>
  );
}
