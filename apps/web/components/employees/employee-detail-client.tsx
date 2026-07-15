"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  CircleHelp,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  Settings,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  assignEmployeeToSiteAction,
  setPrimaryAssignmentAction,
  terminateEmployeeAction,
} from "@/app/(dashboard)/employees/actions";
import type {
  EmployeeDetail,
  SiteAssignment,
} from "@/lib/employees/queries";
import { cn } from "@/lib/utils";

const PRIMARY_TABS = [
  { id: "overview", label: "Overview", href: (id: string) => `/employees/${id}` },
  { id: "edit", label: "Edit", href: (id: string) => `/employees/${id}/edit` },
  { id: "skills", label: "Skills & Attributes", href: null },
  { id: "security", label: "Security & Patrol", href: null },
] as const;

const SUB_TABS = [
  "Assigned Sites",
  "Site Bans",
  "Emergency Contacts",
  "Notes on Employee",
  "Notes by Employee",
  "Work Exception",
  "History",
] as const;

function initials(first: string | null, last: string | null) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";
}

function formatAddress(employee: EmployeeDetail) {
  return [
    employee.address,
    employee.addressLine2,
    employee.city,
    employee.state,
    employee.zipCode,
    employee.country,
  ]
    .filter(Boolean)
    .join(", ");
}

type Props = {
  employee: EmployeeDetail;
  assignments: SiteAssignment[];
  sites: { id: string; name: string }[];
};

