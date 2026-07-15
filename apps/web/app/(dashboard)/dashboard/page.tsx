export default function DashboardPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold text-navy">Live Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Placeholder — KPI tiles and live feed land in Prompt 5.
      </p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex h-24 items-end justify-between rounded bg-tile-blue p-3 text-white shadow-sm"
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide opacity-90">
              Tile {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-3xl font-bold tabular-nums">00</span>
          </div>
        ))}
      </div>
    </div>
  );
}
