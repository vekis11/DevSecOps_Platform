import { Header } from "@/components/shell/header";
import { ExceptionManager } from "@/components/exceptions/exception-manager";

export default function ExceptionsPage() {
  return (
    <>
      <Header
        title="IaC inline exceptions"
        subtitle="Time-bound, audited suppressions with copy-paste snippets for Checkov, tfsec, Trivy, KICS, and Terrascan."
      />
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto max-w-6xl">
          <ExceptionManager />
        </div>
      </div>
    </>
  );
}
