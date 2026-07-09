"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Search, PackagePlus, ArrowRightLeft } from "lucide-react";

export default function InventoryPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [isStockAdjustmentOpen, setIsStockAdjustmentOpen] = useState(false);
  const [isPurchaseOrderOpen, setIsPurchaseOrderOpen] = useState(false);
  return (
    <>
      <PageHeader 
        title="Inventory & Stock" 
        description="Monitor stock levels, set reorder points, and log waste."
      >
        <Button variant="outline" onClick={() => setIsStockAdjustmentOpen(true)}>
          <ArrowRightLeft className="w-4 h-4 mr-2" /> Stock Adjustment
        </Button>
        <Button onClick={() => setIsPurchaseOrderOpen(true)}>
          <PackagePlus className="w-4 h-4 mr-2" /> Purchase Order
        </Button>
      </PageHeader>

      <Card>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input placeholder="Search inventory items..." className="pl-9 h-9" />
          </div>
          <div className="flex gap-2">
            <Badge 
              variant={activeFilter === "Low Stock" ? "error" : "outline"} 
              className="cursor-pointer"
              onClick={() => setActiveFilter("Low Stock")}
            >
              Low Stock (3)
            </Badge>
            <Badge 
              variant={activeFilter === "All" ? "default" : "outline"} 
              className="cursor-pointer"
              onClick={() => setActiveFilter("All")}
            >
              All Items
            </Badge>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-secondary uppercase bg-white/5">
              <tr>
                <th className="px-4 py-3 font-medium">Item Code</th>
                <th className="px-4 py-3 font-medium">Item Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">In Stock</th>
                <th className="px-4 py-3 font-medium">Reorder Lvl</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventoryData
                .filter((item) => activeFilter === "All" || (activeFilter === "Low Stock" && item.alert))
                .map((item, idx) => (
                  <StockRow key={idx} {...item} />
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Stock Adjustment Modal */}
      <Modal isOpen={isStockAdjustmentOpen} onClose={() => setIsStockAdjustmentOpen(false)} title="Stock Adjustment">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Item to Adjust</label>
            <select className="flex h-10 w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/50">
              {inventoryData.map(item => <option key={item.code}>{item.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Adjustment Type</label>
              <select className="flex h-10 w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/50">
                <option>Waste / Spoilage</option>
                <option>Manual Count Correction</option>
                <option>Staff Consumption</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Quantity (+/-)</label>
              <Input type="number" placeholder="e.g. -2" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsStockAdjustmentOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsStockAdjustmentOpen(false)}>Save Adjustment</Button>
          </div>
        </div>
      </Modal>

      {/* Purchase Order Modal */}
      <Modal isOpen={isPurchaseOrderOpen} onClose={() => setIsPurchaseOrderOpen(false)} title="Create Purchase Order">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Quick order for low stock items.</p>
          <div className="border border-border rounded-lg divide-y divide-border/50">
            {inventoryData.filter(i => i.alert).map(item => (
              <div key={item.code} className="flex justify-between items-center p-3 text-sm">
                <span>{item.name} <Badge variant="outline" className="text-[10px] ml-2">Stock: {item.stock}</Badge></span>
                <Input type="number" className="w-20 h-8" placeholder="Qty" defaultValue="10" />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsPurchaseOrderOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsPurchaseOrderOpen(false)}>Send PO</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function StockRow({ code, name, cat, stock, reorder, alert }: any) {
  return (
    <tr className="border-b border-border/50 hover:bg-white/5 transition-colors">
      <td className="px-4 py-3 font-mono text-xs text-text-secondary">{code}</td>
      <td className="px-4 py-3 font-medium">{name}</td>
      <td className="px-4 py-3 text-text-secondary">{cat}</td>
      <td className={`px-4 py-3 font-mono font-bold ${alert ? 'text-error' : 'text-text-primary'}`}>{stock}</td>
      <td className="px-4 py-3 font-mono text-text-secondary">{reorder}</td>
      <td className="px-4 py-3">
        {alert ? <Badge variant="error">Low Stock</Badge> : <Badge variant="success">Optimal</Badge>}
      </td>
    </tr>
  );
}

const inventoryData = [
  { code: "ING-001", name: "Tomato Sauce", cat: "Ingredients", stock: "2 L", reorder: "5 L", alert: true },
  { code: "ING-002", name: "Mozzarella Cheese", cat: "Dairy", stock: "1.5 kg", reorder: "2 kg", alert: true },
  { code: "BEV-014", name: "Coca Cola Can", cat: "Beverages", stock: "12 Nos", reorder: "24 Nos", alert: true },
  { code: "ING-015", name: "Pizza Flour", cat: "Ingredients", stock: "45 kg", reorder: "20 kg", alert: false },
  { code: "PKG-001", name: "Pizza Box (12 inch)", cat: "Packaging", stock: "150 Nos", reorder: "100 Nos", alert: false },
];
