import { Suspense } from "react";

import { SitesPageClient } from "@/components/sites/sites-page-client";
import { getSitesPageData } from "@/lib/sites/queries";
import type { SitesSearchParams } from "@/lib/sites/types";
import { SitesLoadingSkeleton } from "@/components/sites/sites-loading-skeleton";

export default async function SitesPage({
  searchParams,
}: {
  searchParams: SitesSearchParams;
}) {
  const data = await getSitesPageData(searchParams);

  return (
    <Suspense fallback={<SitesLoadingSkeleton />}>
      <SitesPageClient data={data} />
    </Suspense>
  );
}
