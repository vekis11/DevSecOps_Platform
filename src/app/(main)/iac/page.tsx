import { Header } from "@/components/shell/header";
import { DomainHubClient } from "@/components/engines/domain-hub-client";

export default function IacPage() {
  return (
    <>
      <Header
        title="IaC control"
        subtitle="Policy on rendered artifacts + drift — pair inline skips with ASPM exceptions and expiry."
      />
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-8">
        <DomainHubClient domain="iac" />
      </div>
    </>
  );
}
