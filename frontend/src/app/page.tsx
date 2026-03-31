"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Github,
  Sparkles,
  Globe,
  Shield,
  Zap,
  Computer,
  Code2,
  Terminal,
  Cpu,
  Database,
  GitBranch,
  Braces,
  Binary,
  Layers,
  Blocks,
  GitPullRequest,
  Cloud,
  Monitor,
  Smartphone,
  Webhook,
  Workflow,
  Search,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const floatingIcons = [
  {
    Icon: Code2,
    size: 28,
    initialX: -100,
    initialY: -100,
    duration: 15,
    delay: 0,
    color: "text-primary",
  },
  {
    Icon: Terminal,
    size: 24,
    initialX: 120,
    initialY: -120,
    duration: 18,
    delay: 1,
    color: "text-primary",
  },
  {
    Icon: Cpu,
    size: 22,
    initialX: 150,
    initialY: 100,
    duration: 20,
    delay: 2,
    color: "text-primary",
  },
  {
    Icon: Database,
    size: 26,
    initialX: -140,
    initialY: 120,
    duration: 17,
    delay: 3,
    color: "text-primary",
  },
  {
    Icon: GitBranch,
    size: 20,
    initialX: 80,
    initialY: -180,
    duration: 19,
    delay: 0.5,
    color: "text-primary",
  },
  {
    Icon: Braces,
    size: 24,
    initialX: -180,
    initialY: 40,
    duration: 16,
    delay: 1.5,
    color: "text-primary",
  },
  {
    Icon: Binary,
    size: 22,
    initialX: -60,
    initialY: -150,
    duration: 22,
    delay: 4,
    color: "text-primary",
  },
  {
    Icon: Layers,
    size: 24,
    initialX: 160,
    initialY: -30,
    duration: 21,
    delay: 2.5,
    color: "text-primary",
  },
  {
    Icon: Blocks,
    size: 22,
    initialX: -180,
    initialY: -80,
    duration: 19,
    delay: 1.2,
    color: "text-primary",
  },
  {
    Icon: GitPullRequest,
    size: 20,
    initialX: 60,
    initialY: 180,
    duration: 23,
    delay: 3.5,
    color: "text-primary",
  },
  {
    Icon: Cloud,
    size: 26,
    initialX: -120,
    initialY: -180,
    duration: 25,
    delay: 0.8,
    color: "text-primary",
  },
  {
    Icon: Monitor,
    size: 24,
    initialX: 200,
    initialY: 80,
    duration: 18,
    delay: 2.2,
    color: "text-primary",
  },
  {
    Icon: Smartphone,
    size: 20,
    initialX: -220,
    initialY: 60,
    duration: 20,
    delay: 4.5,
    color: "text-primary",
  },
  {
    Icon: Webhook,
    size: 22,
    initialX: 120,
    initialY: 200,
    duration: 22,
    delay: 1.8,
    color: "text-primary",
  },
  {
    Icon: Workflow,
    size: 24,
    initialX: -60,
    initialY: 220,
    duration: 19,
    delay: 5,
    color: "text-primary",
  },
  {
    Icon: Search,
    size: 18,
    initialX: 220,
    initialY: -100,
    duration: 16,
    delay: 3,
    color: "text-primary",
  },
  {
    Icon: Settings,
    size: 20,
    initialX: -240,
    initialY: -120,
    duration: 24,
    delay: 0.5,
    color: "text-primary",
  },
];

import { Typewriter } from "@/components/Typewriter";

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-88px)] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="container max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 py-12 lg:py-24">
        {/* Left Side: Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="lg:w-1/2 space-y-10 text-center lg:text-left"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-black uppercase tracking-[0.2em] animate-in fade-in slide-in-from-top-4 duration-1000">
              <Computer size={14} />
              Unified Developer Ecosystem
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] text-transparent bg-clip-text bg-gradient-to-br from-foreground via-foreground to-foreground/40 pb-4">
              Design. Build.
              <br />
              <span className="text-primary italic">Showcase.</span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              <span className="font-bold">DevAll</span> is a purpose-built,
              unified workspace designed for modern engineers. Manage your
              technical portfolio, track achievements, and display your
              professional journey in a single, premium dashboard.
            </p>
          </div>

          <div className="flex flex-row items-center gap-6 justify-center lg:justify-start">
            <Link href="/signup">
              <Button className="h-16 px-6 text-lg font-bold rounded-full gap-2 hover:scale-102 active:scale-95 transition-all">
                Launch My Dashboard <ArrowRight size={20} />
              </Button>
            </Link>
            <Link href="/about">
              <Button
                variant="outline"
                className="h-16 px-6 text-lg font-bold rounded-full gap-2 hover:scale-102 active:scale-95 transition-all"
              >
                About Us
                <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Right Side: Typewriter Effect in Terminal Shell */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          className="lg:w-1/2 w-full relative group"
        >
          <div className="relative glass-card border border-primary/20 rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
            {/* Terminal Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-black/50 border-b border-primary/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="text-[10px] uppercase tracking-widest text-foreground font-bold ml-2 opacity-50">
                dev-all-shell — zsh — 80x24
              </div>
            </div>

            {/* Terminal Content */}
            <div className="p-8 sm:p-12 min-h-[300px] flex items-center justify-center bg-black/80">
              <div className="w-full">
                <div className="text-terminal font-mono text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                  <span className="opacity-50 mr-3 select-none">$</span>
                  <Typewriter
                    texts={[
                      "Welcome to DevAll!",
                      "Showcase your professional legacy.",
                      "Build your developer identity.",
                    ]}
                    className="inline"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Abstract geometric background behind terminal */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 via-transparent to-primary/5 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000 -z-10 rounded-[3rem]" />
        </motion.div>
      </div>

      {/* Decorative Blur Orbs for extra depth */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}
