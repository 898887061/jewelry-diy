import { BraceletBuilder } from "@/components/bracelet-builder/BraceletBuilder";
import { loadBeads } from "@/lib/load-beads";

export default async function BuilderPage() {
  const beads = await loadBeads();

  return <BraceletBuilder beads={beads} />;
}
