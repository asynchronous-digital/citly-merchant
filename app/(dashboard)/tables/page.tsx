"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export default function TablesPage() {
  const [selectedTable, setSelectedTable] = useState<any>(null);
  return (
    <>
      <PageHeader 
        title="Table Management" 
        description="Floor plan and current table statuses."
      />

      <div className="bg-surface border border-border rounded-xl p-8 min-h-[500px]">
        <div className="flex flex-wrap gap-8 justify-center">
          <TableGroup title="Main Hall">
            <Table id="T-01" seats={2} status="available" onClick={() => setSelectedTable({ id: "T-01", status: "available" })} />
            <Table id="T-02" seats={4} status="occupied" time="50m" amount="$12.00" onClick={() => setSelectedTable({ id: "T-02", status: "occupied" })} />
            <Table id="T-03" seats={4} status="reserved" time="19:30" onClick={() => setSelectedTable({ id: "T-03", status: "reserved" })} />
            <Table id="T-04" seats={6} status="occupied" time="10m" amount="$45.00" onClick={() => setSelectedTable({ id: "T-04", status: "occupied" })} />
          </TableGroup>
          
          <TableGroup title="Outdoor Patio">
            <Table id="P-01" seats={2} status="available" onClick={() => setSelectedTable({ id: "P-01", status: "available" })} />
            <Table id="P-02" seats={2} status="available" onClick={() => setSelectedTable({ id: "P-02", status: "available" })} />
            <Table id="P-03" seats={4} status="cleaning" onClick={() => setSelectedTable({ id: "P-03", status: "cleaning" })} />
          </TableGroup>
        </div>
      </div>

      <Modal isOpen={!!selectedTable} onClose={() => setSelectedTable(null)} title={`Manage Table ${selectedTable?.id}`}>
        {selectedTable && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Current Status: <strong className="uppercase text-text-primary">{selectedTable.status}</strong>
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button className="w-full" variant="outline">View Order</Button>
              <Button className="w-full" variant="outline">Clear Table</Button>
              <Button className="w-full" variant="outline">Mark Reserved</Button>
              <Button className="w-full">Create Order</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function TableGroup({ title, children }: any) {
  return (
    <div className="p-6 border border-dashed border-border rounded-2xl bg-white/[0.02]">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-widest text-center mb-6">{title}</h3>
      <div className="grid grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  );
}

function Table({ id, seats, status, time, amount, onClick }: any) {
  const getStatusColor = () => {
    if (status === 'available') return 'border-border bg-white/5 text-text-primary hover:border-text-secondary';
    if (status === 'occupied') return 'border-accent bg-accent/10 text-accent hover:bg-accent/20';
    if (status === 'reserved') return 'border-warning bg-warning/10 text-warning hover:bg-warning/20';
    if (status === 'cleaning') return 'border-info bg-info/10 text-info hover:bg-info/20';
  };

  return (
    <div 
      onClick={onClick}
      className={`w-24 h-24 rounded-full border-2 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 ${getStatusColor()}`}
    >
      <span className="font-display tracking-widest text-lg">{id}</span>
      <span className="text-[10px] opacity-70 mb-1">{seats} Seats</span>
      {status === 'occupied' && (
        <div className="flex flex-col items-center text-[10px]">
          <span>{time}</span>
          <span className="font-mono">{amount}</span>
        </div>
      )}
      {status === 'reserved' && (
        <span className="text-[10px] font-mono">{time}</span>
      )}
    </div>
  );
}
