import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-navy px-6 text-center">
      <h1 className="text-4xl font-bold tracking-wide text-white">
        GUARD <span className="text-accent">OPS</span>
      </h1>
      <p className="mt-3 max-w-md text-sm text-sidebar-fg">
        Security workforce management platform. Monorepo scaffold is ready —
        open the dashboard shell after Prompt 1.
      </p>
      <Link
        href="/dashboard"
        className="mt-8 rounded bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90"
      >
        Go to Dashboard
      </Link>
    </main>
  );
}
