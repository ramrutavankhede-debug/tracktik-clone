import { Suspense } from "react";

import { SitesLoadingSkeleton } from "@/components/sites/sites-loading-skeleton";

export default function SitesLoading() {
  return (
    <Suspense>
      <SitesLoadingSkeleton />
    </Suspense>
  );
}
