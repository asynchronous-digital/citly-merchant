"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, TrendingUp, TrendingDown } from "lucide-react";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("Sales Summary");
  return (
    <>
      <PageHeader 
        title="Financial Reports" 
        description="Analyze your restaurant's performance."
      >
        <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
      </PageHeader>

      <div className="flex gap-2 mb-6 border-b border-border pb-px">
        {["Sales Summary", "Item Performance", "Daily Closing", "Tax Report"].map((tab) => (
          <Tab 
            key={tab} 
            active={activeTab === tab} 
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </Tab>
        ))}
      </div>

      {activeTab === "Sales Summary" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 flex items-center justify-center border-dashed bg-white/[0.01] min-h-[300px]">
            <div className="text-center text-text-secondary">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Sales Chart visualization placeholder</p>
              <p className="text-xs mt-1">Recharts library to be implemented here</p>
            </div>
          </Card>

          <div className="space-y-4">
            <ReportCard title="Total Revenue (7d)" value="$12,450.00" trend="+8.2%" trendUp />
            <ReportCard title="Avg Order Value" value="$42.50" trend="-1.5%" trendUp={false} />
            <ReportCard title="Total Orders" value="293" trend="+12%" trendUp />
          </div>
        </div>
      )}

      {activeTab === "Item Performance" && (
        <Card className="p-6 flex flex-col items-center justify-center border-dashed bg-white/[0.01] min-h-[300px] text-text-secondary">
          <TrendingUp className="w-12 h-12 mb-3 opacity-20" />
          <p className="font-medium text-text-primary">Top Performing Items</p>
          <p className="text-xs mt-1">Item-wise sales data will appear here.</p>
        </Card>
      )}

      {activeTab === "Daily Closing" && (
        <Card className="p-6 flex flex-col items-center justify-center border-dashed bg-white/[0.01] min-h-[300px] text-text-secondary">
          <Download className="w-12 h-12 mb-3 opacity-20" />
          <p className="font-medium text-text-primary">End of Day Reconciliation</p>
          <p className="text-xs mt-1">Cash and card breakdown will appear here.</p>
        </Card>
      )}

      {activeTab === "Tax Report" && (
        <Card className="p-6 flex flex-col items-center justify-center border-dashed bg-white/[0.01] min-h-[300px] text-text-secondary">
          <TrendingDown className="w-12 h-12 mb-3 opacity-20" />
          <p className="font-medium text-text-primary">Tax & VAT Summary</p>
          <p className="text-xs mt-1">Collected taxes per rate slab.</p>
        </Card>
      )}
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

function ReportCard({ title, value, trend, trendUp }: any) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-sm text-text-secondary mb-1">{title}</div>
        <div className="font-display text-3xl tracking-wider mb-2">{value}</div>
        <Badge variant={trendUp ? 'success' : 'error'} className="text-[10px]">
          {trendUp ? '↑' : '↓'} {trend} vs last period
        </Badge>
      </CardContent>
    </Card>
  );
}
