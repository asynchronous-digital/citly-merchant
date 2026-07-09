import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export default function CustomersPage() {
  return (
    <>
      <PageHeader 
        title="Customers" 
        description="View customer history and loyalty points."
      />

      <Card>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input placeholder="Search by name, phone or email..." className="pl-9 h-9" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-secondary uppercase bg-white/5">
              <tr>
                <th className="px-4 py-3 font-medium">Customer Name</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Total Orders</th>
                <th className="px-4 py-3 font-medium">Lifetime Spend</th>
                <th className="px-4 py-3 font-medium">Loyalty Tier</th>
              </tr>
            </thead>
            <tbody>
              <CustomerRow name="Alice Brown" contact="+1 555-0100" orders={12} spend="$450.00" tier="Gold" />
              <CustomerRow name="Bob Smith" contact="bob@example.com" orders={4} spend="$120.50" tier="Silver" />
              <CustomerRow name="Charlie Davis" contact="+1 555-0200" orders={1} spend="$45.00" tier="Regular" />
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function CustomerRow({ name, contact, orders, spend, tier }: any) {
  const getTierBadge = (t: string) => {
    if (t === 'Gold') return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">Gold</Badge>;
    if (t === 'Silver') return <Badge className="bg-gray-400/20 text-gray-300 border-gray-400/50">Silver</Badge>;
    return <Badge variant="outline">Regular</Badge>;
  };

  return (
    <tr className="border-b border-border/50 hover:bg-white/5 transition-colors">
      <td className="px-4 py-4 font-medium">{name}</td>
      <td className="px-4 py-4 font-mono text-xs text-text-secondary">{contact}</td>
      <td className="px-4 py-4">{orders}</td>
      <td className="px-4 py-4 font-mono">{spend}</td>
      <td className="px-4 py-4">{getTierBadge(tier)}</td>
    </tr>
  );
}
