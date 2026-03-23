"use client";

import { useAuth } from "@/hooks";
import Link from "next/link";
import { List, LogOut } from "lucide-react";
import { ThemeToggle } from "./buttons";
import { Button } from "./ui/button";

export function Navbar() {
  const { user, isLoggedIn, isLoading, isError, logout } = useAuth();

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-[88px] items-center justify-between px-4 sm:px-8">
          {/*Left side*/}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <Link
                href="/"
                className="flex items-center font-bold text-xl tracking-tighter transition-transform hover:scale-105"
              >
                <span className="bg-black text-white px-5 py-2 rounded-md dark:rounded-r-none transition-all duration-300">
                  Dev
                </span>
                <span className="bg-white text-black px-5 py-2 rounded-md light:rounded-l-none transition-all duration-300">
                  All
                </span>
              </Link>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-secondary-foreground mt-1">
                By Maadhava
              </p>
            </div>
          </div>
          {/*Right side*/}
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
            ) : isLoggedIn ? (
              <div className="flex items-center gap-3">
                {/*Profile Circle*/}
                <div className="flex items-center gap-2 px-2 py-0.5 bg-secondary/30 rounded-full border border-border">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline-block text-sm font-medium">
                    {user?.username}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                  className="gap-2"
                >
                  <LogOut size={14} />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/signup">
                  <Button className="px-4 py-5 text-md">Get Started</Button>
                </Link>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </>
  );
}
