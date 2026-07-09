"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Receipt,
  Grid2X2,
  Package,
  Users,
  UserSquare2,
  BarChart3,
  Settings,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Menu", href: "/menu", icon: UtensilsCrossed },
  { name: "Orders", href: "/orders", icon: Receipt },
  { name: "Tables", href: "/tables", icon: Grid2X2 },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Staff", href: "/staff", icon: Users },
  { name: "Customers", href: "/customers", icon: UserSquare2 },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-64 bg-surface border-r border-border overflow-y-auto hidden md:block z-40">
      <div className="p-4">
        <div className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4 px-3">
          Manage Restaurant
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border-l-2",
                  isActive
                    ? "bg-accent/10 text-accent border-accent"
                    : "text-text-secondary hover:bg-white/5 hover:text-text-primary border-transparent"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-accent" : "text-text-muted")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
