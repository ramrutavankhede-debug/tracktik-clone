import { Suspense } from "react";

import { ZonesPageClient } from "@/components/zones/zones-page-client";
import {
  getZonesPageData,
  type ZonesSearchParams,
} from "@/lib/zones/queries";

export default async function ZonesPage({
  searchParams,
}: {
  searchParams: ZonesSearchParams;
}) {
  const data = await getZonesPageData(searchParams);
  return (
    <Suspense
      fallback={
        <div className="-m-4 p-4 text-sm text-muted-foreground">
          Loading zones…
        </div>
      }
    >
      <ZonesPageClient data={data} />
    </Suspense>
  );
}
