import { createClient } from "@/lib/supabase/server";
import { DEMO_ORG_ID } from "@/lib/sites/queries";
import type { Role } from "@guardops/shared";

export type EmployeeListItem = {
  id: string;
  employeeNumber: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  jobTitle: string | null;
  phone: string | null;
  email: string | null;
  status: "active" | "inactive";
  role: Role | string;
  departmentId: string | null;
  departmentName: string | null;
  zoneId: string | null;
  zoneName: string | null;
};

export type EmployeeDetail = EmployeeListItem & {
  username: string | null;
  gender: string | null;
  governmentBadgeId: string | null;
  phoneOther: string | null;
  smsConsentMain: boolean;
  smsConsentOther: boolean;
  address: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  avatarUrl: string | null;
};

export type SiteAssignment = {
  id: string;
  siteId: string;
  siteName: string;
  startDate: string | null;
  effectiveRateDate: string | null;
  rate: number | null;
  endDate: string | null;
  isPrimary: boolean;
  status: string;
};

export type EmployeesSearchParams = {
  status?: string;
  department?: string;
  zone?: string;
  q?: string;
  sort?: string;
  dir?: string;
  page?: string;
  pageSize?: string;
};

export type EmployeesPageData = {
  employees: EmployeeListItem[];
  total: number;
  page: number;
  pageSize: number;
  departments: { id: string; name: string }[];
  zones: { id: string; name: string }[];
};

