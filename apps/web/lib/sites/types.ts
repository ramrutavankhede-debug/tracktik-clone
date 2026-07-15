export type AccountType = "client" | "multi" | "site";
export type SiteStatus = "active" | "inactive";

export type SiteListItem = {
  id: string;
  orgId: string;
  accountUid: string;
  accountType: AccountType;
  name: string;
  parentClientName: string | null;
  address: string | null;
  city: string | null;
  contactFirstName: string | null;
  contactLastName: string | null;
  phoneMain: string | null;
  status: SiteStatus;
  siteTemplateId: string | null;
  timezone: string | null;
  zoneIds: string[];
  accountRepId: string | null;
  salesRepId: string | null;
  openIncidents: number;
  guardsOnDuty: number;
  lastPatrolAt: string | null;
};

export type ZoneOption = { id: string; name: string };
export type TemplateOption = { id: string; name: string };
export type ParentClientOption = {
  id: string;
  name: string;
  accountType: AccountType;
};
export type EmployeeOption = {
  id: string;
  firstName: string | null;
  lastName: string | null;
};

export type SitesPageData = {
  orgId: string;
  orgTimezone: string;
  sites: SiteListItem[];
  total: number;
  page: number;
  pageSize: number;
  zones: ZoneOption[];
  templates: TemplateOption[];
  parentClients: ParentClientOption[];
  employees: EmployeeOption[];
};

export type SitesSearchParams = {
  status?: string;
  zone?: string;
  type?: string;
  template?: string;
  q?: string;
  sort?: string;
  dir?: string;
  page?: string;
  pageSize?: string;
};
