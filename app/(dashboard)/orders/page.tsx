"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("All Active");
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  return (
    <>
      <PageHeader 
        title="Orders" 
        description="View and manage all incoming and active orders."
      >
        <Button onClick={() => setIsNewOrderOpen(true)}>+ New Order</Button>
      </PageHeader>

      <div className="flex gap-2 mb-6 border-b border-border pb-px overflow-x-auto">
        {["All Active", "Dine In", "Takeaway", "Delivery", "Completed"].map((tab) => (
          <Tab 
            key={tab} 
            active={activeTab === tab} 
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </Tab>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {ordersData
          .filter((order) => {
            if (activeTab === "All Active") return order.status !== "Completed";
            if (activeTab === "Completed") return order.status === "Completed";
            return order.type === activeTab && order.status !== "Completed";
          })
          .map((order) => (
            <OrderCard key={order.id} {...order} />
          ))}
      </div>

      <Modal isOpen={isNewOrderOpen} onClose={() => setIsNewOrderOpen(false)} title="Create New Order">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Order Type</label>
              <select className="flex h-10 w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/50">
                <option>Dine In</option>
                <option>Takeaway</option>
                <option>Delivery</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Table No. (Optional)</label>
              <Input placeholder="e.g. T-04" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Customer Contact (Optional)</label>
            <Input placeholder="Phone number or name" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsNewOrderOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsNewOrderOpen(false)}>Start Order</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function Tab({ active, onClick, children }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${active ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'}`}
    >
      {children}
    </button>
  );
}

function OrderCard({ id, type, time, table, items, amount, status, alert }: any) {
  return (
    <Card className={`p-4 ${alert ? 'border-accent/50 shadow-[0_0_15px_rgba(232,76,30,0.15)]' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-semibold">{id}</span>
            <Badge variant="outline" className="text-[10px]">{time}</Badge>
          </div>
          <div className="text-xs text-text-secondary flex gap-2">
            <span>{type}</span>
            {table && <span className="text-accent font-medium">• Table {table}</span>}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>
      
      <div className="bg-white/5 rounded-lg p-3 mb-3 text-sm">
        <div className="text-text-secondary mb-1">{items} items</div>
        <div className="font-mono text-lg text-text-primary">{amount}</div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">View Details</Button>
        {status === 'New' && <Button size="sm" className="flex-1">Accept</Button>}
        {status === 'Kitchen' && <Button size="sm" variant="secondary" className="flex-1">Print KOT</Button>}
        {status === 'Ready' && <Button size="sm" className="flex-1">Mark Served</Button>}
        {status === 'To Invoice' && <Button size="sm" className="flex-1 bg-success/20 text-success hover:bg-success/30">Invoice</Button>}
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'New') return <Badge variant="error" className="animate-pulse">New</Badge>;
  if (status === 'Kitchen') return <Badge variant="warning">Kitchen</Badge>;
  if (status === 'Ready') return <Badge variant="success">Ready</Badge>;
  if (status === 'Served') return <Badge variant="default">Served</Badge>;
  if (status === 'To Invoice') return <Badge variant="info">To Invoice</Badge>;
  return <Badge>{status}</Badge>;
}

const ordersData = [
  { id: "ORD-0142", type: "Dine In", time: "10m ago", table: "T-04", items: 3, amount: "$45.00", status: "Kitchen" },
  { id: "ORD-0143", type: "Delivery", time: "2m ago", table: null, items: 5, amount: "$89.00", status: "New", alert: true },
  { id: "ORD-0141", type: "Takeaway", time: "15m ago", table: null, items: 2, amount: "$28.50", status: "Ready" },
  { id: "ORD-0140", type: "Dine In", time: "45m ago", table: "T-12", items: 6, amount: "$112.00", status: "Served" },
  { id: "ORD-0139", type: "Dine In", time: "50m ago", table: "T-02", items: 1, amount: "$12.00", status: "To Invoice" },
  { id: "ORD-0138", type: "Takeaway", time: "1h ago", table: null, items: 3, amount: "$34.00", status: "Completed" },
  { id: "ORD-0137", type: "Delivery", time: "2h ago", table: null, items: 4, amount: "$76.50", status: "Completed" },
];
