import { Header } from "@/components/shell/header";
import { DomainHubClient } from "@/components/engines/domain-hub-client";

export default function SastPage() {
  return (
    <>
      <Header
        title="SAST control"
        subtitle="Shift-left static analysis with merge-blocking signal, not dashboard noise."
      />
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-8">
        <DomainHubClient domain="sast" />
      </div>
    </>
  );
}
