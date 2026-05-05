import { Header } from "@/components/shell/header";
import { FindingsTableClient } from "@/components/findings/findings-table-client";
import { mockFindings } from "@/lib/findings";

export default function FindingsPage() {
  return (
    <>
      <Header
        title="Unified backlog"
        subtitle="Intel drawer: OSV + NVD + MITRE/GitHub links, heuristic fixes, optional GPT remediation (OPENAI_API_KEY). Ticketing: verify targets first."
      />
      <div className="flex-1 overflow-x-auto overflow-y-auto px-6 py-8 md:px-8">
        <div className="mx-auto max-w-6xl">
          <FindingsTableClient rows={mockFindings} />
        </div>
      </div>
    </>
  );
}
