export type SiteDetail = {
  id: string;
  orgId: string;
  accountUid: string;
  accountType: "client" | "multi" | "site";
  name: string;
  address: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  status: "active" | "inactive";
  logoUrl: string | null;
  phoneMain: string | null;
  email: string | null;
  contactFirstName: string | null;
  contactLastName: string | null;
  parentClientId: string | null;
  parentClientName: string | null;
};

export function formatSiteAddress(site: SiteDetail): string {
  return [
    site.address,
    site.addressLine2,
    site.city,
    site.state,
    site.zipCode,
    site.country,
  ]
    .filter(Boolean)
    .join(" ");
}

export function formatShortAddress(site: SiteDetail): string {
  return [site.address, site.addressLine2].filter(Boolean).join(", ") || "—";
}
