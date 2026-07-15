"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bell,
  Globe2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Settings2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  formatShortAddress,
  formatSiteAddress,
  type SiteDetail,
} from "@/lib/sites/detail-types";
import { cn } from "@/lib/utils";

const PRIMARY_TABS = [
  "Overview",
  "Operation Reports",
  "Notifications",
  "Security & Patrol",
  "Message Board",
  "Settings",
  "Calendar Dates",
] as const;

const OVERVIEW_SUBTABS = [
  "Positions",
  "Assigned Employees",
  "Client Portal Access",
  "Banned Employees",
  "Other Site Contacts / Addresses",
  "Account Notes",
  "History",
] as const;

type PrimaryTab = (typeof PRIMARY_TABS)[number];
type OverviewSubTab = (typeof OVERVIEW_SUBTABS)[number];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function SiteDetailClient({ site }: { site: SiteDetail }) {
  const [primaryTab, setPrimaryTab] = useState<PrimaryTab>("Overview");
  const [subTab, setSubTab] = useState<OverviewSubTab>("Positions");

  const fullAddress = useMemo(() => formatSiteAddress(site), [site]);
  const shortAddress = useMemo(() => formatShortAddress(site), [site]);
  const mapHref =
    site.lat != null && site.lng != null
      ? `https://www.google.com/maps?q=${site.lat},${site.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  function stubAction(label: string) {
    toast.message(`${label} — coming soon`);
  }

  return (
    <div className="-m-4 min-h-[calc(100vh-3.5rem-2.5rem)] bg-content">
      {/* Site title strip */}
      <div className="flex items-center gap-3 bg-[#1e2530] px-4 py-3 text-white">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#4aa3df] text-sm font-bold">
          {site.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={site.logoUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            initials(site.name)
          )}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold">{site.name}</h1>
          <p className="truncate text-xs text-sidebar-fg">{shortAddress}</p>
        </div>
        <Link
          href="/sites"
          className="ml-auto shrink-0 text-xs text-sidebar-fg hover:text-white"
        >
          ← All Sites
        </Link>
      </div>

      {/* Primary tabs */}
      <div className="flex flex-wrap gap-1 border-b border-[#d0d7e0] bg-[#e8ecf1] px-2 pt-2">
        {PRIMARY_TABS.map((tab) => {
          const active = primaryTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setPrimaryTab(tab)}
              className={cn(
                "rounded-t px-3 py-2 text-sm",
                active
                  ? "bg-white font-medium text-navy shadow-sm"
                  : "text-[#5b677a] hover:text-navy",
              )}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {primaryTab !== "Overview" ? (
        <div className="m-4 rounded border border-[#d8dde5] bg-white p-8 text-center text-sm text-[#6b778c]">
          <p className="font-medium text-navy">{primaryTab}</p>
          <p className="mt-2">Coming soon for this site.</p>
        </div>
      ) : (
        <div className="p-4">
          {/* Action toolbar */}
          <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-[#1e88d2]">
            <button
              type="button"
              className="inline-flex items-center gap-1 hover:underline"
              onClick={() => stubAction("Edit")}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 hover:underline"
              onClick={() => stubAction("Close Account")}
            >
              <XCircle className="h-3.5 w-3.5" />
              Close Account
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 hover:underline"
              onClick={() => stubAction("Geocode")}
            >
              <Globe2 className="h-3.5 w-3.5" />
              Geocode
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 hover:underline"
              onClick={() => stubAction("Dispatch Settings")}
            >
              <Bell className="h-3.5 w-3.5" />
              Dispatch Settings
            </button>
          </div>

          {/* Site information card */}
          <div className="rounded border border-[#d8dde5] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded border border-[#e5e9ef] bg-[#f4f7fa] text-xl font-bold text-[#4aa3df]">
                {site.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={site.logoUrl}
                    alt=""
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  initials(site.name)
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-navy">
                    {site.name}
                  </h2>
                  <span className="inline-flex rounded-full bg-[#4aa3df] px-2.5 py-0.5 text-xs font-semibold text-white">
                    #{site.accountUid}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3 text-[#8a93a0]">
                  <Phone
                    className={cn(
                      "h-4 w-4",
                      site.phoneMain && "text-[#1e88d2]",
                    )}
                    aria-label={site.phoneMain ?? "No phone"}
                  />
                  <Mail
                    className={cn("h-4 w-4", site.email && "text-[#1e88d2]")}
                    aria-label={site.email ?? "No email"}
                  />
                  {site.phoneMain ? (
                    <span className="text-sm text-[#5b677a]">
                      {site.phoneMain}
                    </span>
                  ) : null}
                  {site.email ? (
                    <span className="text-sm text-[#5b677a]">{site.email}</span>
                  ) : null}
                </div>
              </div>

              <div className="min-w-[240px] shrink-0 text-sm lg:max-w-sm lg:text-right">
                <div className="mb-1 flex items-start justify-end gap-1 text-[#5b677a]">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8a93a0] lg:hidden" />
                  <div>
                    <span className="font-semibold text-navy">Address: </span>
                    <span className="text-[#3d4a5c]">{fullAddress || "—"}</span>
                    {fullAddress ? (
                      <>
                        {" "}
                        <a
                          href={mapHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-[#1e88d2] hover:underline"
                        >
                          View Map
                        </a>
                      </>
                    ) : null}
                  </div>
                </div>
                <p className="text-[#5b677a]">
                  <span className="font-semibold text-navy">
                    Bill-to Address:{" "}
                  </span>
                  Same as main address.
                </p>
              </div>
            </div>
          </div>

          {/* Linked parent account banner */}
          {site.parentClientName ? (
            <div className="mt-3 rounded border border-[#b6d7f0] bg-[#e8f4fc] px-4 py-2.5 text-sm text-[#2d4a63]">
              This account is a sub-account linked to{" "}
              {site.parentClientId ? (
                <Link
                  href={`/sites/${site.parentClientId}`}
                  className="font-semibold text-[#1e88d2] hover:underline"
                >
                  {site.parentClientName}
                </Link>
              ) : (
                <strong>{site.parentClientName}</strong>
              )}
            </div>
          ) : null}

          {/* Overview sub-tabs */}
          <div className="mt-4 overflow-x-auto rounded-t bg-[#5b6b7c]">
            <div className="flex min-w-max">
              {OVERVIEW_SUBTABS.map((tab) => {
                const active = subTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSubTab(tab)}
                    className={cn(
                      "px-4 py-2.5 text-sm whitespace-nowrap",
                      active
                        ? "bg-white font-medium text-navy"
                        : "text-white/90 hover:bg-white/10",
                    )}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-b border border-t-0 border-[#d8dde5] bg-white p-4">
            {subTab === "Positions" ? (
              <div>
                <button
                  type="button"
                  onClick={() => stubAction("Create a Position")}
                  className="inline-flex items-center gap-1 rounded border border-[#c9d3de] bg-white px-3 py-1.5 text-sm text-[#1e88d2] hover:bg-[#f4f7fa]"
                >
                  + Create a Position
                </button>
                <p className="mt-6 text-center text-sm text-[#8a93a0]">
                  No positions yet for this site.
                </p>
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-[#6b778c]">
                <Settings2 className="mx-auto mb-2 h-5 w-5 opacity-50" />
                <p className="font-medium text-navy">{subTab}</p>
                <p className="mt-1">Coming soon</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
