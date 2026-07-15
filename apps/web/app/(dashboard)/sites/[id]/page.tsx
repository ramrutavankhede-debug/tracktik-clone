import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function SiteDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("sites")
    .select("id, name, account_uid, account_type, city")
    .eq("id", params.id)
    .maybeSingle();

  const site = data as {
    id: string;
    name: string;
    account_uid: string;
    account_type: string;
    city: string | null;
  } | null;

  return (
    <div className="space-y-4">
      <Link href="/sites" className="text-sm text-[#1e88d2] hover:underline">
        ← Back to List All Sites
      </Link>
      <div className="rounded border border-[#d8dde5] bg-white p-6">
        <h1 className="text-xl font-semibold text-navy">
          {site?.name ?? "Site"}
        </h1>
        {site ? (
          <p className="mt-1 text-sm text-muted-foreground">
            #{site.account_uid} · {site.account_type.toUpperCase()}
            {site.city ? ` · ${site.city}` : ""}
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">Site not found</p>
        )}
        <p className="mt-6 text-sm text-[#5b677a]">Detail coming soon</p>
      </div>
    </div>
  );
}
