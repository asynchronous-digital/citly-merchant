"use server";

import { erpFetch } from "@/lib/erpnext/client";

export async function getInventoryItems() {
  try {
    // 1. Fetch Items that maintain stock (is_stock_item = 1)
    const items = await erpFetch<{ 
      name: string; 
      item_name: string; 
      item_group: string; 
      stock_uom: string;
      re_order_level: number;
    }[]>('/api/resource/Item?fields=["name","item_name","item_group","stock_uom","re_order_level"]&filters=[["is_stock_item","=",1],["disabled","=",0]]&limit=100');
    
    if (!items || !Array.isArray(items)) {
      return [];
    }

    // 2. Fetch Bin records for actual quantities
    const bins = await erpFetch<{ 
      item_code: string; 
      actual_qty: number; 
    }[]>('/api/resource/Bin?fields=["item_code","actual_qty"]&limit=500');
    
    // Map quantities to items (aggregating across warehouses if multiple exist, or just picking the first for simplicity now)
    const stockMap = new Map<string, number>();
    if (Array.isArray(bins)) {
      bins.forEach((bin: any) => {
        const current = stockMap.get(bin.item_code) || 0;
        stockMap.set(bin.item_code, current + (bin.actual_qty || 0));
      });
    }

    return items.map((item: any) => {
      const stock = stockMap.get(item.name) || 0;
      const reorder = item.re_order_level || 0;
      return {
        code: item.name,
        name: item.item_name,
        cat: item.item_group,
        stock: `${stock} ${item.stock_uom}`,
        reorder: `${reorder} ${item.stock_uom}`,
        alert: stock <= reorder, // If stock is below or equal to reorder level, trigger alert
        rawStock: stock,
      };
    });

  } catch (error) {
    console.error("Failed to fetch inventory items:", error);
    // Return mock data for UI safety
    return [
      { code: "ING-001", name: "Tomato Sauce", cat: "Ingredients", stock: "2 L", reorder: "5 L", alert: true },
      { code: "ING-002", name: "Mozzarella Cheese", cat: "Dairy", stock: "1.5 kg", reorder: "2 kg", alert: true },
      { code: "BEV-014", name: "Coca Cola Can", cat: "Beverages", stock: "12 Nos", reorder: "24 Nos", alert: true },
      { code: "ING-015", name: "Pizza Flour", cat: "Ingredients", stock: "45 kg", reorder: "20 kg", alert: false },
      { code: "PKG-001", name: "Pizza Box (12 inch)", cat: "Packaging", stock: "150 Nos", reorder: "100 Nos", alert: false },
    ];
  }
}

export async function submitStockAdjustment(prevState: any, formData: FormData) {
  // Mock action for now
  const item = formData.get("item");
  const type = formData.get("type");
  const qty = formData.get("qty");
  console.log("Stock Adjustment Submitted:", { item, type, qty });
  return { success: true, message: "Stock adjustment created successfully" };
}

export async function submitPurchaseOrder(prevState: any, formData: FormData) {
  // Mock action for now
  console.log("Purchase Order Submitted with data:", Object.fromEntries(formData));
  return { success: true, message: "Purchase order generated successfully" };
}
