import Link from "next/link";

import { SiteDetailClient } from "@/components/sites/site-detail-client";
import { getSiteDetail } from "@/lib/sites/get-site-detail";

export default async function SiteDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const site = await getSiteDetail(params.id);

  if (!site) {
    return (
      <div className="space-y-3 p-4">
        <Link href="/sites" className="text-sm text-[#1e88d2] hover:underline">
          ← Back to List All Sites
        </Link>
        <div className="rounded border border-[#d8dde5] bg-white p-6">
          <h1 className="text-xl font-semibold text-navy">Site not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This site may have been removed or the link is invalid.
          </p>
        </div>
      </div>
    );
  }

  return <SiteDetailClient site={site} />;
}
