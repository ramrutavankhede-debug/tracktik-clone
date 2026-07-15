"use client";

import { useEffect, useMemo, useState, Fragment } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { TypeBadge } from "@/components/sites/type-badge";
import { NewSiteModal } from "@/components/sites/new-site-modal";
import { BulkChangeModal } from "@/components/sites/bulk-change-modal";
import type { SitesPageData, SiteListItem } from "@/lib/sites/types";
import { cn } from "@/lib/utils";

const ALL_COLUMNS = [
  { key: "uid", label: "Account UID" },
  { key: "type", label: "Type" },
  { key: "company", label: "Company" },
  { key: "address", label: "Site Address" },
  { key: "city", label: "City" },
  { key: "contact", label: "Main Contact" },
  { key: "phone", label: "Phone" },
  { key: "actions", label: "Actions" },
] as const;

type ColumnKey = (typeof ALL_COLUMNS)[number]["key"];

function contactName(site: SiteListItem) {
  return [site.contactFirstName, site.contactLastName].filter(Boolean).join(" ");
}

function formatRelative(iso: string | null) {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.round(diff / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function SitesPageClient({ data }: { data: SitesPageData }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [newOpen, setNewOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [filterText, setFilterText] = useState(searchParams.get("q") ?? "");
  const [visibleCols, setVisibleCols] = useState<Set<ColumnKey>>(
    () => new Set(ALL_COLUMNS.map((c) => c.key)),
  );
  const [optimisticSites, setOptimisticSites] = useState<SiteListItem[] | null>(
    null,
  );

  const sites = optimisticSites ?? data.sites;

  useEffect(() => {
    setOptimisticSites(null);
  }, [data.sites]);

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
    if (key === "status") {
      next.set("status", value);
    } else if (!value || value === "all") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    if (key !== "page") next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  }

  function toggleSort(column: string) {
    const current = searchParams.get("sort");
    const dir = searchParams.get("dir") === "desc" ? "desc" : "asc";
    const next = new URLSearchParams(searchParams.toString());
    if (current === column) {
      next.set("dir", dir === "asc" ? "desc" : "asc");
    } else {
      next.set("sort", column);
      next.set("dir", "asc");
    }
    router.push(`${pathname}?${next.toString()}`);
  }

  const allSelected =
    sites.length > 0 && sites.every((s) => selected.has(s.id));

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(sites.map((s) => s.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exportCsv() {
    const headers = [
      "Account UID",
      "Type",
      "Company",
      "Parent",
      "Address",
      "City",
      "Contact",
      "Phone",
      "Status",
    ];
    const lines = sites.map((s) =>
      [
        s.accountUid,
        s.accountType,
        s.name,
        s.parentClientName ?? "",
        s.address ?? "",
        s.city ?? "",
        contactName(s),
        s.phoneMain ?? "",
        s.status,
      ]
        .map((v) => `"${String(v).replaceAll('"', '""')}"`)
        .join(","),
    );
    const blob = new Blob([[headers.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sites.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  }

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const selectedSites = useMemo(
    () => sites.filter((s) => selected.has(s.id)),
    [sites, selected],
  );

  return (
    <div className="-m-4 flex min-h-[calc(100vh-3.5rem-2.5rem)] flex-col bg-content">
      <div className="flex h-11 items-center gap-2 bg-[#2c3440] px-4 text-white">
        <Users className="h-4 w-4 text-sidebar-fg" />
        <h1 className="text-sm font-semibold">List All Sites</h1>
      </div>

      <div className="flex items-center gap-3 border-b border-[#d8dde5] bg-white px-4 py-2">
        <button
          type="button"
          onClick={() => setNewOpen(true)}
          className="inline-flex items-center gap-1 rounded border border-[#c9d3de] bg-white px-3 py-1.5 text-sm text-[#1e88d2] hover:bg-[#f4f7fa]"
        >
          <Plus className="h-3.5 w-3.5" />
          New Site
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
          onChange={toggleAll}
          aria-label="Select all sites"
          className="h-4 w-4"
        />
        <select
          className="h-8 rounded border border-[#c9d3de] bg-white px-2 text-sm"
          value={searchParams.get("status") ?? "active"}
          onChange={(e) => updateParam("status", e.target.value)}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="all">All</option>
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
          value={searchParams.get("type") ?? "all"}
          onChange={(e) => updateParam("type", e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="client">Client</option>
          <option value="multi">Multi</option>
          <option value="site">Site</option>
        </select>
        <select
          className="h-8 rounded border border-[#c9d3de] bg-white px-2 text-sm"
          value={searchParams.get("template") ?? "all"}
          onChange={(e) => updateParam("template", e.target.value)}
        >
          <option value="all">All Site Templates</option>
          {data.templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
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
            <div className="absolute right-0 z-20 mt-1 w-56 rounded border border-[#d0d7e0] bg-white p-2 shadow-lg">
              <p className="px-2 py-1 text-xs font-semibold uppercase text-[#7a8699]">
                Columns
              </p>
              {ALL_COLUMNS.map((col) => (
                <label
                  key={col.key}
                  className="flex cursor-pointer items-center gap-2 px-2 py-1 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={visibleCols.has(col.key)}
                    onChange={() =>
                      setVisibleCols((prev) => {
                        const next = new Set(prev);
                        if (next.has(col.key)) next.delete(col.key);
                        else next.add(col.key);
                        return next;
                      })
                    }
                  />
                  {col.label}
                </label>
              ))}
              <div className="my-1 border-t border-[#e5e9ef]" />
              <button
                type="button"
                className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-[#f4f7fa]"
                onClick={() => {
                  exportCsv();
                  setOptionsOpen(false);
                }}
              >
                Export CSV
              </button>
              <label className="mt-1 flex items-center justify-between gap-2 px-2 py-1 text-sm">
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
        {sites.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-muted-foreground">
              No sites yet — create your first site
            </p>
            <button
              type="button"
              onClick={() => setNewOpen(true)}
              className="rounded bg-[#1e88d2] px-4 py-2 text-sm font-medium text-white"
            >
              + New Site
            </button>
          </div>
        ) : (
          <table className="w-full min-w-[1100px] border-collapse text-sm">
            <thead className="bg-[#f7f8fa] text-left text-xs uppercase tracking-wide text-[#6b778c]">
              <tr className="border-b border-[#e5e9ef]">
                <th className="w-10 px-3 py-2" />
                <th className="w-10 px-2 py-2" />
                {visibleCols.has("uid") ? (
                  <th className="px-3 py-2">Account UID</th>
                ) : null}
                {visibleCols.has("type") ? (
                  <th className="px-3 py-2">Type</th>
                ) : null}
                {visibleCols.has("company") ? (
                  <th className="px-3 py-2">
                    <button type="button" onClick={() => toggleSort("name")}>
                      Company
                    </button>
                  </th>
                ) : null}
                {visibleCols.has("address") ? (
                  <th className="px-3 py-2">
                    <button type="button" onClick={() => toggleSort("address")}>
                      Site Address
                    </button>
                  </th>
                ) : null}
                {visibleCols.has("city") ? (
                  <th className="px-3 py-2">
                    <button type="button" onClick={() => toggleSort("city")}>
                      City
                    </button>
                  </th>
                ) : null}
                {visibleCols.has("contact") ? (
                  <th className="px-3 py-2">
                    <button type="button" onClick={() => toggleSort("contact")}>
                      Main Contact
                    </button>
                  </th>
                ) : null}
                {visibleCols.has("phone") ? (
                  <th className="px-3 py-2">Phone</th>
                ) : null}
                {visibleCols.has("actions") ? (
                  <th className="px-3 py-2" />
                ) : null}
              </tr>
            </thead>
            <tbody>
              {sites.map((site) => {
                const isExpanded = expanded.has(site.id);
                return (
                  <Fragment key={site.id}>
                    <tr className="border-b border-[#eef1f5] hover:bg-[#f8fbfe]">
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selected.has(site.id)}
                          onChange={() => toggleOne(site.id)}
                          aria-label={`Select ${site.name}`}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => toggleExpand(site.id)}
                          className="flex h-6 w-6 items-center justify-center rounded border border-[#c9d3de] text-[#5b677a]"
                          aria-label={isExpanded ? "Collapse" : "Expand"}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </td>
                      {visibleCols.has("uid") ? (
                        <td className="px-3 py-2">
                          <span className="inline-flex rounded-full bg-[#4aa3df] px-2.5 py-0.5 text-xs font-semibold text-white">
                            #{site.accountUid}
                          </span>
                        </td>
                      ) : null}
                      {visibleCols.has("type") ? (
                        <td className="px-3 py-2">
                          <TypeBadge type={site.accountType} />
                        </td>
                      ) : null}
                      {visibleCols.has("company") ? (
                        <td className="px-3 py-2">
                          <Link
                            href={`/sites/${site.id}`}
                            className="font-semibold text-[#1e88d2] hover:underline"
                          >
                            {site.name}
                          </Link>
                          {site.parentClientName ? (
                            <div className="text-xs text-[#8a93a0]">
                              {site.parentClientName}
                            </div>
                          ) : null}
                        </td>
                      ) : null}
                      {visibleCols.has("address") ? (
                        <td className="px-3 py-2 text-[#3d4a5c]">
                          {site.address ?? "—"}
                        </td>
                      ) : null}
                      {visibleCols.has("city") ? (
                        <td className="px-3 py-2 text-[#3d4a5c]">
                          {site.city ?? "—"}
                        </td>
                      ) : null}
                      {visibleCols.has("contact") ? (
                        <td className="px-3 py-2 text-[#3d4a5c]">
                          {contactName(site) || "—"}
                        </td>
                      ) : null}
                      {visibleCols.has("phone") ? (
                        <td className="px-3 py-2 text-[#3d4a5c]">
                          {site.phoneMain ?? "—"}
                        </td>
                      ) : null}
                      {visibleCols.has("actions") ? (
                        <td className="px-3 py-2 text-right">
                          <Link
                            href={`/sites/${site.id}`}
                            className="inline-flex rounded bg-[#4a7c43] px-3 py-1 text-xs font-semibold text-white hover:bg-[#3f6b39]"
                          >
                            View
                          </Link>
                        </td>
                      ) : null}
                    </tr>
                    {isExpanded ? (
                      <tr className="bg-[#f7fafc]">
                        <td
                          colSpan={10}
                          className="px-12 py-3 text-sm text-[#4b5870]"
                        >
                          <div className="flex flex-wrap gap-6">
                            <span>
                              Open incidents:{" "}
                              <strong>{site.openIncidents}</strong>
                            </span>
                            <span>
                              Guards on duty:{" "}
                              <strong>{site.guardsOnDuty}</strong>
                            </span>
                            <span>
                              Last completed patrol:{" "}
                              <strong>
                                {formatRelative(site.lastPatrolAt)}
                              </strong>
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
          Showing {sites.length} of {data.total}
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

      <NewSiteModal
        open={newOpen}
        onOpenChange={setNewOpen}
        orgTimezone={data.orgTimezone}
        zones={data.zones}
        templates={data.templates}
        parentClients={data.parentClients}
        employees={data.employees}
        onCreated={(site) => {
          setOptimisticSites([site, ...sites]);
          toast.success("Site created");
          router.refresh();
        }}
      />

      <BulkChangeModal
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        sites={selectedSites}
        zones={data.zones}
        templates={data.templates}
        employees={data.employees}
        onApplied={(count) => {
          toast.success(`Updated ${count} site${count === 1 ? "" : "s"}`);
          setSelected(new Set());
          router.refresh();
        }}
      />
    </div>
  );
}
