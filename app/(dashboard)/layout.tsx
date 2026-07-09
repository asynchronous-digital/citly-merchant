import { Topbar } from "@/components/layout/Topbar";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      <Sidebar />
      <main className="pt-14 md:pl-64 h-screen overflow-y-auto">
        <div className="p-4 md:p-6 pb-24 mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
