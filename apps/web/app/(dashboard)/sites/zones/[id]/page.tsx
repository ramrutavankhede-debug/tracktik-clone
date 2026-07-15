import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { DEMO_ORG_ID } from "@/lib/sites/queries";

export default async function ZoneDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("zones")
    .select("id, name, zone_uid, city, status, devices_count")
    .eq("id", params.id)
    .eq("org_id", DEMO_ORG_ID)
    .maybeSingle();

  const zone = data as {
    id: string;
    name: string;
    zone_uid: string | null;
    city: string | null;
    status: string;
    devices_count: number | null;
  } | null;

  return (
    <div className="space-y-4">
      <Link
        href="/sites/zones"
        className="text-sm text-[#1e88d2] hover:underline"
      >
        ← Back to Customer Zones
      </Link>
      <div className="rounded border border-[#d8dde5] bg-white p-6">
        <h1 className="text-xl font-semibold text-navy">
          {zone?.name ?? "Zone"}
        </h1>
        {zone ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {zone.zone_uid ? `#${zone.zone_uid} · ` : ""}
            {zone.status}
            {zone.city ? ` · ${zone.city}` : ""}
            {` · ${zone.devices_count ?? 0} devices`}
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">Zone not found</p>
        )}
        <p className="mt-6 text-sm text-[#5b677a]">Zone detail coming soon</p>
      </div>
    </div>
  );
}