function mapEmployee(row: Record<string, unknown>): EmployeeListItem {
  const dept = row.department as { name: string } | { name: string }[] | null;
  const zone = row.zone as { name: string } | { name: string }[] | null;
  return {
    id: String(row.id),
    employeeNumber: (row.employee_number as string | null) ?? null,
    firstName: (row.first_name as string | null) ?? null,
    middleName: (row.middle_name as string | null) ?? null,
    lastName: (row.last_name as string | null) ?? null,
    jobTitle: (row.job_title as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    email: (row.email as string | null) ?? null,
    status: (row.status as "active" | "inactive") ?? "active",
    role: String(row.role ?? "guard"),
    departmentId: (row.department_id as string | null) ?? null,
    departmentName: Array.isArray(dept) ? (dept[0]?.name ?? null) : (dept?.name ?? null),
    zoneId: (row.zone_id as string | null) ?? null,
    zoneName: Array.isArray(zone) ? (zone[0]?.name ?? null) : (zone?.name ?? null),
  };
}

export async function getEmployeesPageData(
  params: EmployeesSearchParams,
): Promise<EmployeesPageData> {
  const supabase = createClient();
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = Math.min(100, Math.max(10, Number(params.pageSize ?? "50") || 50));
  const status = (params.status ?? "active").toLowerCase();
  const department = params.department ?? "all";
  const zone = params.zone ?? "all";
  const q = (params.q ?? "").trim().toLowerCase();
  const sort = params.sort ?? "last_name";
  const dir = params.dir === "desc" ? "desc" : "asc";

  const [{ data: departments }, { data: zones }] = await Promise.all([
    supabase.from("departments").select("id, name").eq("org_id", DEMO_ORG_ID).order("name"),
    supabase.from("zones").select("id, name").eq("org_id", DEMO_ORG_ID).is("parent_zone_id", null).order("name"),
  ]);

  let query = supabase
    .from("profiles")
    .select(
      `id, employee_number, first_name, middle_name, last_name, job_title, phone, email, status, role,
       department_id, zone_id,
       department:department_id ( name ),
       zone:zone_id ( name )`,
      { count: "exact" },
    )
    .eq("org_id", DEMO_ORG_ID);

  if (status !== "all") query = query.eq("status", status);
  if (department !== "all") query = query.eq("department_id", department);
  if (zone !== "all") query = query.eq("zone_id", zone);

  const sortCol =
    sort === "first_name"
      ? "first_name"
      : sort === "title"
        ? "job_title"
        : sort === "uid"
          ? "employee_number"
          : "last_name";
  query = query.order(sortCol, { ascending: dir === "asc", nullsFirst: false });

  const from = (page - 1) * pageSize;
  const { data: rows, count, error } = await query.range(from, from + pageSize - 1);
  if (error) console.error("getEmployeesPageData", error.message);

  let employees = ((rows as Record<string, unknown>[] | null) ?? []).map(mapEmployee);
  if (q) {
    employees = employees.filter((e) => {
      const hay = [
        e.employeeNumber,
        e.firstName,
        e.middleName,
        e.lastName,
        e.jobTitle,
        e.phone,
        e.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  return {
    employees,
    total: typeof count === "number" ? count : employees.length,
    page,
    pageSize,
    departments: ((departments as { id: string; name: string }[] | null) ?? []).map((d) => ({
      id: d.id,
      name: d.name,
    })),
    zones: ((zones as { id: string; name: string }[] | null) ?? []).map((z) => ({
      id: z.id,
      name: z.name,
    })),
  };
}

export async function getEmployeeDetail(id: string): Promise<EmployeeDetail | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `id, employee_number, first_name, middle_name, last_name, job_title, phone, phone_other,
       email, status, role, department_id, zone_id, username, gender, government_badge_id,
       sms_consent_main, sms_consent_other, address, address_line_2, city, state, zip_code,
       country, avatar_url,
       department:department_id ( name ),
       zone:zone_id ( name )`,
    )
    .eq("id", id)
    .eq("org_id", DEMO_ORG_ID)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getEmployeeDetail", error.message);
    return null;
  }

  const row = data as Record<string, unknown>;
  const base = mapEmployee(row);
  return {
    ...base,
    username: (row.username as string | null) ?? null,
    gender: (row.gender as string | null) ?? null,
    governmentBadgeId: (row.government_badge_id as string | null) ?? null,
    phoneOther: (row.phone_other as string | null) ?? null,
    smsConsentMain: Boolean(row.sms_consent_main),
    smsConsentOther: Boolean(row.sms_consent_other),
    address: (row.address as string | null) ?? null,
    addressLine2: (row.address_line_2 as string | null) ?? null,
    city: (row.city as string | null) ?? null,
    state: (row.state as string | null) ?? null,
    zipCode: (row.zip_code as string | null) ?? null,
    country: (row.country as string | null) ?? null,
    avatarUrl: (row.avatar_url as string | null) ?? null,
  };
}

export async function getEmployeeAssignments(
  employeeId: string,
  statusFilter: string = "active",
): Promise<SiteAssignment[]> {
  const supabase = createClient();
  let query = supabase
    .from("employee_site_assignments")
    .select(
      `id, site_id, start_date, effective_rate_date, rate, end_date, is_primary, status,
       site:site_id ( name )`,
    )
    .eq("employee_id", employeeId)
    .eq("org_id", DEMO_ORG_ID)
    .order("is_primary", { ascending: false });

  if (statusFilter !== "all") query = query.eq("status", statusFilter);

  const { data, error } = await query;
  if (error) console.error("getEmployeeAssignments", error.message);

  return ((data as Record<string, unknown>[] | null) ?? []).map((row) => {
    const site = row.site as { name: string } | { name: string }[] | null;
    return {
      id: String(row.id),
      siteId: String(row.site_id),
      siteName: Array.isArray(site) ? (site[0]?.name ?? "Site") : (site?.name ?? "Site"),
      startDate: (row.start_date as string | null) ?? null,
      effectiveRateDate: (row.effective_rate_date as string | null) ?? null,
      rate: row.rate == null ? null : Number(row.rate),
      endDate: (row.end_date as string | null) ?? null,
      isPrimary: Boolean(row.is_primary),
      status: String(row.status ?? "active"),
    };
  });
}

export async function getEmployeeFormOptions() {
  const supabase = createClient();
  const [{ data: departments }, { data: zones }, { data: sites }] = await Promise.all([
    supabase.from("departments").select("id, name").eq("org_id", DEMO_ORG_ID).order("name"),
    supabase.from("zones").select("id, name").eq("org_id", DEMO_ORG_ID).is("parent_zone_id", null).order("name"),
    supabase.from("sites").select("id, name").eq("org_id", DEMO_ORG_ID).eq("status", "active").order("name"),
  ]);
  return {
    departments: ((departments as { id: string; name: string }[] | null) ?? []).map((d) => ({
      id: d.id,
      name: d.name,
    })),
    zones: ((zones as { id: string; name: string }[] | null) ?? []).map((z) => ({
      id: z.id,
      name: z.name,
    })),
    sites: ((sites as { id: string; name: string }[] | null) ?? []).map((s) => ({
      id: s.id,
      name: s.name,
    })),
  };
}
