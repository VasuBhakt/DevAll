"use client";

import { useAuth } from "@/hooks";
import Link from "next/link";
import {
  User as UserIcon,
  Settings,
  LogOut,
  ChevronDown,
  Github,
} from "lucide-react";
import { ThemeToggle } from "./buttons";
import { Button } from "./ui/button";
import { Logo } from "./Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();
  const { user, isSignedIn, isLoading, signoutAsync } = useAuth();

  const signOut = async () => {
    await signoutAsync();
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
      <div className="container mx-auto flex h-[88px] items-center justify-between px-4 sm:px-8">
        {/*Left side*/}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center font-bold text-xl tracking-tighter transition-transform hover:scale-105"
          >
            <Logo />
          </Link>
        </div>

        {/*Right side*/}
        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="h-10 w-32 animate-pulse rounded-full bg-muted" />
          ) : isSignedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-secondary/40 hover:bg-secondary/60 rounded-full border border-border/60 transition-all cursor-pointer group">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm border border-primary/20 shadow-sm transition-transform group-hover:scale-105">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col items-start leading-none pr-1">
                    <span className="hidden sm:inline-block text-sm font-semibold text-foreground tracking-tight">
                      {user?.username}
                    </span>
                  </div>
                  <ChevronDown
                    size={14}
                    className="text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
                  />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 mt-2 p-1.5 rounded-xl border-border/80 backdrop-blur-xl bg-card/95"
              >
                <DropdownMenuLabel className="px-3 py-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold truncate leading-none">
                      @{user?.username}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/60 mx-1" />

                <Link href="/profile" passHref>
                  <DropdownMenuItem className="gap-2 px-3 py-2.5 rounded-lg cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors">
                    <UserIcon size={16} />
                    <span className="text-sm font-medium">My Profile</span>
                  </DropdownMenuItem>
                </Link>

                <Link href="/settings" passHref>
                  <DropdownMenuItem className="gap-2 px-3 py-2.5 rounded-lg cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors">
                    <Settings size={16} />
                    <span className="text-sm font-medium">Settings</span>
                  </DropdownMenuItem>
                </Link>

                <DropdownMenuSeparator className="bg-border/60 mx-1" />

                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors group"
                >
                  <LogOut
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                  <span className="text-sm font-semibold">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/signup">
                <Button className="px-6 py-5.5 text-md font-semibold rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
