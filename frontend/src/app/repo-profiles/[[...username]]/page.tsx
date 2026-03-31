"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks";
import { RepoService } from "@/services/repoProfile";
import {
  Github,
  Database,
  FolderKanban,
  MousePointer2,
  Loader2,
} from "lucide-react";
import { Button, LoadingState, SignInRequiredState } from "@/components";
import { cn } from "@/lib/utils";
import { GithubView } from "./GithubView";
import { HuggingFaceView } from "./HuggingFaceView";
import { UserNotFoundState } from "@/components/UserNotFound";

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

  if (authLoading)
    return <LoadingState message="Gathering Repositories and Deployments..." />;
  if (!effectiveUsername && !authLoading) return <SignInRequiredState />;
  if (!profiles && !profilesLoading)
    return <UserNotFoundState username={effectiveUsername!} />;

  const githubProfile = profiles?.github;
  const hfProfile = profiles?.hugging_face;

  const platforms = [
    {
      id: "github",
      label: "GitHub",
      active: activePlatform === "github",
      available: !!githubProfile,
      icon: Github,
    },
    {
      id: "hugging_face",
      label: "Hugging Face",
      logo: "/huggingface.png",
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
            <FolderKanban size={32} strokeWidth={2.5} />
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
              {p.icon ? (
                <p.icon
                  size={18}
                  className={cn(
                    "transition-transform duration-500",
                    p.active ? "scale-110" : "group-hover:scale-110"
                  )}
                />
              ) : (
                <img src={p.logo} alt={p.label} width={20} height={20} />
              )}
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
