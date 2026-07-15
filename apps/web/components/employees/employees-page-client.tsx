"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, Fragment } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  List,
  Pencil,
  Phone,
  Plus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { EmployeeBulkChangeModal } from "@/components/employees/employee-bulk-change-modal";
import type { EmployeeListItem, EmployeesPageData } from "@/lib/employees/queries";
import { cn } from "@/lib/utils";

function displayName(e: EmployeeListItem) {
  return [e.firstName, e.lastName].filter(Boolean).join(" ") || "Unnamed";
}

export function EmployeesPageClient({ data }: { data: EmployeesPageData }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [filterText, setFilterText] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString());
      if (filterText.trim()) next.set("q", filterText.trim());
      else next.delete("q");
      next.delete("page");
      router.replace(`${pathname}?${next.toString()}`);
    }, 300);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterText]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (key === "status") next.set("status", value);
    else if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    if (key !== "page") next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  }

  function toggleSort(column: string) {
    const current = searchParams.get("sort");
    const dir = searchParams.get("dir") === "desc" ? "desc" : "asc";
    const next = new URLSearchParams(searchParams.toString());
    if (current === column) next.set("dir", dir === "asc" ? "desc" : "asc");
    else {
      next.set("sort", column);
      next.set("dir", "asc");
    }
    router.push(`${pathname}?${next.toString()}`);
  }

  const allSelected =
    data.employees.length > 0 &&
    data.employees.every((e) => selected.has(e.id));

  const selectedEmployees = useMemo(
    () => data.employees.filter((e) => selected.has(e.id)),
    [data.employees, selected],
  );

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className="-m-4 flex min-h-[calc(100vh-3.5rem-2.5rem)] flex-col bg-content">
      <div className="flex h-11 items-center gap-2 bg-[#2c3440] px-4 text-white">
        <Users className="h-4 w-4 text-sidebar-fg" />
        <h1 className="text-sm font-semibold">Employee List</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-[#d8dde5] bg-white px-4 py-2">
        <Link
          href="/employees/new"
          className="inline-flex items-center gap-1 rounded border border-[#c9d3de] px-3 py-1.5 text-sm text-[#1e88d2] hover:bg-[#f4f7fa]"
        >
          <Plus className="h-3.5 w-3.5" />
          New Employee
        </Link>
        <div className="h-5 w-px bg-[#d0d7e0]" />
        <button
          type="button"
          onClick={() => {
            updateParam("status", "all");
            toast.message("Showing all users");
          }}
          className="inline-flex items-center gap-1 rounded border border-[#c9d3de] px-3 py-1.5 text-sm text-[#1e88d2] hover:bg-[#f4f7fa]"
        >
          <List className="h-3.5 w-3.5" />
          View All Users
        </button>
        <div className="h-5 w-px bg-[#d0d7e0]" />
        <button
          type="button"
          disabled={selected.size === 0}
          onClick={() => setBulkOpen(true)}
          className={cn(
            "inline-flex items-center gap-1 rounded border px-3 py-1.5 text-sm",
            selected.size === 0
              ? "cursor-not-allowed border-[#e2e8f0] text-[#9aa5b5]"
              : "border-[#c9d3de] text-[#1e88d2] hover:bg-[#f4f7fa]",
          )}
        >
          <Pencil className="h-3.5 w-3.5" />
          Bulk Change{selected.size > 0 ? ` (${selected.size})` : ""}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-[#d8dde5] bg-[#f3f5f8] px-4 py-2">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={() =>
            setSelected(
              allSelected ? new Set() : new Set(data.employees.map((e) => e.id)),
            )
          }
          aria-label="Select all employees"
        />
        <select
          className="h-8 rounded border border-[#c9d3de] bg-white px-2 text-sm"
          value={searchParams.get("department") ?? "all"}
          onChange={(e) => updateParam("department", e.target.value)}
        >
          <option value="all">All Departments</option>
          {data.departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          className="h-8 rounded border border-[#c9d3de] bg-white px-2 text-sm"
          value={searchParams.get("zone") ?? "all"}
          onChange={(e) => updateParam("zone", e.target.value)}
        >
          <option value="all">All Zones</option>
          {data.zones.map((z) => (
            <option key={z.id} value={z.id}>
              {z.name}
            </option>
          ))}
        </select>
        <select
          className="h-8 rounded border border-[#c9d3de] bg-white px-2 text-sm"
          value={searchParams.get("status") ?? "active"}
          onChange={(e) => updateParam("status", e.target.value)}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="all">All</option>
        </select>
        <input
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Type to filter"
          className="h-8 min-w-[180px] flex-1 rounded border border-[#c9d3de] bg-white px-2 text-sm"
        />
        <div className="relative ml-auto">
          <button
            type="button"
            onClick={() => setOptionsOpen((v) => !v)}
            className="inline-flex h-8 items-center gap-1 rounded border border-[#c9d3de] bg-white px-3 text-sm"
          >
            Options
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {optionsOpen ? (
            <div className="absolute right-0 z-20 mt-1 w-48 rounded border border-[#d0d7e0] bg-white p-2 shadow-lg">
              <label className="flex items-center justify-between gap-2 px-2 py-1 text-sm">
                Rows / page
                <select
                  className="h-7 rounded border border-[#c9d3de] px-1"
                  value={String(data.pageSize)}
                  onChange={(e) => updateParam("pageSize", e.target.value)}
                >
                  {[25, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white">
        {data.employees.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-muted-foreground">
              No employees yet — create your first employee
            </p>
            <Link
              href="/employees/new"
              className="rounded bg-[#1e88d2] px-4 py-2 text-sm font-medium text-white"
            >
              + New Employee
            </Link>
          </div>
        ) : (
          <table className="w-full min-w-[1100px] border-collapse text-sm">
            <thead className="bg-[#f7f8fa] text-left text-xs uppercase tracking-wide text-[#6b778c]">
              <tr className="border-b border-[#e5e9ef]">
                <th className="w-10 px-3 py-2" />
                <th className="w-10 px-2 py-2" />
                <th className="px-3 py-2">
                  <button type="button" onClick={() => toggleSort("uid")}>
                    UID
                  </button>
                </th>
                <th className="px-3 py-2">
                  <button type="button" onClick={() => toggleSort("first_name")}>
                    Name
                  </button>
                </th>
                <th className="px-3 py-2">Middle Name</th>
                <th className="px-3 py-2">
                  <button type="button" onClick={() => toggleSort("last_name")}>
                    Last Name
                  </button>
                </th>
                <th className="px-3 py-2">
                  <button type="button" onClick={() => toggleSort("title")}>
                    Title
                  </button>
                </th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {data.employees.map((employee) => {
                const isExpanded = expanded.has(employee.id);
                return (
                  <Fragment key={employee.id}>
                    <tr className="border-b border-[#eef1f5] hover:bg-[#f8fbfe]">
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selected.has(employee.id)}
                          onChange={() => {
                            setSelected((prev) => {
                              const next = new Set(prev);
                              if (next.has(employee.id)) next.delete(employee.id);
                              else next.add(employee.id);
                              return next;
                            });
                          }}
                          aria-label={`Select ${displayName(employee)}`}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() =>
                            setExpanded((prev) => {
                              const next = new Set(prev);
                              if (next.has(employee.id)) next.delete(employee.id);
                              else next.add(employee.id);
                              return next;
                            })
                          }
                          className="flex h-6 w-6 items-center justify-center rounded border border-[#4aa3df] text-[#1e88d2]"
                          aria-label={isExpanded ? "Collapse" : "Expand"}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex rounded bg-[#4aa3df] px-2 py-0.5 text-xs font-semibold text-white">
                          {employee.employeeNumber ?? "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-semibold text-navy">
                        {employee.firstName ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-[#3d4a5c]">
                        {employee.middleName ?? ""}
                      </td>
                      <td className="px-3 py-2 font-semibold text-navy">
                        {employee.lastName ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-[#3d4a5c]">
                        {employee.jobTitle ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-[#3d4a5c]">
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-[#8a93a0]" />
                          {employee.phone ?? "NO NUMBER"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Link
                          href={`/employees/${employee.id}`}
                          className="inline-flex rounded bg-[#4a7c43] px-3 py-1 text-xs font-semibold text-white hover:bg-[#3f6b39]"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                    {isExpanded ? (
                      <tr className="bg-[#f7fafc]">
                        <td colSpan={9} className="px-12 py-3 text-sm text-[#4b5870]">
                          <div className="flex flex-wrap gap-6">
                            <span>
                              Role: <strong>{employee.role}</strong>
                            </span>
                            <span>
                              Department:{" "}
                              <strong>{employee.departmentName ?? "—"}</strong>
                            </span>
                            <span>
                              Zone: <strong>{employee.zoneName ?? "—"}</strong>
                            </span>
                            <span>
                              Email: <strong>{employee.email ?? "—"}</strong>
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-[#d8dde5] bg-white px-4 py-2 text-sm text-[#5b677a]">
        <span>
          Showing {data.employees.length} of {data.total}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={data.page <= 1}
            className="rounded border border-[#c9d3de] px-2 py-1 disabled:opacity-40"
            onClick={() => updateParam("page", String(data.page - 1))}
          >
            Prev
          </button>
          <span>
            Page {data.page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={data.page >= totalPages}
            className="rounded border border-[#c9d3de] px-2 py-1 disabled:opacity-40"
            onClick={() => updateParam("page", String(data.page + 1))}
          >
            Next
          </button>
        </div>
      </div>

      <EmployeeBulkChangeModal
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        employees={selectedEmployees}
        departments={data.departments}
        zones={data.zones}
        onApplied={(count) => {
          toast.success(`Updated ${count} employee${count === 1 ? "" : "s"}`);
          setSelected(new Set());
          router.refresh();
        }}
      />
    </div>
  );
}
