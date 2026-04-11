import { loadBeads } from "@/lib/load-beads";
import { ProductsClient } from "@/components/products/ProductsClient";

export default async function ProductsPage() {
  const beads = await loadBeads();

  return <ProductsClient beads={beads} />;
}
