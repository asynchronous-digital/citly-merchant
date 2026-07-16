"use server";

import { erpFetch } from "@/lib/erpnext/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// ─── Helpers ─────────────────────────────────────────────

async function getRestaurantName(): Promise<string> {
  const cookieStore = await cookies();
  const cached = cookieStore.get("restaurant_name")?.value;
  if (cached) return cached;

  try {
    const loggedUser = await erpFetch<string>("/api/method/frappe.auth.get_logged_user");
    if (loggedUser && loggedUser !== "Guest") {
      const ADMIN_TOKEN = process.env.ERPNEXT_ADMIN_TOKEN || "";
      const baseUrl = process.env.NEXT_PUBLIC_ERPNEXT_URL || "http://104.248.237.122";

      const userRes = await fetch(`${baseUrl}/api/resource/User/${encodeURIComponent(loggedUser)}`, {
        headers: { "Authorization": ADMIN_TOKEN, "Accept": "application/json" }
      });
      let resolvedRestaurant = "";
      let userFirstName = "";
      if (userRes.ok) {
        const userData = await userRes.json();
        resolvedRestaurant = userData.data?.restaurant || "";
        userFirstName = userData.data?.first_name || "";
      }

      if (!resolvedRestaurant) {
        const restQueryRes = await fetch(`${baseUrl}/api/resource/Restaurant?filters=[["owner","=","${loggedUser}"]]`, {
          headers: { "Authorization": ADMIN_TOKEN, "Accept": "application/json" }
        });
        if (restQueryRes.ok) {
          const restQueryData = await restQueryRes.json();
          if (restQueryData.data && restQueryData.data.length > 0) {
            resolvedRestaurant = restQueryData.data[0].name;
          }
        }
      }

      // Smart fallback: match by first_name, email prefix, or first available restaurant
      if (!resolvedRestaurant) {
        const allRestsRes = await fetch(`${baseUrl}/api/resource/Restaurant?fields=["name","restaurant_name"]`, {
          headers: { "Authorization": ADMIN_TOKEN, "Accept": "application/json" }
        });
        if (allRestsRes.ok) {
          const allRestsData = await allRestsRes.json();
          const restaurants = allRestsData.data || [];
          if (restaurants.length > 0) {
            const firstName = userFirstName.toLowerCase().trim();
            const emailPrefix = loggedUser.split("@")[0].toLowerCase();
            
            let matched = restaurants.find((r: any) => {
              const rName = (r.restaurant_name || r.name || "").toLowerCase();
              return rName.includes(firstName) || firstName.includes(rName);
            });
            
            if (!matched && emailPrefix) {
              matched = restaurants.find((r: any) => {
                const rName = (r.restaurant_name || r.name || "").toLowerCase();
                return rName.includes(emailPrefix) || emailPrefix.includes(rName);
              });
            }
            
            resolvedRestaurant = matched ? matched.name : restaurants[0].name;
          }
        }
      }

      if (resolvedRestaurant) {
        // Permanently update the User document with the resolved restaurant
        try {
          await fetch(`${baseUrl}/api/resource/User/${encodeURIComponent(loggedUser)}`, {
            method: "PUT",
            headers: {
              "Authorization": ADMIN_TOKEN,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ restaurant: resolvedRestaurant })
          });
        } catch (e) {
          console.error("Failed to save resolved restaurant to User profile:", e);
        }

        cookieStore.set("restaurant_name", resolvedRestaurant, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 3,
        });
        return resolvedRestaurant;
      }
    }
  } catch (error) {
    console.error("Failed to dynamically resolve restaurant name:", error);
  }

  return "";
}

// ─── Categories (Restaurant Menu Category) ──────────────

export async function getMenuCategories() {
  try {
    const restaurant = await getRestaurantName();
    const filters = restaurant
      ? `&filters=[["restaurant","=","${restaurant}"]]`
      : "";

    const data = await erpFetch<{
      name: string;
      category_name: string;
      display_order: number;
      is_active: number;
    }[]>(
      `/api/resource/Restaurant Menu Category?fields=["name","category_name","display_order","is_active"]${filters}&order_by=display_order asc&limit_page_length=100`
    );

    if (!data || !Array.isArray(data)) return [];
    return data.map((cat: any) => ({
      id: cat.name,
      name: cat.category_name,
      displayOrder: cat.display_order || 0,
      isActive: cat.is_active !== 0,
    }));
  } catch (error) {
    console.error("Failed to fetch menu categories:", error);
    return [];
  }
}

export async function createCategory(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return { error: "Category name is required" };

  try {
    const restaurant = await getRestaurantName();
    await erpFetch("/api/resource/Restaurant Menu Category", {
      method: "POST",
      body: JSON.stringify({
        category_name: name,
        restaurant: restaurant,
        is_active: 1,
      }),
    });

    revalidatePath("/menu");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create category:", error);
    return { error: error.message || "Failed to create category" };
  }
}

