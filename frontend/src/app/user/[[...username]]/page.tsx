"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks";
import publicService from "@/services/public/service";
import {
  Award,
  Code2,
  Database,
  Github,
  Globe,
  LayoutDashboard,
  Loader2,
  Mail,
  MapPin,
  MousePointer2,
  Plus,
  RefreshCw,
  Star,
  TrendingUp,
  User as UserIcon,
  Briefcase,
  Layers,
  Trophy,
  ChevronRight,
  Instagram,
  Linkedin,
  X,
  Twitter,
  Bot,
  Youtube,
  Twitch,
  Gamepad2,
  User,
  FolderKanban,
  Calendar,
  ExternalLink,
  Building2,
  Lightbulb,
  Link2,
  UserMinus,
  Sparkles,
  Construction,
} from "lucide-react";
import { Button, Badge, MarkdownRenderer, LoadingState } from "@/components";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";
import PublicProjectSection from "./PublicProjectSection";
import PublicExperienceSection from "./PublicExperienceSection";
import PublicAchievementSection from "./PublicAchievementSection";
import CPQuickCard from "./CPQuickCard";
import RepoQuickCard from "./RepoQuickCard";
import { SignInRequiredState } from "@/components";
import { UserNotFoundState } from "@/components/UserNotFound";

interface PageProps {
  params: Promise<{ username?: string[] }>;
}

