"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Code2,
  Trophy,
  Briefcase,
  FolderKanban,
  Hammer,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks";
import { Button } from "./ui/button";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isCollapsed: boolean;
  isActive: boolean;
}

const SidebarItem = ({
  icon: Icon,
  label,
  href,
  isCollapsed,
  isActive,
}: SidebarItemProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300",
        "hover:bg-sidebar-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-md shadow-primary/10"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
        isCollapsed && "justify-center px-1.5"
      )}
    >
      <Icon
        className={cn(
          "shrink-0 transition-transform duration-300 group-hover:scale-110",
          isCollapsed ? "h-6 w-6" : "h-5 w-5"
        )}
      />

      {!isCollapsed && (
        <span className="font-medium text-md tracking-tight opacity-100 transition-opacity duration-300">
          {label}
        </span>
      )}

      {/* Collapsed Tooltip */}
      {isCollapsed && (
        <div className="absolute left-14 z-50 px-2 py-1.5 rounded-md bg-foreground text-background text-xs font-semibold opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap">
          {label}
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-[4px] border-y-transparent border-r-[4px] border-r-foreground" />
        </div>
      )}

      {/* Active Indicator */}
      {isActive && !isCollapsed && (
        <div className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary-foreground/40 animate-pulse" />
      )}
    </Link>
  );
};

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { user, isLoggedIn, logout } = useAuth() || {
    user: null,
    isLoggedIn: false,
    logout: () => {},
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Code2, label: "Profiles", href: "/profiles" },
    { icon: Trophy, label: "Achievements", href: "/achievements" },
    { icon: Briefcase, label: "Experience", href: "/experience" },
    { icon: FolderKanban, label: "Projects", href: "/projects" },
    { icon: Hammer, label: "Skills", href: "/skills" },
  ];

  const bottomItems = [
    { icon: HelpCircle, label: "Support", href: "/support" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <>
      <aside
        className={cn(
          "sticky top-[88px] left-0 h-[calc(100vh-88px)] border-r border-sidebar-border/40 bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/60 transition-all duration-500 ease-in-out z-40 flex flex-col group/sidebar overflow-visible pb-4 px-3",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Toggle Button */}
        <Button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "absolute -right-3 top-6 h-6 w-6 rounded-full border border-border bg-background text-foreground items-center justify-center hover:bg-secondary transition-all duration-300 opacity-0 group-hover/sidebar:opacity-100",
            !isCollapsed && "rotate-0",
            isCollapsed && "rotate-0"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>

        {/* Content */}
        <div className="flex-1 mt-6 space-y-6 overflow-hidden">
          {/* Main Navigation */}
          <div className="space-y-1.5">
            {!isCollapsed && (
              <p className="px-5 mb-4 text-[11px] font-extrabold uppercase tracking-[0.25em] text-foreground/70 transition-colors">
                Menu
              </p>
            )}
            {menuItems.map((item) => (
              <SidebarItem
                key={item.href}
                {...item}
                isCollapsed={isCollapsed}
                isActive={pathname === item.href}
              />
            ))}
          </div>

          <div className="border-t border-sidebar-border pt-6 space-y-1.5">
            {!isCollapsed && (
              <p className="px-5 mb-4 text-[11px] font-extrabold uppercase tracking-[0.25em] text-foreground/70 transition-colors">
                General
              </p>
            )}
            {bottomItems.map((item) => (
              <SidebarItem
                key={item.href}
                {...item}
                isCollapsed={isCollapsed}
                isActive={pathname === item.href}
              />
            ))}
          </div>
        </div>

        {/* Footer/Profile */}
        {isLoggedIn && (
          <div
            className={cn(
              "pt-4 mb-2 mt-auto border-t border-sidebar-border flex flex-col gap-2",
              isCollapsed ? "items-center" : ""
            )}
          >
            <div
              className={cn(
                "flex items-center gap-3 px-2 py-2 rounded-xl transition-colors",
                !isCollapsed && "hover:bg-sidebar-accent group/profile"
              )}
            >
              <div className="h-8 w-8 shrink-0 rounded-full bg-sidebar-primary/10 border border-sidebar-primary/20 flex items-center justify-center text-sidebar-primary text-xs font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-semibold truncate leading-tight">
                    {user?.username}
                  </span>
                  <span className="text-[11px] text-muted-foreground truncate leading-tight">
                    Pro Developer
                  </span>
                </div>
              )}
            </div>

            <Button
              onClick={() => logout()}
              variant="ghost"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-all",
                isCollapsed ? "justify-center px-2" : "mt-1"
              )}
            >
              <LogOut size={18} />
              {!isCollapsed && (
                <span className="text-sm font-medium">Logout</span>
              )}
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
