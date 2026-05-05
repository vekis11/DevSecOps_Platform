import { Header } from "@/components/shell/header";
import { PortfolioClient } from "@/components/platform/portfolio-client";

export default function PortfolioPage() {
  return (
    <>
      <Header
        title="Portfolio"
        subtitle="Applications, owners, and business criticality — the spine for policy inheritance, scan coverage targets, and admin oversight."
      />
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-8">
        <PortfolioClient />
      </div>
    </>
  );
}
