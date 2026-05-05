import { Header } from "@/components/shell/header";
import { PoliciesClient } from "@/components/platform/policies-client";

export default function PoliciesPage() {
  return (
    <>
      <Header
        title="Policies"
        subtitle="Scan and merge requirements by business criticality — mission-critical apps carry heavier gates, pentest cadence, and exception controls."
      />
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-8">
        <PoliciesClient />
      </div>
    </>
  );
}
