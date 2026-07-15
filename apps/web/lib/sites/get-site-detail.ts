import { createClient } from "@/lib/supabase/server";
import type { SiteDetail } from "./detail-types";

export async function getSiteDetail(id: string): Promise<SiteDetail | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sites")
    .select(
      `
      id,
      org_id,
      account_uid,
      account_type,
      name,
      address,
      address_line_2,
      city,
      state,
      zip_code,
      country,
      lat,
      lng,
      status,
      logo_url,
      phone_main,
      email,
      contact_first_name,
      contact_last_name,
      parent_client_id,
      parent:parent_client_id ( name )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getSiteDetail", error.message);
    return null;
  }

  const row = data as {
    id: string;
    org_id: string;
    account_uid: string;
    account_type: string;
    name: string;
    address: string | null;
    address_line_2: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    country: string | null;
    lat: number | null;
    lng: number | null;
    status: string;
    logo_url: string | null;
    phone_main: string | null;
    email: string | null;
    contact_first_name: string | null;
    contact_last_name: string | null;
    parent_client_id: string | null;
    parent: { name: string } | { name: string }[] | null;
  };

  const parent = row.parent;
  const parentName = Array.isArray(parent)
    ? (parent[0]?.name ?? null)
    : (parent?.name ?? null);

  return {
    id: row.id,
    orgId: row.org_id,
    accountUid: row.account_uid,
    accountType: row.account_type as SiteDetail["accountType"],
    name: row.name,
    address: row.address,
    addressLine2: row.address_line_2,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    country: row.country,
    lat: row.lat,
    lng: row.lng,
    status: row.status as SiteDetail["status"],
    logoUrl: row.logo_url,
    phoneMain: row.phone_main,
    email: row.email,
    contactFirstName: row.contact_first_name,
    contactLastName: row.contact_last_name,
    parentClientId: row.parent_client_id,
    parentClientName: parentName,
  };
}
