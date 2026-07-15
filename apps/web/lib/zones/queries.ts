import { createClient } from "@/lib/supabase/server";
import { DEMO_ORG_ID } from "@/lib/sites/queries";

export type ZoneListItem = {
  id: string;
  zoneUid: string | null;
  name: string;
  status: "active" | "inactive";
  zoneTemplateId: string | null;
  devicesCount: number;
  sitesCount: number;
  subZonesCount: number;
};

export type ZoneTemplateOption = { id: string; name: string };

export type ZonesSearchParams = {
  status?: string;
  template?: string;
  q?: string;
  sort?: string;
  dir?: string;
  page?: string;
  pageSize?: string;
};

export type ZonesPageData = {
  zones: ZoneListItem[];
  total: number;
  page: number;
  pageSize: number;
  templates: ZoneTemplateOption[];
};

export async function getZonesPageData(
  params: ZonesSearchParams,
): Promise<ZonesPageData> {
  const supabase = createClient();
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = Math.min(
    100,
    Math.max(10, Number(params.pageSize ?? "25") || 25),
  );
  const status = (params.status ?? "active").toLowerCase();
  const template = params.template ?? "all";
  const q = (params.q ?? "").trim().toLowerCase();
  const sort = params.sort ?? "name";
  const dir = params.dir === "desc" ? "desc" : "asc";

  const { data: templates } = await supabase
    .from("zone_templates")
    .select("id, name")
    .eq("org_id", DEMO_ORG_ID)
    .order("name");

  let query = supabase
    .from("zones")
    .select(
      "id, zone_uid, name, status, zone_template_id, devices_count, parent_zone_id",
      { count: "exact" },
    )
    .eq("org_id", DEMO_ORG_ID)
    .is("parent_zone_id", null);

  if (status !== "all") query = query.eq("status", status);
  if (template !== "all") query = query.eq("zone_template_id", template);

  const sortCol = sort === "uid" ? "zone_uid" : "name";
  query = query.order(sortCol, { ascending: dir === "asc", nullsFirst: false });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data: rows, count, error } = await query.range(from, to);
  if (error) console.error("getZonesPageData", error.message);

  type ZoneRow = {
    id: string;
    zone_uid: string | null;
    name: string;
    status: string;
    zone_template_id: string | null;
    devices_count: number | null;
    parent_zone_id: string | null;
  };

  let zonesRaw = (rows as ZoneRow[] | null) ?? [];
  if (q) {
    zonesRaw = zonesRaw.filter(
      (z) =>
        z.name.toLowerCase().includes(q) ||
        (z.zone_uid ?? "").toLowerCase().includes(q),
    );
  }

  const zoneIds = zonesRaw.map((z) => z.id);
  const [{ data: siteLinks }, { data: children }] =
    zoneIds.length === 0
      ? [{ data: [] }, { data: [] }]
      : await Promise.all([
          supabase
            .from("site_zones")
            .select("zone_id")
            .in("zone_id", zoneIds),
          supabase
            .from("zones")
            .select("parent_zone_id")
            .eq("org_id", DEMO_ORG_ID)
            .in("parent_zone_id", zoneIds),
        ]);

  const sitesByZone = new Map<string, number>();
  for (const row of (siteLinks as { zone_id: string }[] | null) ?? []) {
    sitesByZone.set(row.zone_id, (sitesByZone.get(row.zone_id) ?? 0) + 1);
  }
  const subByZone = new Map<string, number>();
  for (const row of (children as { parent_zone_id: string | null }[] | null) ??
    []) {
    if (!row.parent_zone_id) continue;
    subByZone.set(
      row.parent_zone_id,
      (subByZone.get(row.parent_zone_id) ?? 0) + 1,
    );
  }

  return {
    zones: zonesRaw.map((z) => ({
      id: z.id,
      zoneUid: z.zone_uid,
      name: z.name,
      status: z.status as "active" | "inactive",
      zoneTemplateId: z.zone_template_id,
      devicesCount: z.devices_count ?? 0,
      sitesCount: sitesByZone.get(z.id) ?? 0,
      subZonesCount: subByZone.get(z.id) ?? 0,
    })),
    total: typeof count === "number" ? count : zonesRaw.length,
    page,
    pageSize,
    templates: ((templates as { id: string; name: string }[] | null) ?? []).map(
      (t) => ({ id: t.id, name: t.name }),
    ),
  };
}

export async function getZoneTemplates(): Promise<ZoneTemplateOption[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("zone_templates")
    .select("id, name")
    .eq("org_id", DEMO_ORG_ID)
    .order("name");
  return ((data as { id: string; name: string }[] | null) ?? []).map((t) => ({
    id: t.id,
    name: t.name,
  }));
}
