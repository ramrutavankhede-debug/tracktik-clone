import { cn } from "@/lib/utils";
import type { AccountType } from "@/lib/sites/types";

const STYLES: Record<AccountType, string> = {
  site: "bg-[#4a7c43] text-white",
  client: "bg-[#34495e] text-white",
  multi: "bg-[#f4c430] text-[#1e2530]",
};

const LABELS: Record<AccountType, string> = {
  site: "SITE",
  client: "CLIENT",
  multi: "MULTI",
};

export function TypeBadge({
  type,
  className,
}: {
  type: AccountType;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold tracking-wide",
        STYLES[type],
        className,
      )}
    >
      {LABELS[type]}
    </span>
  );
}
