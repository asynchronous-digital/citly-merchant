"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Restaurant Profile");
  return (
    <>
      <PageHeader 
        title="Settings" 
        description="Manage your restaurant profile and system preferences."
      >
        <Button>Save Changes</Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-2">
          {[
            "Restaurant Profile",
            "Operating Hours",
            "Payment & Tax",
            "Printers & Hardware",
            "Users & Roles"
          ].map((tab) => (
            <SettingTab 
              key={tab} 
              active={activeTab === tab} 
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </SettingTab>
          ))}
        </div>

        <div className="lg:col-span-2">
          {activeTab === "Restaurant Profile" && (
            <Card>
              <CardHeader className="border-b border-border p-5">
                <h3 className="font-semibold text-lg text-text-primary">Restaurant Profile</h3>
                <p className="text-sm text-text-secondary">Update your business details and contact information.</p>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary uppercase">Restaurant Name</label>
                    <Input defaultValue="Citly Demo Restaurant" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary uppercase">Phone Number</label>
                    <Input defaultValue="+1 (555) 123-4567" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase">Address</label>
                  <Input defaultValue="123 Culinary Ave, Food District, NY 10001" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary uppercase">Tax ID / GST No.</label>
                    <Input defaultValue="GST-8901234567" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary uppercase">Default Currency</label>
                    <Input defaultValue="USD ($)" disabled />
                  </div>
                </div>

              </CardContent>
            </Card>
          )}

          {activeTab === "Operating Hours" && (
            <Card>
              <CardHeader className="border-b border-border p-5">
                <h3 className="font-semibold text-lg text-text-primary">Operating Hours</h3>
                <p className="text-sm text-text-secondary">Set your standard opening and closing times.</p>
              </CardHeader>
              <CardContent className="p-6 flex items-center justify-center text-text-secondary min-h-[200px] bg-white/[0.01]">
                Form fields for operating hours will go here.
              </CardContent>
            </Card>
          )}

          {activeTab === "Payment & Tax" && (
            <Card>
              <CardHeader className="border-b border-border p-5">
                <h3 className="font-semibold text-lg text-text-primary">Payment & Tax Configuration</h3>
                <p className="text-sm text-text-secondary">Configure accepted payment methods and tax rates.</p>
              </CardHeader>
              <CardContent className="p-6 flex items-center justify-center text-text-secondary min-h-[200px] bg-white/[0.01]">
                Form fields for tax and payment gateways will go here.
              </CardContent>
            </Card>
          )}

          {activeTab === "Printers & Hardware" && (
            <Card>
              <CardHeader className="border-b border-border p-5">
                <h3 className="font-semibold text-lg text-text-primary">Hardware</h3>
                <p className="text-sm text-text-secondary">Configure receipt and KOT printers.</p>
              </CardHeader>
              <CardContent className="p-6 flex items-center justify-center text-text-secondary min-h-[200px] bg-white/[0.01]">
                Printer network configurations will go here.
              </CardContent>
            </Card>
          )}

          {activeTab === "Users & Roles" && (
            <Card>
              <CardHeader className="border-b border-border p-5">
                <h3 className="font-semibold text-lg text-text-primary">User Management</h3>
                <p className="text-sm text-text-secondary">Invite team members and assign roles.</p>
              </CardHeader>
              <CardContent className="p-6 flex items-center justify-center text-text-secondary min-h-[200px] bg-white/[0.01]">
                Employee role matrix will go here.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function SettingTab({ active, onClick, children }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-accent/10 text-accent border border-accent/20' : 'text-text-secondary hover:bg-white/5 hover:text-text-primary border border-transparent'}`}
    >
      {children}
    </button>
  );
}
