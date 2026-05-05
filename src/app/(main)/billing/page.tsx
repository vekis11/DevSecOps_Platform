import { Suspense } from "react";
import { Header } from "@/components/shell/header";
import { BillingClient } from "@/components/billing/billing-client";

export default function BillingPage() {
  return (
    <>
      <Header
        title="Subscriptions & entitlements"
        subtitle="Grant customers access per engine (SAST, DAST, …). Cookies drive gating in this demo; replace with your auth service in production."
      />
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-8">
        <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
          <BillingClient />
        </Suspense>
      </div>
    </>
  );
}
