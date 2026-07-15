"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleHelp,
  Ellipsis,
  MapPin,
  Menu,
  Monitor,
  PanelsTopLeft,
  Share2,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Monitor;
  children?: { href: string; label: string }[];
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboards", icon: Monitor },
  {
    href: "/sites",
    label: "Sites (Client)",
    icon: Users,
    children: [
      { href: "/sites", label: "Site List" },
      { href: "/sites/zones", label: "Site Zones (Groups)" },
    ],
  },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/maps", label: "Maps", icon: MapPin },
  { href: "/settings", label: "Settings", icon: Ellipsis },
];

const SECONDARY_TABS = [
  { href: "/dashboard", label: "Live Dashboard" },
  { href: "/reports", label: "Operation Reports" },
  { href: "/assets", label: "Asset Tracking" },
] as const;

function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center bg-navy px-3">
      <button
        type="button"
        onClick={onMenuClick}
        className="mr-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#2d3542] text-sidebar-fg lg:hidden"
        aria-label="Toggle navigation"
      >
        <Menu className="h-4 w-4" />
      </button>

      <Link href="/dashboard" className="shrink-0 text-lg font-bold tracking-wide text-white">
        GUARD <span className="text-accent">OPS</span>
      </Link>

      <div className="mx-4 hidden min-w-0 flex-1 md:block lg:mx-8">
        <input
          type="search"
          placeholder="Search for customers, contacts, employees"
          className="h-9 w-full max-w-xl rounded-md border-0 bg-[#2d3542] px-3 text-sm text-white placeholder:text-[#8a93a0] focus:outline-none focus:ring-1 focus:ring-tile-blue"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {[
          { icon: CircleHelp, label: "Help" },
          { icon: PanelsTopLeft, label: "Display" },
          { icon: Share2, label: "Share" },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2d3542] text-sidebar-fg hover:text-white"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    </header>
  );
}

function isSitesListPath(pathname: string) {
  if (pathname === "/sites") return true;
  if (!pathname.startsWith("/sites/")) return false;
  return !pathname.startsWith("/sites/zones");
}

function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [sitesMenuOpen, setSitesMenuOpen] = useState(false);

  function isActive(href: string, children?: NavItem["children"]) {
    if (children?.length) {
      return (
        isSitesListPath(pathname) ||
        pathname === "/sites/zones" ||
        pathname.startsWith("/sites/zones/")
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close navigation overlay"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={cn(
          "fixed bottom-0 left-0 top-14 z-40 w-[150px] bg-sidebar transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between px-3 pt-3 lg:justify-center">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-600 text-sm font-bold text-white"
            title="Organization"
          >
            AV
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-sidebar-fg lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="mt-4 flex flex-col gap-1 px-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon, children }) => {
            const active = isActive(href, children);
            const isSites = Boolean(children?.length);

            if (isSites) {
              return (
                <div
                  key={href}
                  className="relative"
                  onMouseEnter={() => setSitesMenuOpen(true)}
                  onMouseLeave={() => setSitesMenuOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => setSitesMenuOpen((v) => !v)}
                    className={cn(
                      "relative flex w-full flex-col items-center gap-1 rounded-sm px-2 py-3 text-center text-[11px] leading-tight",
                      active
                        ? "bg-sidebar-hover text-white"
                        : "text-sidebar-fg hover:bg-sidebar-hover/60 hover:text-white",
                    )}
                  >
                    {active ? (
                      <span className="absolute bottom-1 left-0 top-1 w-[3px] rounded-r bg-accent" />
                    ) : null}
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                    <span>{label}</span>
                  </button>

                  {sitesMenuOpen ? (
                    <div className="absolute left-full top-0 z-50 ml-1 w-52 rounded border border-[#3a4452] bg-[#1e2530] py-1 shadow-xl">
                      {children!.map((child) => {
                        const childActive =
                          child.href === "/sites"
                            ? isSitesListPath(pathname)
                            : pathname === child.href ||
                              pathname.startsWith(`${child.href}/`);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => {
                              setSitesMenuOpen(false);
                              onClose();
                            }}
                            className={cn(
                              "block px-3 py-2 text-sm",
                              childActive
                                ? "bg-sidebar-hover text-white"
                                : "text-sidebar-fg hover:bg-sidebar-hover hover:text-white",
                            )}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "relative flex flex-col items-center gap-1 rounded-sm px-2 py-3 text-center text-[11px] leading-tight",
                  active
                    ? "bg-sidebar-hover text-white"
                    : "text-sidebar-fg hover:bg-sidebar-hover/60 hover:text-white",
                )}
              >
                {active ? (
                  <span className="absolute bottom-1 left-0 top-1 w-[3px] rounded-r bg-accent" />
                ) : null}
                <Icon className="h-5 w-5" strokeWidth={1.75} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

function SecondaryTabBar() {
  const pathname = usePathname();

  return (
    <div className="flex h-10 items-end gap-1 bg-sidebar px-2">
      {SECONDARY_TABS.map(({ href, label }) => {
        const active =
          href === "/dashboard"
            ? pathname === "/dashboard" || pathname === "/"
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-t px-4 py-2 text-sm",
              active
                ? "bg-white font-medium text-navy"
                : "text-sidebar-fg hover:text-white",
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-content">
      <TopBar onMenuClick={() => setMobileNavOpen((v) => !v)} />
      <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="pt-14 lg:pl-[150px]">
        <SecondaryTabBar />
        <main className="min-h-[calc(100vh-3.5rem-2.5rem)] bg-content p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
