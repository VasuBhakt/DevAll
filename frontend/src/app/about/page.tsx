"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Code2,
  Cpu,
  Database,
  Globe,
  Github,
  Rocket,
  Shield,
  Zap,
  Layout,
  Terminal as TerminalIcon,
  Search,
  Sparkles,
  ArrowRight,
  User,
  ExternalLink,
  Code,
  Box,
  Layers,
  Link2,
  Linkedin,
  Instagram,
} from "lucide-react";
import Link from "next/link";
import { Typewriter } from "@/components/Typewriter";

export default function About() {
  return (
    <div className="relative min-h-[calc(100vh-88px)] overflow-hidden">
      {/* Hero Section */}
      <section className="container max-w-7xl mx-auto pt-10 pb-12 lg:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:w-1/2 space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">
              <Sparkles size={14} />
              About DevAll
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] text-transparent bg-clip-text bg-gradient-to-br from-foreground via-foreground to-foreground/40 pb-4 italic">
              Empowering. <br />
              Digital. <br />
              <span className="text-primary italic">Craftsmanship.</span>
            </h1>

            <p className="text-muted-foreground text-lg sm:text-xl max-w-xl leading-relaxed italic">
              DevAll is a unified workspace for the modern engineer. We believe
              a developer's journey is a masterpiece that deserves a gallery as
              premium as the craft itself.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/signup">
                <Button className="h-14 px-8 text-lg font-bold rounded-full gap-2 hover:scale-105 active:scale-95 transition-all">
                  Join the Mission <ArrowRight size={20} />
                </Button>
              </Link>
              <Link
                href={`${process.env.NEXT_PUBLIC_DEV_GITHUB}/DevAll`}
                target="_blank"
              >
                <Button
                  variant="outline"
                  className="h-14 px-8 text-lg font-bold rounded-full gap-2 hover:scale-105 active:scale-95 transition-all"
                >
                  <Github size={20} /> Repository
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "backOut", delay: 0.2 }}
            className="lg:w-1/2 relative p-8 glass-card border border-primary/20 rounded-[3rem] shadow-2xl shadow-primary/10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />

            <div className="relative space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-xl">
                  <Rocket size={24} />
                </div>
                <div>
                  <h3 className="font-black text-xl italic tracking-tight">
                    The Vision
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest leading-none">
                    Code. Create. Connect.
                  </p>
                </div>
              </div>

              <div className="text-foreground/80 leading-relaxed font-mono text-sm sm:text-base border-l-2 border-primary/30 pl-4 py-2 italic">
                &quot;I realized that while we spend thousands of hours building
                endlessly (and saving the world), our own professional
                identities were scattered across disjointed platforms. DevAll
                was born from a desire to unify that story.&quot;
                <div className="mt-4 text-sm font-bold  tracking-[0.2em] text-primary flex items-center gap-2">
                  VasuBhakt — Creator of DevAll
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-24 relative">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Layout,
                title: "Unified Interface",
                desc: "Your GitHub projects, coding profiles, and professional experiences — all in one dashboard.",
              },
              {
                icon: Link2,
                title: "Public Accessibility",
                desc: "Showcase your technical identity with a unique, shareable profile link.",
              },
              {
                icon: User,
                title: "Identity First",
                desc: "A personal brand that scales with you from your first commit to your final architect role.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 sm:p-10 glass-card border border-primary/10 rounded-3xl space-y-4 hover:border-primary/30 transition-all group scale-100 hover:scale-[1.02]"
              >
                <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg border border-primary/10">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-2xl font-black italic tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed italic">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Developer Section */}
      <section className="container max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2 relative">
            <div className="relative z-10 p-1 rounded-[2.5rem] bg-gradient-to-tr from-primary via-primary/50 to-transparent">
              <div className="p-8 sm:p-12 bg-black/90 rounded-[2.3rem] space-y-8 overflow-hidden">
                <div className="space-y-4">
                  <h2 className="text-4xl font-mono font-black tracking-tight text-[#22eb5e]">
                    Terminal Origins.
                  </h2>
                  <div className="text-[#22eb5e] font-mono text-lg space-y-2">
                    <p className="flex items-start gap-3">
                      <span className="opacity-50 select-none">$</span>
                      <span>whoami</span>
                    </p>
                    <p className="flex items-start gap-3 text-[#22eb5e] pl-6 border-l-2 border-[#22eb5e]/20 py-2">
                      <span className="flex flex-col">
                        <span className="py-1">
                          Swastik Bose, a.k.a VasuBhakt
                        </span>
                        <span className="py-1">
                          Full Stack Architect & Tech Enthusiast.{" "}
                        </span>
                        <span className="py-1">
                          Dedicated to architecting refined solutions for an
                          elevated engineering experience.
                        </span>
                      </span>
                    </p>
                    <p className="flex items-start gap-3 mt-4">
                      <span className="opacity-50 select-none">$</span>
                      <span>fetch details</span>
                    </p>
                    <p className="flex items-start gap-3 text-[#22eb5e] pl-6 border-l-2 border-[#22eb5e]/20 py-2">
                      <span className="flex flex-col">
                        <span className="py-1">
                          {process.env.NEXT_PUBLIC_DEV_EMAIL}
                        </span>
                        <span className="py-1">Jadavpur University</span>
                        <span className="py-1">Kolkata, India</span>
                      </span>
                    </p>
                    <p className="flex items-start gap-3 mt-4">
                      <span className="opacity-50 select-none">$</span>
                      <span>fetch architecture</span>
                    </p>
                    <div className="pl-6 pt-2 grid grid-cols-2 gap-4">
                      <div className="bg-[#22eb5e]/5 border border-[#22eb5e]/20 p-3 rounded-xl">
                        <div className="text-[10px] text-[#22eb5e]/60 font-bold tracking-widest uppercase">
                          Front:
                        </div>
                        <div className="text-xs font-bold text-[#22eb5e]">
                          Next.js + Tailwind
                        </div>
                      </div>
                      <div className="bg-terminal/5 border border-terminal/20 p-3 rounded-xl">
                        <div className="text-[10px] text-[#22eb5e]/60 font-bold tracking-widest uppercase">
                          Back:
                        </div>
                        <div className="text-xs font-bold text-[#22eb5e]">
                          FastAPI + Python
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 space-y-8">
            <h2 className="text-5xl font-black tracking-tight leading-none">
              Meet the <br />
              <span className="text-primary italic">Developer.</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed italic">
              Hello! I'm Swastik Bose, a.k.a VasuBhakt, a developer passionate
              about building clean, performant software applications. I love
              exploring new technologies and transforming them into functional
              projects. (And about Maadhava, he is my guiding light!) Radhe
              Radhe!
            </p>
            <div className="flex gap-4">
              <Link
                href={`${process.env.NEXT_PUBLIC_DEV_GITHUB}`}
                target="_blank"
              >
                <Button
                  variant="outline"
                  className="rounded-full gap-2 h-12 font-bold px-6"
                >
                  <Github size={18} /> Github
                </Button>
              </Link>
              <Link
                href={process.env.NEXT_PUBLIC_DEV_LINKEDIN || ""}
                target="_blank"
              >
                <Button className="rounded-full bg-blue-500 gap-2 h-12 font-bold px-6">
                  <Linkedin size={18} /> LinkedIn
                </Button>
              </Link>
              <Link
                href={process.env.NEXT_PUBLIC_DEV_INSTAGRAM || ""}
                target="_blank"
              >
                <Button className="rounded-full bg-pink-700 gap-2 h-12 font-bold px-6">
                  <Instagram size={18} /> Instagram
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="py-12 bg-transparent flexitems-center justify-center ">
        <div className="text-primary/70 flex flex-col font-mono tracking-widest flex items-center">
          <span>
            Want to report a bug or raise a feature request? Raise an issue on
            the Github Repo!
          </span>
          <span>OR</span>
          <span>
            Need help? Drop a mail at {process.env.NEXT_PUBLIC_DEV_EMAIL} or
            catch me on my socials!
          </span>
        </div>
      </div>

      {/* Typewriter Footer */}
      <div className="py-12 bg-transparent flex items-center justify-center italic">
        <div className="text-primary/70 font-mono text-sm tracking-widest flex items-center gap-2">
          <Typewriter
            texts={["Always building.", "Always crafting.", "Always DevAll."]}
            typingSpeed={150}
            deletingSpeed={100}
            pauseDuration={1000}
            className="inline"
          />
        </div>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
    </div>
  );
}