export async function editCategory(id: string, newName: string) {
  if (!newName) return { error: "New category name is required" };

  try {
    await erpFetch(`/api/resource/Restaurant Menu Category/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify({
        category_name: newName,
      }),
    });

    revalidatePath("/menu");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to edit category:", error);
    return { error: error.message || "Failed to edit category" };
  }
}

export async function deleteCategory(id: string) {
  try {
    await erpFetch(`/api/resource/Restaurant Menu Category/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    revalidatePath("/menu");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete category:", error);
    return { error: error.message || "Failed to delete category. Ensure it has no items." };
  }
}

// ─── Menu Items (Restaurant Menu Item) ──────────────────

export async function getMenuItems(categoryId?: string) {
  try {
    const restaurant = await getRestaurantName();
    const filters: string[][] = [];
    if (restaurant) {
      filters.push(["restaurant", "=", restaurant]);
    }
    if (categoryId) {
      filters.push(["category", "=", categoryId]);
    }

    const filterStr = filters.length > 0 ? `&filters=${JSON.stringify(filters)}` : "";

    const items = await erpFetch<{
      name: string;
      item_name: string;
      category: string;
      description: string;
      price: number;
      image: string;
      is_available: number;
      display_order: number;
    }[]>(
      `/api/resource/Restaurant Menu Item?fields=["name","item_name","category","description","price","image","is_available","display_order"]${filterStr}&order_by=display_order asc&limit_page_length=100`
    );

    if (!items || !Array.isArray(items)) return [];

    return items.map((item: any) => ({
      id: item.name,
      name: item.item_name,
      categoryId: item.category,
      price: item.price || 0,
      image: item.image || "",
      description: item.description || "",
      isAvailable: item.is_available !== 0,
      displayOrder: item.display_order || 0,
    }));
  } catch (error) {
    console.error("Failed to fetch menu items:", error);
    return [];
  }
}

export async function createMenuItem(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;

  if (!name || isNaN(price) || !category) {
    return { error: "Name, valid price, and category are required" };
  }

  try {
    const restaurant = await getRestaurantName();

    await erpFetch("/api/resource/Restaurant Menu Item", {
      method: "POST",
      body: JSON.stringify({
        item_name: name,
        restaurant: restaurant,
        category: category,
        description: description || "",
        price: price,
        is_available: 1,
      }),
    });

    revalidatePath("/menu");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create menu item:", error);
    return { error: error.message || "Failed to create menu item" };
  }
}

export async function updateMenuItem(id: string, updates: Record<string, any>) {
  try {
    await erpFetch(`/api/resource/Restaurant Menu Item/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });

    revalidatePath("/menu");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update menu item:", error);
    return { error: error.message || "Failed to update menu item" };
  }
}

export async function deleteMenuItem(id: string) {
  try {
    await erpFetch(`/api/resource/Restaurant Menu Item/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    revalidatePath("/menu");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete menu item:", error);
    return { error: error.message || "Failed to delete menu item" };
  }
}

export async function setupDoctypes() {
  const adminToken = process.env.ERPNEXT_ADMIN_TOKEN || "";
  const baseUrl = process.env.NEXT_PUBLIC_ERPNEXT_URL;

  const createDocType = async (payload: any) => {
    const res = await fetch(`${baseUrl}/api/resource/DocType`, {
      method: "POST",
      headers: {
        "Authorization": adminToken,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to create ${payload.name}: ${errText}`);
    }
    return res.json();
  };

  try {
    // 1. Restaurant Menu Category
    await createDocType({
      name: "Restaurant Menu Category",
      module: "Core",
      custom: 1,
      autoname: "hash",
      fields: [
        { fieldname: "category_name", label: "Category Name", fieldtype: "Data", reqd: 1, in_list_view: 1 },
        { fieldname: "restaurant", label: "Restaurant", fieldtype: "Link", options: "Restaurant", reqd: 1, in_list_view: 1 },
        { fieldname: "description", label: "Description", fieldtype: "Small Text" },
        { fieldname: "display_order", label: "Display Order", fieldtype: "Int", default: "0" },
        { fieldname: "is_active", label: "Is Active", fieldtype: "Check", default: "1" }
      ],
      permissions: [
        { role: "All", read: 1 },
        { role: "Merchant", read: 1, write: 1, create: 1, delete: 1 },
        { role: "System Manager", read: 1, write: 1, create: 1, delete: 1 }
      ]
    });

    // 2. Restaurant Menu Item
    await createDocType({
      name: "Restaurant Menu Item",
      module: "Core",
      custom: 1,
      autoname: "hash",
      fields: [
        { fieldname: "item_name", label: "Item Name", fieldtype: "Data", reqd: 1, in_list_view: 1 },
        { fieldname: "restaurant", label: "Restaurant", fieldtype: "Link", options: "Restaurant", reqd: 1, in_list_view: 1 },
        { fieldname: "category", label: "Category", fieldtype: "Link", options: "Restaurant Menu Category", reqd: 1, in_list_view: 1 },
        { fieldname: "description", label: "Description", fieldtype: "Small Text" },
        { fieldname: "price", label: "Price", fieldtype: "Currency", reqd: 1, in_list_view: 1 },
        { fieldname: "image", label: "Image", fieldtype: "Attach Image" },
        { fieldname: "is_available", label: "Is Available", fieldtype: "Check", default: "1" },
        { fieldname: "display_order", label: "Display Order", fieldtype: "Int", default: "0" },
        { fieldname: "linked_item", label: "Linked Item", fieldtype: "Link", options: "Item" }
      ],
      permissions: [
        { role: "All", read: 1 },
        { role: "Merchant", read: 1, write: 1, create: 1, delete: 1 },
        { role: "System Manager", read: 1, write: 1, create: 1, delete: 1 }
      ]
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to setup doctypes:", error);
    return { error: error.message || "Failed to setup doctypes" };
  }
}
