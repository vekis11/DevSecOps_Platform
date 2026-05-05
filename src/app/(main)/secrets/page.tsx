import { Header } from "@/components/shell/header";
import { DomainHubClient } from "@/components/engines/domain-hub-client";

export default function SecretsPage() {
  return (
    <>
      <Header
        title="Secret scanning control"
        subtitle="Push protection + history + CI artifacts — verified leaks get incident-grade routing."
      />
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-8">
        <DomainHubClient domain="secrets" />
      </div>
    </>
  );
}
