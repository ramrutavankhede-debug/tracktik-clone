import { CreateZoneForm } from "@/components/zones/create-zone-form";
import { getZoneTemplates } from "@/lib/zones/queries";

export default async function CreateZonePage() {
  const templates = await getZoneTemplates();
  return <CreateZoneForm templates={templates} />;
}
