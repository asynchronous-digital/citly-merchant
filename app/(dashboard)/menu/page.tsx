import { getMenuCategories, getMenuItems } from "@/app/actions/menu";
import { MenuClient } from "./MenuClient";

export default async function MenuPage() {
  const categories = await getMenuCategories();
  const items = await getMenuItems();

  return <MenuClient initialCategories={categories} initialItems={items} />;
}
