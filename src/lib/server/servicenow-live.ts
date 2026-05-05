import { getServiceNowConfig } from "./integration-env";

function snowHeaders(cfg: NonNullable<ReturnType<typeof getServiceNowConfig>>) {
  if ("bearer" in cfg) {
    return {
      Authorization: `Bearer ${cfg.bearer}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }
  const b = Buffer.from(`${cfg.user}:${cfg.pass}`).toString("base64");
  return {
    Authorization: `Basic ${b}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

function baseUrl(host: string) {
  const h = host.replace(/^https?:\/\//i, "").split("/")[0];
  return `https://${h}`;
}

export async function verifyServiceNow() {
  const cfg = getServiceNowConfig();
  if (!cfg) {
    return {
      ok: false as const,
      error:
        "Set SERVICENOW_INSTANCE + SERVICENOW_ACCESS_TOKEN (Bearer) or SERVICENOW_USERNAME + SERVICENOW_PASSWORD",
    };
  }
  const url = `${baseUrl(cfg.host)}/api/now/table/sys_properties?sysparm_limit=1`;
  const res = await fetch(url, { headers: snowHeaders(cfg), cache: "no-store" });
  if (!res.ok) {
    const t = await res.text();
    return { ok: false as const, error: t.slice(0, 500) || `HTTP ${res.status}` };
  }
  return { ok: true as const };
}

export async function createServiceNowRecord(options: {
  table: string;
  short_description: string;
  description: string;
}) {
  const cfg = getServiceNowConfig();
  if (!cfg) return { ok: false as const, error: "ServiceNow not configured on server" };
  const table = options.table.replace(/[^a-zA-Z0-9_]/g, "") || "incident";
  const url = `${baseUrl(cfg.host)}/api/now/table/${table}`;
  const res = await fetch(url, {
    method: "POST",
    headers: snowHeaders(cfg),
    body: JSON.stringify({
      short_description: options.short_description.slice(0, 160),
      description: options.description.slice(0, 100000),
    }),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    return { ok: false as const, error: text.slice(0, 800) || `HTTP ${res.status}` };
  }
  const data = JSON.parse(text) as { result?: { sys_id?: string; number?: string } };
  const sysId = data.result?.sys_id;
  const number = data.result?.number;
  const link = sysId
    ? `${baseUrl(cfg.host)}/nav_to.do?uri=${encodeURIComponent(`${table}.do?sys_id=${sysId}`)}`
    : baseUrl(cfg.host);
  return { ok: true as const, sysId: sysId ?? "", number: number ?? "", url: link };
}
