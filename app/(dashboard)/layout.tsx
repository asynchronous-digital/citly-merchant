import { Topbar } from "@/components/layout/Topbar";
import { Sidebar } from "@/components/layout/Sidebar";

import { cookies } from "next/headers";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const userName = cookieStore.get("user_full_name")?.value || "Admin User";
  const userRole = cookieStore.get("user_role")?.value || "Owner";

  return (
    <div className="min-h-screen bg-background">
      <Topbar userName={userName} userRole={userRole} />
      <Sidebar />
      <main className="pt-14 md:pl-64 h-screen overflow-y-auto">
        <div className="p-4 md:p-6 pb-24 mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
