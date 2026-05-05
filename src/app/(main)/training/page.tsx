import { Header } from "@/components/shell/header";
import { TrainingClient } from "@/components/platform/training-client";

export default function TrainingPage() {
  return (
    <>
      <Header
        title="Training"
        subtitle="Structured paths for developers, AppSec, and SRE — linked to documentation and hands-on hubs in Nexus ASPM."
      />
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-8">
        <TrainingClient />
      </div>
    </>
  );
}
