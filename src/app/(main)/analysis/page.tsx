import { Header } from "@/components/shell/header";
import { AnalysisHubClient } from "@/components/platform/analysis-hub-client";

export default function AnalysisPage() {
  return (
    <>
      <Header
        title="Analysis hub"
        subtitle="Interactive lenses across SAST, DAST, SCA, IaC, secrets, penetration testing, and cloud posture — each ties back to engine rooms and the unified backlog."
      />
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-8">
        <AnalysisHubClient />
      </div>
    </>
  );
}
