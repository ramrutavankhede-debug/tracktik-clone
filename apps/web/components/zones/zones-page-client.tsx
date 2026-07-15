"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Globe2, Plus } from "lucide-react";

import type { ZonesPageData } from "@/lib/zones/queries";
import { cn } from "@/lib/utils";

function CountBadge({ value }: { value: number }) {
  return (
    <span className="inline-flex min-w-[1.75rem] items-center justify-center rounded bg-[#4aa3df] px-2 py-0.5 text-xs font-semibold text-white">
      {value}
    </span>
  );
}

export function ZonesPageClient({ data }: { data: ZonesPageData }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filterText, setFilterText] = useState(searchParams.get("q") ?? "");
  const [optionsOpen, setOptionsOpen] = useState(false);

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

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const from = data.total === 0 ? 0 : (data.page - 1) * data.pageSize + 1;
  const to = Math.min(data.page * data.pageSize, data.total);

  return (
    <div className="-m-4 flex min-h-[calc(100vh-3.5rem-2.5rem)] flex-col bg-content">
      <div className="flex h-11 items-center gap-2 bg-[#2c3440] px-4 text-white">
        <Globe2 className="h-4 w-4 text-sidebar-fg" />
        <h1 className="text-sm font-semibold">Customer Zones</h1>
      </div>

      <div className="flex items-center gap-3 border-b border-[#d8dde5] bg-white px-4 py-2">
        <Link
          href="/sites/zones/new"
          className="inline-flex items-center gap-1 rounded border border-[#c9d3de] bg-white px-3 py-1.5 text-sm text-[#1e88d2] hover:bg-[#f4f7fa]"
        >
          <Globe2 className="h-3.5 w-3.5" />
          <Plus className="h-3 w-3" />
          Add Zone
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-[#d8dde5] bg-[#f3f5f8] px-4 py-2">
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
          value={searchParams.get("template") ?? "all"}
          onChange={(e) => updateParam("template", e.target.value)}
        >
          <option value="all">All Zone Templates</option>
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
            <div className="absolute right-0 z-20 mt-1 w-48 rounded border border-[#d0d7e0] bg-white p-2 shadow-lg">
              <label className="flex items-center justify-between gap-2 px-2 py-1 text-sm">
                Rows / page
                <select
                  className="h-7 rounded border border-[#c9d3de] px-1"
                  value={String(data.pageSize)}
                  onChange={(e) => updateParam("pageSize", e.target.value)}
                >
                  {[10, 25, 50, 100].map((n) => (
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
        {data.zones.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-muted-foreground">
              No zones yet — create your first zone
            </p>
            <Link
              href="/sites/zones/new"
              className="rounded bg-[#1e88d2] px-4 py-2 text-sm font-medium text-white"
            >
              + Add Zone
            </Link>
          </div>
        ) : (
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead className="bg-[#f7f8fa] text-left text-xs uppercase tracking-wide text-[#6b778c]">
              <tr className="border-b border-[#e5e9ef]">
                <th className="px-3 py-2">
                  <button type="button" onClick={() => toggleSort("uid")}>
                    Zone Uid
                  </button>
                </th>
                <th className="px-3 py-2">
                  <button type="button" onClick={() => toggleSort("name")}>
                    Zone Name
                  </button>
                </th>
                <th className="px-3 py-2">Devices</th>
                <th className="px-3 py-2">Sites</th>
                <th className="px-3 py-2">Sub-Zones</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {data.zones.map((zone) => (
                <tr
                  key={zone.id}
                  className="border-b border-[#eef1f5] hover:bg-[#f8fbfe]"
                >
                  <td className="px-3 py-2 text-[#3d4a5c]">
                    {zone.zoneUid ?? ""}
                  </td>
                  <td className="px-3 py-2 font-medium text-navy">
                    {zone.name}
                  </td>
                  <td className="px-3 py-2">
                    <CountBadge value={zone.devicesCount} />
                  </td>
                  <td className="px-3 py-2">
                    <CountBadge value={zone.sitesCount} />
                  </td>
                  <td className="px-3 py-2">
                    <CountBadge value={zone.subZonesCount} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      href={`/sites/zones/${zone.id}`}
                      className="inline-flex rounded bg-[#4a7c43] px-3 py-1 text-xs font-semibold text-white hover:bg-[#3f6b39]"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-[#d8dde5] bg-white px-4 py-2 text-sm text-[#5b677a]">
        <span>
          {from}/{to} of {data.total}
        </span>
        <div className="flex items-center gap-2">
          <select
            className="h-8 rounded border border-[#c9d3de] px-2"
            value={String(data.pageSize)}
            onChange={(e) => updateParam("pageSize", e.target.value)}
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={data.page <= 1}
            className={cn(
              "rounded border border-[#c9d3de] px-2 py-1 disabled:opacity-40",
            )}
            onClick={() => updateParam("page", String(data.page - 1))}
          >
            Prev
          </button>
          <span>Page {data.page}</span>
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
    </div>
  );
}