export default function UserDashboard({ params }: PageProps) {
  const resolvedParams = use(params);
  const [activeTab, setActiveTab] = useState("profile");
  const targetUsername = resolvedParams.username?.[0]?.toLowerCase();
  const { user, isSignedIn, isLoading: authLoading } = useAuth();

  const isOwner =
    !targetUsername || (isSignedIn && user?.username === targetUsername);
  const effectiveUsername = targetUsername || user?.username;

  const {
    data: profileResponse,
    isLoading: profileLoading,
    isError: isProfileError,
  } = useQuery({
    queryKey: ["public-profile", effectiveUsername],
    queryFn: () => {
      if (!effectiveUsername) return Promise.resolve(null);
      return publicService.getPublicProfile(effectiveUsername);
    },
    enabled: !!effectiveUsername,
    retry: false, // Don't retry on 404
  });

  const profileData = profileResponse;

  if (authLoading || (profileLoading && !!effectiveUsername)) {
    return <LoadingState message="Synthesizing User Profile..." />;
  }

  if (!effectiveUsername && !authLoading) {
    return <SignInRequiredState />;
  }

  // API explicitly failed (User not in database)
  if (isProfileError || (!profileLoading && !profileData)) {
    return <UserNotFoundState username={effectiveUsername!} />;
  }

  const {
    profile,
    cp_profiles = [],
    repo_profiles = [],
    projects = [],
    experiences = [],
    achievements = [],
  } = profileData || {};

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-12 animate-in fade-in duration-700">
      {/* 1. Profile Header Section */}
      <section className="relative p-8 md:p-12 rounded-[3.5rem] bg-card/30 backdrop-blur-xl border border-border/40 shadow-2xl overflow-hidden group">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-12 relative z-10">
          {/* Avatar Area */}
          <div className="relative shrink-0">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center border border-primary/20 backdrop-blur-sm group-hover:scale-105 transition-transform duration-500 shadow-xl overflow-hidden">
              {profile?.profile_picture ? (
                <img
                  src={profile.profile_picture}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-6xl font-black text-primary/60">
                  {profile?.name?.[0] || effectiveUsername?.[0].toUpperCase()}
                </span>
              )}
            </div>
            <Badge className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-6 py-3 bg-background border border-border/60 text-foreground font-semibold tracking-wider text-[16px]">
              @{effectiveUsername}
            </Badge>
          </div>

          {/* Info Area */}
          <div className="flex-1 space-y-6 text-center md:text-left pt-2">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <h1 className="text-5xl font-semibold text-foreground">
                  {profile?.name || `@${effectiveUsername}`}
                </h1>
                {isOwner && (
                  <Link href="/profile">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full h-8 px-4 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all text-[14px] font-black tracking-widest gap-2"
                    >
                      Edit Profile
                    </Button>
                  </Link>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-muted-foreground font-medium">
                {profileData?.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={18} className="text-primary/60" />
                    <span>{profileData?.email}</span>
                  </div>
                )}
                {profile?.city && (
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-primary/60" />
                    <span>
                      {profile.city}, {profile.country}
                    </span>
                  </div>
                )}
                {profile?.portfolio_website && (
                  <a
                    href={profile.portfolio_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-primary transition-colors text-sm"
                  >
                    <Globe size={16} className="text-primary/60" />
                    <span>Website</span>
                  </a>
                )}
              </div>
            </div>

            <div className="max-w-2xl">
              <p
                className={cn(
                  "text-foreground/40 text-lg leading-relaxed italic font-medium",
                  profile?.bio && "text-foreground"
                )}
              >
                {profile?.bio ||
                  "This user is on a stealth journey through the techverse."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {profile?.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-blue-500/30 hover:border-blue-500/70 rounded-full p-2 transition-colors"
                >
                  <Linkedin size={20} className="text-blue-500" />
                </a>
              )}
              {profile?.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-primary/30 hover:border-primary/70 rounded-full p-2 transition-colors"
                >
                  <Github size={20} className="text-primary" />
                </a>
              )}
              {profile?.instagram && (
                <a
                  href={profile.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-pink-700/30 hover:border-pink-700/70 rounded-full p-2 transition-colors"
                >
                  <Instagram size={20} className="text-pink-700" />
                </a>
              )}
              {profile?.xtwitter && (
                <a
                  href={profile.xtwitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-blue-400/30 hover:border-blue-400/70 rounded-full p-2 transition-colors"
                >
                  <Twitter size={20} className="text-blue-400" />
                </a>
              )}
              {profile?.reddit && (
                <a
                  href={profile.reddit}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-orange-500/30 hover:border-orange-500/70 rounded-full p-2 transition-colors"
                >
                  <Bot size={20} className="text-orange-500" />
                </a>
              )}
              {profile?.youtube && (
                <a
                  href={profile.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-red-500/30 hover:border-red-500/70 rounded-full p-2 transition-colors"
                >
                  <Youtube size={20} className="text-red-500" />
                </a>
              )}
              {profile?.twitch && (
                <a
                  href={profile.twitch}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-purple-500/30 hover:border-purple-500/70 rounded-full p-2 transition-colors"
                >
                  <Twitch size={20} className="text-purple-500" />
                </a>
              )}
              {profile?.discord && (
                <a
                  href={profile.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-blue-500/30 hover:border-blue-500/70 rounded-full p-2 transition-colors"
                >
                  <Gamepad2 size={20} className="text-blue-500" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tabbed Navigation */}
      <div className="flex flex-col space-y-10 pt-4">
        <div className="flex items-center justify-center px-3">
          <div className="flex bg-card/40 border border-border/40 p-1.5 gap-3 rounded-2xl">
            {[
              { id: "profile", label: "Profile", icon: User },
              { id: "projects", label: "Projects", icon: Code2 },
              { id: "career", label: "Career", icon: Briefcase },
              { id: "cp", label: "Competitve Programming", icon: Award },
              { id: "repos", label: "Repositories", icon: FolderKanban },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2.5 px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground scale-102"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                )}
              >
                <tab.icon size={18} />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Panels */}
        <div className="min-h-[500px]">
          {activeTab === "profile" &&
            (profile?.readme && !isOwner ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <SectionContainer
                  title="About Me"
                  icon={User}
                  hideEmptyPlaceholder
                  username={effectiveUsername}
                >
                  <div className="p-10 rounded-[3rem] bg-card/30 backdrop-blur-md border border-border/40">
                    {profile?.readme && (
                      <MarkdownRenderer
                        content={profile.readme}
                        className="max-h-[800px] overflow-y-auto custom-scrollbar"
                      />
                    )}
                  </div>
                </SectionContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
                <Layers size={64} strokeWidth={1} />
                <p className="text-xl font-bold">
                  System documentation pending initialization.
                </p>
                <p className="text-md font-bold">
                  This user has not added their readme yet.
                </p>
              </div>
            ))}

          {activeTab === "projects" &&
            (projects.length === 0 && !isOwner ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
                <Layers size={64} strokeWidth={1} />
                <p className="text-xl font-bold">
                  System documentation pending initialization.
                </p>
                <p className="text-md font-bold">
                  This user has not added any projects yet.
                </p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <SectionContainer
                  title="Projects"
                  icon={Code2}
                  isEmpty={projects.length === 0}
                  isOwner={isOwner}
                  addHref={`/projects/${effectiveUsername}`}
                  subValue="Top 3"
                  username={effectiveUsername}
                >
                  <PublicProjectSection projects={projects} />
                </SectionContainer>
              </div>
            ))}

          {activeTab === "career" &&
            (experiences.length === 0 &&
            achievements.length === 0 &&
            !isOwner ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
                <Layers size={64} strokeWidth={1} />
                <p className="text-xl font-bold">
                  System documentation pending initialization.
                </p>
                <p className="text-md font-bold">
                  This user has not added any experience or achievements yet.
                </p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 grid grid-cols-1 lg:grid-cols-2 gap-12">
                <SectionContainer
                  title="Experience"
                  icon={Briefcase}
                  isEmpty={experiences.length === 0}
                  isOwner={isOwner}
                  addHref={`/experiences/${effectiveUsername}`}
                  subValue="Most Recent"
                  username={effectiveUsername}
                >
                  <PublicExperienceSection experiences={experiences} />
                </SectionContainer>

                <SectionContainer
                  title="Achievements"
                  icon={Trophy}
                  isEmpty={achievements.length === 0}
                  isOwner={isOwner}
                  addHref={`/achievements/${effectiveUsername}`}
                  subValue="Top 3"
                  username={effectiveUsername}
                >
                  <PublicAchievementSection achievements={achievements} />
                </SectionContainer>
              </div>
            ))}

          {activeTab === "cp" &&
            (cp_profiles.length === 0 && !isOwner ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
                <Layers size={64} strokeWidth={1} />
                <p className="text-xl font-bold">
                  System documentation pending initialization.
                </p>
                <p className="text-md font-bold">
                  This user has not synced any programming profiles yet.
                </p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <SectionContainer
                  title="Competitive Programming"
                  icon={Award}
                  isEmpty={cp_profiles.length === 0}
                  isOwner={isOwner}
                  addHref={`/cp-profiles/${effectiveUsername}`}
                  username={effectiveUsername}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {cp_profiles.map((p, i) => (
                      <CPQuickCard key={i} profile={p} />
                    ))}
                  </div>
                </SectionContainer>
              </div>
            ))}

          {activeTab === "repos" &&
            (repo_profiles.length === 0 && !isOwner ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
                <Layers size={64} strokeWidth={1} />
                <p className="text-xl font-bold">
                  System documentation pending initialization.
                </p>
                <p className="text-md font-bold">
                  This user has not synced any repositories yet.
                </p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <SectionContainer
                  title="Repositories"
                  icon={FolderKanban}
                  isEmpty={repo_profiles.length === 0}
                  isOwner={isOwner}
                  addHref={`/repo-profiles/${effectiveUsername}`}
                  username={effectiveUsername}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {repo_profiles.map((p, i) => (
                      <RepoQuickCard key={i} profile={p} />
                    ))}
                  </div>
                </SectionContainer>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function SectionContainer({
  title,
  icon: Icon,
  children,
  isEmpty,
  isOwner,
  addHref,
  hideEmptyPlaceholder,
  subValue,
  username,
}: {
  title: string;
  icon: any;
  children: any;
  isEmpty?: boolean;
  isOwner?: boolean;
  addHref?: string;
  hideEmptyPlaceholder?: boolean;
  subValue?: string;
  username?: string;
}) {
  if (isEmpty && !isOwner) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Icon size={20} />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-bold tracking-tight uppercase text-foreground/80">
              {title}
            </h3>
            <span className="text-muted-foreground text-sm">{subValue}</span>
          </div>
          {addHref && (
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Link href={addHref} target="_blank" rel="noopener noreferrer">
                <div className="flex flex-wrap gap-2">
                  <ExternalLink size={20} />
                  <span>
                    {`${username}'s`} {`${title}`} Page
                  </span>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>

      {isEmpty
        ? !hideEmptyPlaceholder && (
            <div className="p-12 rounded-[2.5rem] border-2 border-dashed border-border/40 flex flex-col items-center justify-center text-center space-y-4 bg-secondary/5 group">
              <div className="p-4 rounded-full bg-secondary/20 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500">
                <Icon size={48} strokeWidth={1} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                  Nothing here yet
                </p>
                {isOwner && (
                  <p className="text-xs text-muted-foreground/60">
                    Go to {`your ${title} Page`} to add content.
                  </p>
                )}
              </div>
            </div>
          )
        : children}
    </div>
  );
}
