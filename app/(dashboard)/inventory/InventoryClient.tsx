"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Search, PackagePlus, ArrowRightLeft } from "lucide-react";
import { submitStockAdjustment, submitPurchaseOrder } from "@/app/actions/inventory";

export function InventoryClient({ initialInventory }: { initialInventory: any[] }) {
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
              Low Stock ({initialInventory.filter(i => i.alert).length})
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
              {initialInventory
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
        <form action={async (formData) => {
          await submitStockAdjustment(null, formData);
          setIsStockAdjustmentOpen(false);
        }} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Item to Adjust</label>
            <select name="item" className="flex h-10 w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/50">
              {initialInventory.map(item => <option className="bg-background text-text-primary" key={item.code} value={item.code}>{item.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Adjustment Type</label>
              <select name="type" className="flex h-10 w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/50">
                <option className="bg-background text-text-primary" value="Waste / Spoilage">Waste / Spoilage</option>
                <option className="bg-background text-text-primary" value="Manual Count Correction">Manual Count Correction</option>
                <option className="bg-background text-text-primary" value="Staff Consumption">Staff Consumption</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Quantity (+/-)</label>
              <Input name="qty" type="number" placeholder="e.g. -2" required />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsStockAdjustmentOpen(false)}>Cancel</Button>
            <Button type="submit">Save Adjustment</Button>
          </div>
        </form>
      </Modal>

      {/* Purchase Order Modal */}
      <Modal isOpen={isPurchaseOrderOpen} onClose={() => setIsPurchaseOrderOpen(false)} title="Create Purchase Order">
        <form action={async (formData) => {
          await submitPurchaseOrder(null, formData);
          setIsPurchaseOrderOpen(false);
        }} className="space-y-4">
          <p className="text-sm text-text-secondary">Quick order for low stock items.</p>
          <div className="border border-border rounded-lg divide-y divide-border/50 max-h-64 overflow-y-auto">
            {initialInventory.filter(i => i.alert).map(item => (
              <div key={item.code} className="flex justify-between items-center p-3 text-sm">
                <span>{item.name} <Badge variant="outline" className="text-[10px] ml-2">Stock: {item.stock}</Badge></span>
                <Input name={`qty_${item.code}`} type="number" className="w-20 h-8" placeholder="Qty" defaultValue="10" />
              </div>
            ))}
            {initialInventory.filter(i => i.alert).length === 0 && (
              <div className="p-4 text-center text-text-secondary text-sm">No items currently below reorder level.</div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsPurchaseOrderOpen(false)}>Cancel</Button>
            <Button type="submit">Send PO</Button>
          </div>
        </form>
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
