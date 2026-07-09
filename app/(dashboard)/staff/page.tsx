"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Plus, UserCircle2, Mail, Phone, Calendar } from "lucide-react";

export default function StaffPage() {
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  return (
    <>
      <PageHeader 
        title="Staff Management" 
        description="Manage your team, roles, and attendance."
      >
        <Button onClick={() => setIsAddEmployeeOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Employee
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {staffData.map((emp) => (
          <EmployeeCard 
            key={emp.id} 
            {...emp} 
            onViewProfile={() => setSelectedEmployee(emp)} 
          />
        ))}
      </div>

      {/* Add Employee Modal */}
      <Modal isOpen={isAddEmployeeOpen} onClose={() => setIsAddEmployeeOpen(false)} title="Add New Employee">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">First Name</label>
              <Input placeholder="John" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Last Name</label>
              <Input placeholder="Doe" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Role</label>
              <select className="flex h-10 w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/50">
                <option>Manager</option>
                <option>Chef</option>
                <option>Waiter</option>
                <option>Cashier</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Phone</label>
              <Input placeholder="+1 234 567 8900" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsAddEmployeeOpen(false)}>Add Employee</Button>
          </div>
        </div>
      </Modal>

      {/* View Profile Modal */}
      <Modal isOpen={!!selectedEmployee} onClose={() => setSelectedEmployee(null)} title="Employee Profile">
        {selectedEmployee && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-border/50 pb-4">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-text-secondary">
                <UserCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">{selectedEmployee.name}</h3>
                <Badge variant="outline" className="mt-1">{selectedEmployee.role}</Badge>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <Phone className="w-4 h-4" /> <span>{selectedEmployee.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <Mail className="w-4 h-4" /> <span>{selectedEmployee.name.toLowerCase().replace(' ', '.')}@citly.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <Calendar className="w-4 h-4" /> <span>Joined: Jan 2024</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
              <Button variant="outline" onClick={() => setSelectedEmployee(null)}>Close</Button>
              <Button onClick={() => setSelectedEmployee(null)}>Edit Profile</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function EmployeeCard({ name, role, phone, status, onViewProfile }: any) {
  return (
    <Card className="flex flex-col">
      <CardContent className="p-5 flex gap-4">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-text-secondary">
          <UserCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h4 className="font-semibold text-text-primary">{name}</h4>
          <div className="text-xs text-text-secondary mb-2">{role}</div>
          <div className="font-mono text-xs text-text-muted">{phone}</div>
        </div>
      </CardContent>
      <div className="mt-auto border-t border-border p-3 flex justify-between items-center bg-white/[0.02]">
        <Badge 
          variant={status === 'On Shift' ? 'success' : status === 'On Leave' ? 'warning' : 'outline'}
          className="text-[10px]"
        >
          {status}
        </Badge>
        <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={onViewProfile}>View Profile</Button>
      </div>
    </Card>
  );
}

const staffData = [
  { id: 1, name: "John Doe", role: "Manager", phone: "+1 234 567 8900", status: "On Shift" },
  { id: 2, name: "Jane Smith", role: "Head Chef", phone: "+1 234 567 8901", status: "On Shift" },
  { id: 3, name: "Mike Johnson", role: "Waiter", phone: "+1 234 567 8902", status: "Off Shift" },
  { id: 4, name: "Sarah Williams", role: "Cashier", phone: "+1 234 567 8903", status: "On Leave" },
];
