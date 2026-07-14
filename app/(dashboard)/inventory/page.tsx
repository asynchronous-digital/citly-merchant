import { getInventoryItems } from "@/app/actions/inventory";
import { InventoryClient } from "./InventoryClient";

export default async function InventoryPage() {
  const inventory = await getInventoryItems();

  return <InventoryClient initialInventory={inventory} />;
}
