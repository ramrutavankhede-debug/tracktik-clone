import { createClient } from "@/lib/supabase/server";
import type {
  AccountType,
  SiteListItem,
  SitesPageData,
  SitesSearchParams,
  SiteStatus,
} from "./types";

const DEMO_ORG_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

function emptyToNull(value: string | null | undefined): string | null {
  if (!value || value.trim() === "") return null;
  return value;
}

type SiteRow = {
  id: string;
  org_id: string;
  account_uid: string;
  account_type: string;
  name: string;
  address: string | null;
  city: string | null;
  contact_first_name: string | null;
  contact_last_name: string | null;
  phone_main: string | null;
  status: string;
  site_template_id: string | null;
  timezone: string | null;
  account_rep_id: string | null;
  sales_rep_id: string | null;
  parent_client_id: string | null;
  parent: { name: string } | { name: string }[] | null;
  site_zones: { zone_id: string }[] | null;
};

export async function getSitesPageData(
  params: SitesSearchParams,
): Promise<SitesPageData> {
  const supabase = createClient();
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = Math.min(
    100,
    Math.max(10, Number(params.pageSize ?? "50") || 50),
  );
  const status = (params.status ?? "active").toLowerCase();
  const type = (params.type ?? "all").toLowerCase();
  const zone = params.zone ?? "all";
  const template = params.template ?? "all";
  const q = (params.q ?? "").trim().toLowerCase();
  const sort = params.sort ?? "name";
  const dir = params.dir === "desc" ? "desc" : "asc";

  const [
    { data: org },
    { data: zones },
    { data: templates },
    { data: employees },
  ] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, timezone")
      .eq("id", DEMO_ORG_ID)
      .maybeSingle(),
    supabase
      .from("zones")
      .select("id, name")
      .eq("org_id", DEMO_ORG_ID)
      .order("name"),
    supabase
      .from("site_templates")
      .select("id, name")
      .eq("org_id", DEMO_ORG_ID)
      .order("name"),
    supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("org_id", DEMO_ORG_ID)
      .order("last_name"),
  ]);

  const orgRow = org as { id: string; timezone: string } | null;
  const orgId = orgRow?.id ?? DEMO_ORG_ID;
  const orgTimezone = orgRow?.timezone ?? "Australia/Melbourne";

  let query = supabase
    .from("sites")
    .select(
      `
      id,
      org_id,
      account_uid,
      account_type,
      name,
      address,
      city,
      contact_first_name,
      contact_last_name,
      phone_main,
      status,
      site_template_id,
      timezone,
      account_rep_id,
      sales_rep_id,
      parent_client_id,
      parent:parent_client_id ( name ),
      site_zones ( zone_id )
    `,
      { count: "exact" },
    )
    .eq("org_id", orgId);

  if (status !== "all") {
    query = query.eq("status", status);
  }
  if (type !== "all") {
    query = query.eq("account_type", type);
  }
  if (template !== "all") {
    query = query.eq("site_template_id", template);
  }

  const sortColumn =
    sort === "address"
      ? "address"
      : sort === "city"
        ? "city"
        : sort === "contact"
          ? "contact_last_name"
          : "name";
  query = query.order(sortColumn, {
    ascending: dir === "asc",
    nullsFirst: false,
  });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data: rows, count, error } = await query.range(from, to);

  if (error) {
    console.error("getSitesPageData", error.message);
  }

  let sitesRaw = (rows as SiteRow[] | null) ?? [];

  if (zone !== "all") {
    sitesRaw = sitesRaw.filter((row) =>
      row.site_zones?.map((z) => z.zone_id).includes(zone),
    );
  }

  if (q) {
    sitesRaw = sitesRaw.filter((row) => {
      const contact =
        `${row.contact_first_name ?? ""} ${row.contact_last_name ?? ""}`.toLowerCase();
      return (
        row.name.toLowerCase().includes(q) ||
        (row.address ?? "").toLowerCase().includes(q) ||
        contact.includes(q) ||
        (row.city ?? "").toLowerCase().includes(q)
      );
    });
  }

  const siteIds = sitesRaw.map((s) => s.id);
  const [{ data: incidents }, { data: shifts }, { data: tours }] =
    siteIds.length === 0
      ? [{ data: [] }, { data: [] }, { data: [] }]
      : await Promise.all([
          supabase
            .from("incidents")
            .select("site_id")
            .eq("org_id", orgId)
            .eq("status", "open")
            .in("site_id", siteIds),
          supabase
            .from("shifts")
            .select("site_id")
            .eq("org_id", orgId)
            .eq("status", "open")
            .is("clock_out", null)
            .in("site_id", siteIds),
          supabase
            .from("tour_sessions")
            .select("site_id, ended_at")
            .eq("org_id", orgId)
            .eq("status", "completed")
            .in("site_id", siteIds)
            .order("ended_at", { ascending: false }),
        ]);

  const openBySite = new Map<string, number>();
  for (const row of (incidents as { site_id: string | null }[] | null) ?? []) {
    if (!row.site_id) continue;
    openBySite.set(row.site_id, (openBySite.get(row.site_id) ?? 0) + 1);
  }
  const dutyBySite = new Map<string, number>();
  for (const row of (shifts as { site_id: string | null }[] | null) ?? []) {
    if (!row.site_id) continue;
    dutyBySite.set(row.site_id, (dutyBySite.get(row.site_id) ?? 0) + 1);
  }
  const lastPatrolBySite = new Map<string, string>();
  for (const row of (tours as
    | { site_id: string | null; ended_at: string | null }[]
    | null) ?? []) {
    if (!row.site_id || !row.ended_at) continue;
    if (!lastPatrolBySite.has(row.site_id)) {
      lastPatrolBySite.set(row.site_id, row.ended_at);
    }
  }

  const sites: SiteListItem[] = sitesRaw.map((row) => {
    const parent = row.parent;
    const parentName = Array.isArray(parent)
      ? (parent[0]?.name ?? null)
      : (parent?.name ?? null);
    return {
      id: row.id,
      orgId: row.org_id,
      accountUid: row.account_uid,
      accountType: row.account_type as AccountType,
      name: row.name,
      parentClientName: parentName,
      address: row.address,
      city: row.city,
      contactFirstName: row.contact_first_name,
      contactLastName: row.contact_last_name,
      phoneMain: row.phone_main,
      status: row.status as SiteStatus,
      siteTemplateId: row.site_template_id,
      timezone: row.timezone,
      zoneIds: row.site_zones?.map((z) => z.zone_id) ?? [],
      accountRepId: row.account_rep_id,
      salesRepId: row.sales_rep_id,
      openIncidents: openBySite.get(row.id) ?? 0,
      guardsOnDuty: dutyBySite.get(row.id) ?? 0,
      lastPatrolAt: lastPatrolBySite.get(row.id) ?? null,
    };
  });

  const { data: parentRows } = await supabase
    .from("sites")
    .select("id, name, account_type")
    .eq("org_id", orgId)
    .in("account_type", ["client", "multi"])
    .order("name");

  return {
    orgId,
    orgTimezone,
    sites,
    total: typeof count === "number" ? count : sites.length,
    page,
    pageSize,
    zones: ((zones as { id: string; name: string }[] | null) ?? []).map(
      (z) => ({ id: z.id, name: z.name }),
    ),
    templates: (
      (templates as { id: string; name: string }[] | null) ?? []
    ).map((t) => ({ id: t.id, name: t.name })),
    parentClients: (
      (parentRows as
        | { id: string; name: string; account_type: string }[]
        | null) ?? []
    ).map((p) => ({
      id: p.id,
      name: p.name,
      accountType: p.account_type as AccountType,
    })),
    employees: (
      (employees as
        | {
            id: string;
            first_name: string | null;
            last_name: string | null;
          }[]
        | null) ?? []
    ).map((e) => ({
      id: e.id,
      firstName: e.first_name,
      lastName: e.last_name,
    })),
  };
}

export { emptyToNull, DEMO_ORG_ID };
