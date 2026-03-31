"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  User as UserIcon,
  Mail,
  Trash2,
  ShieldAlert,
  ArrowLeft,
  Settings as SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth";

export default function Settings() {
  const { user, isLoading, signout } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await AuthService.deleteAccount();
      signout();
      router.push("/");
    } catch (error) {
      alert("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">
          Please sign in to access settings.
        </h1>
        <Link href="/signin">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-88px)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight">
                Account Settings
              </h1>
              <p className="text-muted-foreground">
                Manage your personal information and account status.
              </p>
            </div>
          </div>
          <div className="p-3 glass-card rounded-2xl text-primary">
            <SettingsIcon size={24} />
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 rounded-3xl space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <UserIcon size={120} />
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <UserIcon size={18} className="text-primary" />
                Personal Information
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    Username
                  </label>
                  <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <span className="font-mono font-medium text-foreground">
                      {user.username}
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <Mail size={16} className="text-muted-foreground" />
                    <span className="font-medium text-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border border-destructive/20 bg-destructive/5 p-8 rounded-3xl space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <h2 className="text-lg font-bold flex items-center gap-2 text-destructive">
                  <ShieldAlert size={18} />
                  Danger Zone
                </h2>
                <p className="text-muted-foreground text-sm max-w-md ">
                  Deleting your account is permanent and cannot be undone. All
                  your data, including achievements and experiences, will be
                  permanently removed.
                </p>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="h-12 px-6 rounded-2xl gap-2 text-primary font-bold transition-all hover:scale-105 active:scale-95"
                  >
                    <Trash2 size={18} />
                    Delete My Account
                  </Button>
                </DialogTrigger>
                <DialogContent className=" glass-card border-destructive/30 sm:max-w-[425px]">
                  <DialogHeader className="space-y-3">
                    <div className="w-12 h-12 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mb-2">
                      <ShieldAlert size={28} />
                    </div>
                    <DialogTitle className="text-2xl font-black">
                      Are you absolutely sure?
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      This action is irreversible. It will permanently delete
                      your account
                      <span className="font-bold text-foreground">
                        {" "}
                        ({user.username}){" "}
                      </span>
                      and remove all associated data from our servers.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-6 flex-col sm:flex-row gap-3">
                    <Button className="rounded-xl font-bold h-12 px-4 shadow-none">
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      className="rounded-xl font-bold h-12 px-6"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Confirm Account Deletion"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
    </div>
  );
}
