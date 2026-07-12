"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, Bell, Settings } from "lucide-react";
import { logout } from "@/app/actions/auth";

export function Topbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-background border-b border-border flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-4">
        {/* Mobile menu button could go here */}
        <Link href="/dashboard" className="font-display text-2xl tracking-widest text-text-primary">
          CITLY<span className="text-accent">.</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={notificationsRef}>
          <button 
            className="text-text-secondary hover:text-text-primary transition-colors relative"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-accent rounded-full border border-background"></span>
          </button>
          
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-surface-elevated border border-border rounded-lg shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="px-4 py-2 border-b border-border/50 flex justify-between items-center">
                <span className="text-sm font-semibold text-text-primary">Notifications</span>
                <span className="text-xs text-accent cursor-pointer hover:underline">Mark all as read</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <NotificationItem 
                  title="New Order #143" 
                  desc="Delivery order placed 2 mins ago." 
                  time="2m ago" 
                  unread 
                />
                <NotificationItem 
                  title="Low Stock Alert" 
                  desc="Tomato Sauce is running low (2L left)." 
                  time="15m ago" 
                  unread 
                />
                <NotificationItem 
                  title="Shift Started" 
                  desc="John Doe (Manager) started their shift." 
                  time="1h ago" 
                />
              </div>
              <div className="px-4 py-2 border-t border-border/50 text-center">
                <span className="text-xs text-text-secondary cursor-pointer hover:text-text-primary">View all notifications</span>
              </div>
            </div>
          )}
        </div>
        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-text-primary hover:text-accent transition-colors">Admin User</div>
              <div className="text-xs text-text-secondary">Owner</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-text-secondary hover:bg-white/10 hover:text-text-primary transition-colors">
              <User className="w-4 h-4" />
            </div>
          </div>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-elevated border border-border rounded-lg shadow-2xl py-1 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="px-4 py-2 border-b border-border/50 sm:hidden">
                <div className="text-sm font-semibold text-text-primary">Admin User</div>
                <div className="text-xs text-text-secondary">Owner</div>
              </div>
              <Link 
                href="/settings" 
                className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <button 
                onClick={() => {
                  setIsDropdownOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors border-t border-border/50 mt-1"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function NotificationItem({ title, desc, time, unread }: any) {
  return (
    <div className={`px-4 py-3 border-b border-border/20 last:border-0 hover:bg-white/5 transition-colors cursor-pointer ${unread ? 'bg-accent/5' : ''}`}>
      <div className="flex justify-between items-start mb-1">
        <span className={`text-sm ${unread ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary'}`}>
          {title}
        </span>
        <span className="text-[10px] text-text-muted whitespace-nowrap ml-2">{time}</span>
      </div>
      <p className="text-xs text-text-secondary leading-snug line-clamp-2">{desc}</p>
    </div>
  );
}
