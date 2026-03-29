"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks";
import { RepoService } from "@/services/repoProfile";
import { GithubProfile } from "@/services/repoProfile/profiles/github";
import { HuggingFaceProfile } from "@/services/repoProfile/profiles/huggingFace";
import { Github, Database, Code2, MousePointer2, Loader2 } from "lucide-react";
import { Button, Badge } from "@/components";
import { cn } from "@/lib/utils";
import { GithubView } from "./GithubView";
import { HuggingFaceView } from "./HuggingFaceView";

interface PageProps {
  params: Promise<{ username?: string[] }>;
}

type Platform = "github" | "hugging_face";

export default function RepoProfilesPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const targetUsername = resolvedParams.username?.[0]?.toLowerCase();
  const { user, isSignedIn, isLoading: authLoading } = useAuth();
  const [activePlatform, setActivePlatform] = useState<Platform>("github");

  const isOwner =
    !targetUsername || (isSignedIn && user?.username === targetUsername);
  const effectiveUsername = targetUsername || user?.username;

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ["repo-profiles", effectiveUsername],
    queryFn: () => {
      if (!effectiveUsername) return Promise.resolve(null);
      return RepoService.getUserRepoProfiles(effectiveUsername);
    },
    enabled: !!effectiveUsername,
  });

  if (authLoading) return <LoadingState />;
  if (!effectiveUsername && !authLoading) return <SignInRequiredState />;

  const githubProfile = profiles?.github;
  const hfProfile = profiles?.hugging_face;

  const platforms = [
    {
      id: "github",
      label: "GitHub",
      icon: Github,
      active: activePlatform === "github",
      available: !!githubProfile,
    },
    {
      id: "hugging_face",
      label: "Hugging Face",
      icon: Database,
      active: activePlatform === "hugging_face",
      available: !!hfProfile,
    },
  ];

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-12">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm backdrop-blur-sm">
            <Code2 size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
              {isOwner ? "My" : `${effectiveUsername}'s`} Repo Hub
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground text-lg">
          {isOwner
            ? "Showcase technical mastery through your code repositories and deployments."
            : `Explore the technical architecture and contributions of ${effectiveUsername}.`}
        </p>
      </div>

      {/* Platform Tabs & Content Panel */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3 p-2 bg-secondary/15 rounded-[1.5rem] w-fit border border-border/40 backdrop-blur-sm">
          {platforms.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePlatform(p.id as Platform)}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold tracking-widest transition-all duration-500 relative overflow-hidden",
                p.active
                  ? "bg-background text-primary border border-border/60 scale-[1.02] translate-y-[-2px]"
                  : "text-muted-foreground/60 hover:text-foreground hover:bg-background/20"
              )}
            >
              <p.icon
                size={18}
                className={cn(
                  "transition-transform duration-500",
                  p.active ? "scale-110" : "group-hover:scale-110"
                )}
              />
              {p.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="relative min-h-[600px] w-full">
          {profilesLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[500px] border-2 border-dashed border-border/40 rounded-[3rem] bg-secondary/5 space-y-4">
              <div className="relative">
                <Loader2 size={48} className="animate-spin text-primary/40" />
                <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse rounded-full" />
              </div>
              <span className="text-xs font-black text-muted-foreground/40 tracking-[0.4em]">
                Getting Repo Profiles...
              </span>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
              {activePlatform === "github" ? (
                <GithubView
                  profile={githubProfile || undefined}
                  isOwner={isOwner}
                  username={effectiveUsername!}
                />
              ) : (
                <HuggingFaceView
                  profile={hfProfile || undefined}
                  isOwner={isOwner}
                  username={effectiveUsername!}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 size={48} className="animate-spin text-primary" />
      <span className="text-lg font-semibold text-muted-foreground animate-pulse tracking-wide">
        Loading Repos Portfolio...
      </span>
    </div>
  );
}

function SignInRequiredState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-6">
      <div className="p-6 rounded-full bg-primary/10 text-primary border border-primary/20">
        <MousePointer2 size={48} />
      </div>
      <div className="space-y-3 max-w-md">
        <h2 className="text-3xl font-bold tracking-tight uppercase">
          Access Restricted
        </h2>
        <p className="text-muted-foreground text-lg">
          Forge your profile first. Sign in to showcase your code and models to
          the world.
        </p>
      </div>
      <Button
        className="rounded-full px-10 h-12 text-lg font-bold hover:scale-105 transition-transform"
        onClick={() => (window.location.href = "/signin")}
      >
        Go to Sign In
      </Button>
    </div>
  );
}
