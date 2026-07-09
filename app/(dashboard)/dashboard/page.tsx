"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import Link from "next/link";
import { 
  DollarSign, 
  Receipt, 
  Users, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export default function DashboardPage() {
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

  return (
    <>
      <PageHeader 
        title="Dashboard" 
        description="Overview of your restaurant's performance today."
      >
        <Button onClick={() => setIsNewOrderOpen(true)}>+ New Order</Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard 
          title="Today's Revenue" 
          value="$2,450.00" 
          trend="+12.5%" 
          trendUp={true} 
          icon={DollarSign} 
        />
        <KpiCard 
          title="Open Orders" 
          value="14" 
          trend="+2" 
          trendUp={true} 
          icon={Receipt} 
        />
        <KpiCard 
          title="Tables Occupied" 
          value="8 / 15" 
          trend="53%" 
          trendUp={true} 
          icon={Users} 
        />
        <KpiCard 
          title="Low Stock Alerts" 
          value="3 Items" 
          trend="Needs attention" 
          trendUp={false} 
          icon={AlertTriangle} 
          alert
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-text-primary">Recent Orders</h3>
            <Link href="/orders">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-secondary uppercase bg-white/5">
                <tr>
                  <th className="px-4 py-3 font-medium">Order #</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                <OrderRow id="ORD-0142" type="Dine In" table="T-04" items={3} total="$45.00" status="Open" />
                <OrderRow id="ORD-0141" type="Takeaway" items={2} total="$28.50" status="Completed" />
                <OrderRow id="ORD-0140" type="Delivery" items={5} total="$89.00" status="To Invoice" />
                <OrderRow id="ORD-0139" type="Dine In" table="T-12" items={1} total="$12.00" status="Completed" />
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="bg-gradient-dark border-accent/20">
          <div className="p-4 border-b border-border/50">
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Live Alerts
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex gap-3 items-start">
              <div className="w-2 h-2 rounded-full bg-warning mt-1.5" />
              <div>
                <div className="text-sm text-text-primary">Low Stock: Tomato Sauce</div>
                <div className="text-xs text-text-secondary">Only 2 liters remaining</div>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-2 h-2 rounded-full bg-accent mt-1.5" />
              <div>
                <div className="text-sm text-text-primary">New Delivery Order</div>
                <div className="text-xs text-text-secondary">ORD-0143 via Web App</div>
              </div>
            </div>
          </div>
        </Card>
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

function KpiCard({ title, value, trend, trendUp, icon: Icon, alert }: any) {
  return (
    <Card className={`relative overflow-hidden ${alert ? 'border-error/30' : ''}`}>
      {alert && <div className="absolute top-0 right-0 w-16 h-16 bg-error/10 rounded-bl-full -mr-8 -mt-8" />}
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div className="p-2 bg-white/5 rounded-lg">
            <Icon className={`w-5 h-5 ${alert ? 'text-error' : 'text-text-secondary'}`} />
          </div>
          <Badge variant={alert ? "error" : "outline"} className="text-[10px]">
            {trendUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : !alert ? <ArrowDownRight className="w-3 h-3 mr-1" /> : null}
            {trend}
          </Badge>
        </div>
        <div>
          <div className="text-sm font-semibold text-text-secondary mb-1">{title}</div>
          <div className="font-display text-3xl text-text-primary tracking-wider">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderRow({ id, type, table, items, total, status }: any) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open": return <Badge variant="warning">Open</Badge>;
      case "Completed": return <Badge variant="success">Completed</Badge>;
      case "To Invoice": return <Badge variant="info">To Invoice</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <tr className="border-b border-border/50 hover:bg-white/5 transition-colors">
      <td className="px-4 py-3 font-mono text-xs">{id}</td>
      <td className="px-4 py-3">
        <div className="text-sm">{type}</div>
        {table && <div className="text-xs text-text-secondary">Table {table}</div>}
      </td>
      <td className="px-4 py-3 text-sm">{items} items</td>
      <td className="px-4 py-3 text-sm font-mono">{total}</td>
      <td className="px-4 py-3">{getStatusBadge(status)}</td>
    </tr>
  );
}