export function EmployeeDetailClient({
  employee,
  assignments,
  sites,
}: Props) {
  const router = useRouter();
  const [subTab, setSubTab] =
    useState<(typeof SUB_TABS)[number]>("Assigned Sites");
  const [assignmentFilter, setAssignmentFilter] = useState("active");
  const [assignOpen, setAssignOpen] = useState(false);
  const [siteId, setSiteId] = useState("");
  const [saving, setSaving] = useState(false);

  const fullName = useMemo(
    () =>
      [employee.firstName, employee.middleName, employee.lastName]
        .filter(Boolean)
        .join(" "),
    [employee],
  );

  const filteredAssignments =
    assignmentFilter === "all"
      ? assignments
      : assignments.filter((a) => a.status === assignmentFilter);

  function stub(label: string) {
    toast.message(`${label} — coming soon`);
  }

  async function terminate() {
    if (!window.confirm(`Terminate ${fullName}? This sets status to inactive.`)) {
      return;
    }
    const result = await terminateEmployeeAction(employee.id);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success("Employee terminated");
    router.refresh();
  }

  async function assign() {
    if (!siteId) {
      toast.error("Select a site");
      return;
    }
    setSaving(true);
    const result = await assignEmployeeToSiteAction({
      employeeId: employee.id,
      siteId,
      startDate: new Date().toISOString().slice(0, 10),
      effectiveRateDate: new Date().toISOString().slice(0, 10),
      rate: null,
      isPrimary: assignments.length === 0,
    });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success("Assigned to site");
    setAssignOpen(false);
    setSiteId("");
    router.refresh();
  }

  async function makePrimary(assignmentId: string) {
    const result = await setPrimaryAssignmentAction(employee.id, assignmentId);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success("Primary site updated");
    router.refresh();
  }

  return (
    <div className="-m-4 min-h-[calc(100vh-3.5rem-2.5rem)] bg-content">
      <div className="flex items-center gap-3 bg-[#1e2530] px-4 py-3 text-white">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#14b8a6] text-sm font-bold">
          {initials(employee.firstName, employee.lastName)}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold">{fullName}</h1>
          <p className="truncate text-xs text-sidebar-fg">
            {employee.phone ?? "NO NUMBER"}
          </p>
        </div>
        <Link
          href="/employees"
          className="ml-auto shrink-0 text-xs text-sidebar-fg hover:text-white"
        >
          ← Employee List
        </Link>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-[#d0d7e0] bg-[#e8ecf1] px-2 pt-2">
        {PRIMARY_TABS.map((tab) => {
          const active = tab.id === "overview";
          const className = cn(
            "rounded-t px-3 py-2 text-sm",
            active
              ? "bg-white font-medium text-navy shadow-sm"
              : "text-[#5b677a] hover:text-navy",
          );
          if (tab.href) {
            return (
              <Link key={tab.id} href={tab.href(employee.id)} className={className}>
                {tab.label}
              </Link>
            );
          }
          return (
            <button
              key={tab.id}
              type="button"
              className={className}
              onClick={() => stub(tab.label)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4 border-b border-[#e5e9ef] bg-white px-4 py-2 text-sm text-[#1e88d2]">
        <button type="button" className="inline-flex items-center gap-1 hover:underline" onClick={() => stub("Change Password")}>
          <KeyRound className="h-3.5 w-3.5" /> Change Password
        </button>
        <button type="button" className="inline-flex items-center gap-1 hover:underline" onClick={() => stub("Force Password Change")}>
          <KeyRound className="h-3.5 w-3.5" /> Force Password Change
        </button>
        <button type="button" className="inline-flex items-center gap-1 hover:underline" onClick={() => stub("ID Card")}>
          <CircleHelp className="h-3.5 w-3.5" /> ID Card
        </button>
        <button type="button" className="inline-flex items-center gap-1 hover:underline" onClick={() => stub("Snap Picture")}>
          <Camera className="h-3.5 w-3.5" /> Snap Picture
        </button>
        <button type="button" className="inline-flex items-center gap-1 hover:underline" onClick={() => void terminate()}>
          <XCircle className="h-3.5 w-3.5" /> Terminate
        </button>
        <button type="button" className="inline-flex items-center gap-1 hover:underline" onClick={() => stub("Tracks")}>
          <MapPin className="h-3.5 w-3.5" /> Tracks
        </button>
        <button type="button" className="inline-flex items-center gap-1 hover:underline" onClick={() => stub("HR Profile")}>
          <Settings className="h-3.5 w-3.5" /> HR Profile
        </button>
      </div>

      <div className="p-4">
        <div className="rounded border border-[#d8dde5] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded bg-[#14b8a6] text-2xl font-bold text-white">
              {initials(employee.firstName, employee.lastName)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-navy">{fullName}</h2>
                <span className="rounded-full bg-[#4aa3df] px-2.5 py-0.5 text-xs font-semibold text-white">
                  #{employee.employeeNumber ?? "—"}
                </span>
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-xs font-semibold uppercase",
                    employee.status === "active"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-700",
                  )}
                >
                  {employee.status}
                </span>
              </div>
              <div className="mt-2 space-y-1 text-sm text-[#5b677a]">
                <p className="inline-flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  {employee.phone ?? "NO NUMBER"}
                </p>
                <p className="inline-flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  {employee.email ?? "—"}
                </p>
              </div>
            </div>
            <div className="min-w-[240px] text-sm text-[#5b677a] lg:text-right">
              <p className="inline-flex items-start gap-1 lg:justify-end">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{formatAddress(employee) || "No address on file"}</span>
              </p>
              <p className="mt-2">
                <span className="font-semibold text-navy">Main Region: </span>
                {employee.zoneName ?? "—"}
              </p>
              <button
                type="button"
                className="mt-1 text-[#1e88d2] hover:underline"
                onClick={() => stub("Manage region access")}
              >
                Manage region access.
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-t bg-[#5b6b7c]">
          <div className="flex min-w-max">
            {SUB_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSubTab(tab)}
                className={cn(
                  "whitespace-nowrap px-4 py-2.5 text-sm",
                  subTab === tab
                    ? "bg-white font-medium text-navy"
                    : "text-white/90 hover:bg-white/10",
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-b border border-t-0 border-[#d8dde5] bg-white p-4">
          {subTab === "Assigned Sites" ? (
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAssignOpen((v) => !v)}
                  className="rounded border border-[#c9d3de] px-3 py-1.5 text-sm text-[#1e88d2] hover:bg-[#f4f7fa]"
                >
                  + Assign to Site
                </button>
                <select
                  className="h-8 rounded border border-[#c9d3de] px-2 text-sm"
                  value={assignmentFilter}
                  onChange={(e) => setAssignmentFilter(e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="all">All</option>
                </select>
              </div>

              {assignOpen ? (
                <div className="mb-4 flex flex-wrap items-end gap-2 rounded border border-[#d8dde5] bg-[#f8fafc] p-3">
                  <label className="text-sm">
                    Site
                    <select
                      className="mt-1 block h-9 min-w-[220px] rounded border border-[#c9d3de] px-2"
                      value={siteId}
                      onChange={(e) => setSiteId(e.target.value)}
                    >
                      <option value="">Choose site</option>
                      {sites.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void assign()}
                    className="h-9 rounded bg-[#1e88d2] px-4 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Assign"}
                  </button>
                </div>
              ) : null}

              {filteredAssignments.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#8a93a0]">
                  No site assignments yet.
                </p>
              ) : (
                <table className="w-full min-w-[800px] text-sm">
                  <thead className="bg-[#f7f8fa] text-left text-xs uppercase text-[#6b778c]">
                    <tr>
                      <th className="px-3 py-2">Site</th>
                      <th className="px-3 py-2">Start Date</th>
                      <th className="px-3 py-2">Effective Rate Date</th>
                      <th className="px-3 py-2">Rate</th>
                      <th className="px-3 py-2">End</th>
                      <th className="px-3 py-2">Is Primary</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssignments.map((a) => (
                      <tr key={a.id} className="border-t border-[#eef1f5]">
                        <td className="px-3 py-2 font-medium text-navy">
                          {a.siteName}
                        </td>
                        <td className="px-3 py-2">{a.startDate ?? "—"}</td>
                        <td className="px-3 py-2">
                          {a.effectiveRateDate ?? "—"}
                        </td>
                        <td className="px-3 py-2">
                          {a.rate == null ? "—" : `$${a.rate.toFixed(2)}`}
                        </td>
                        <td className="px-3 py-2">{a.endDate ?? "—"}</td>
                        <td className="px-3 py-2">
                          {a.isPrimary ? (
                            <span className="font-semibold text-emerald-700">
                              Yes
                            </span>
                          ) : (
                            "No"
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {!a.isPrimary ? (
                            <button
                              type="button"
                              className="text-[#1e88d2] hover:underline"
                              onClick={() => void makePrimary(a.id)}
                            >
                              Make Primary
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div className="py-10 text-center text-sm text-[#6b778c]">
              <p className="font-medium text-navy">{subTab}</p>
              <p className="mt-1">Coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
