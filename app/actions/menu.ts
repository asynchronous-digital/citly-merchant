"use server";

import { erpFetch } from "@/lib/erpnext/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function getMenuCategories() {
  try {
    const data = await erpFetch<{ name: string; item_group_name: string; parent_item_group: string }[]>('/api/resource/Item Group?fields=["name","item_group_name","parent_item_group"]');
    
    // Default fallback if no data
    if (!data || !Array.isArray(data)) {
      return ["All Items"];
    }

    const categories = data
        .filter((cat: any) => cat.parent_item_group === "All Item Groups" || !cat.parent_item_group) // Example filter for top-level
        .map((cat: any) => cat.item_group_name);
    
    return ["All Items", ...categories];
  } catch (error) {
    console.error("Failed to fetch menu categories:", error);
    // Return mock data for UI safety during dev if API fails
    return ["All Items", "Starters", "Main Course", "Beverages", "Desserts", "Combos"];
  }
}

export async function getMenuItems() {
  try {
    const cookieStore = await cookies();
    const restaurantName = cookieStore.get("restaurant_name")?.value;
    
    const filters = [["is_sales_item","=",1], ["disabled","=",0]];
    if (restaurantName) {
      filters.push(["restaurant","=",restaurantName]);
    }

    // 1. Fetch Items
    const items = await erpFetch<{ 
      name: string; 
      item_name: string; 
      item_group: string; 
      image: string; 
      description: string; 
      disabled: number; 
    }[]>(`/api/resource/Item?fields=["name","item_name","item_group","image","description","disabled"]&filters=${JSON.stringify(filters)}&limit=100`);
    
    if (!items || !Array.isArray(items)) {
      return [];
    }

    // 2. Fetch Prices
    const prices = await erpFetch<{ 
      item_code: string; 
      price_list_rate: number; 
    }[]>('/api/resource/Item Price?fields=["item_code","price_list_rate"]&filters=[["price_list","=","Standard Selling"]]&limit=100');
    
    // Map prices to items
    const priceMap = new Map(prices.map((p: any) => [p.item_code, p.price_list_rate]));

    return items.map((item: any) => ({
      id: item.name,
      name: item.item_name,
      category: item.item_group,
      price: priceMap.get(item.name) || 0,
      image: item.image || "/images/placeholder-food.jpg", // Needs placeholder image or default handling
      description: item.description || "",
      isAvailable: item.disabled === 0,
      tags: [], // Could be fetched from a custom field
    }));

  } catch (error) {
    console.error("Failed to fetch menu items:", error);
    // Return mock data for UI safety
    return [
      { id: "1", name: "Margherita Pizza", category: "Main Course", price: 14.99, isAvailable: true, image: "/images/pizza.jpg" },
      { id: "2", name: "Garlic Bread", category: "Starters", price: 5.99, isAvailable: true, image: "/images/garlic-bread.jpg" },
      { id: "3", name: "Caesar Salad", category: "Starters", price: 8.99, isAvailable: true },
      { id: "4", name: "Tiramisu", category: "Desserts", price: 6.99, isAvailable: false },
    ];
  }
}

export async function createCategory(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return { error: "Category name is required" };

  try {
    await erpFetch("/api/resource/Item Group", {
      method: "POST",
      body: JSON.stringify({
        item_group_name: name,
        parent_item_group: "All Item Groups",
        is_group: 0
      })
    });
    
    revalidatePath("/menu");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create category:", error);
    return { error: error.message || "Failed to create category" };
  }
}

export async function deleteCategory(name: string) {
  try {
    await erpFetch(`/api/resource/Item Group/${encodeURIComponent(name)}`, {
      method: "DELETE"
    });
    revalidatePath("/menu");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete category:", error);
    return { error: error.message || "Failed to delete category. Ensure it is empty." };
  }
}

export async function editCategory(oldName: string, newName: string) {
  if (!newName) return { error: "New category name is required" };
  if (oldName === newName) return { success: true }; // No changes made
  
  try {
    // In Frappe, renaming a document uses the rename_doc method
    await erpFetch("/api/method/frappe.client.rename_doc", {
      method: "POST",
      body: JSON.stringify({
        doctype: "Item Group",
        old_name: oldName,
        new_name: newName
      })
    });
    
    revalidatePath("/menu");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to rename category:", error);
    return { error: error.message || "Failed to edit category" };
  }
}

export async function createMenuItem(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const category = formData.get("category") as string;

  if (!name || isNaN(price) || !category) {
    return { error: "Name, valid price, and category are required" };
  }

  try {
    const cookieStore = await cookies();
    const restaurantName = cookieStore.get("restaurant_name")?.value;

    const payload: any = {
      item_code: name.replace(/\s+/g, '-').toUpperCase() + '-' + Date.now().toString().slice(-4),
      item_name: name,
      item_group: category,
      is_stock_item: 0,
      is_sales_item: 1,
      stock_uom: "Nos",
      description: "Added from Citly Dashboard"
    };

    if (restaurantName) {
      payload.restaurant = restaurantName;
    }

    // 1. Create Item
    const itemData = await erpFetch<any>("/api/resource/Item", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    // 2. Create Item Price
    await erpFetch("/api/resource/Item Price", {
      method: "POST",
      body: JSON.stringify({
        item_code: itemData.name,
        price_list: "Standard Selling",
        price_list_rate: price
      })
    });

    revalidatePath("/menu");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create menu item:", error);
    return { error: error.message || "Failed to create menu item" };
  }
}
