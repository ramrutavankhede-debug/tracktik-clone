export default function SitesPage() {
  return (
    <Placeholder title="Sites (Client)" hint="Site list and detail land in Prompt 6." />
  );
}

function Placeholder({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold text-navy">{title}</h1>
      <p className="text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}
