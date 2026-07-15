export function SitesLoadingSkeleton() {
  return (
    <div className="-m-4 space-y-0">
      <div className="h-11 bg-[#2c3440]" />
      <div className="h-12 animate-pulse bg-white" />
      <div className="h-12 animate-pulse bg-[#f3f5f8]" />
      <div className="space-y-2 bg-white p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-[#eef1f5]" />
        ))}
      </div>
    </div>
  );
}
