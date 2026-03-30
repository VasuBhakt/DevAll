import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Database,
  FolderHeart,
  Layout,
  Box,
  ExternalLink,
  Users,
  RefreshCw,
  Loader2,
  Check,
  X,
  Trash2,
  BookOpenIcon,
  Vote,
  Code2,
  ArrowBigUp,
  FolderCode,
  Building2,
} from "lucide-react";
import { Badge, Button, Input } from "@/components";
import { cn } from "@/lib/utils";
import {
  HuggingFaceDataset,
  HuggingFaceModel,
  HuggingFaceProfile,
  HuggingFaceSpace,
} from "@/services/repoProfile/profiles/huggingFace";
import { RepoService } from "@/services/repoProfile";

interface HuggingFaceViewProps {
  profile?: HuggingFaceProfile;
  isOwner: boolean;
  username: string;
}

const colorVariants: Record<
  string,
  { text: string; bg: string; border: string; hover: string; lightText: string }
> = {
  emerald: {
    text: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    hover: "hover:border-emerald-500/40",
    lightText: "text-emerald-600",
  },
  amber: {
    text: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    hover: "hover:border-amber-500/40",
    lightText: "text-amber-600",
  },
  blue: {
    text: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    hover: "hover:border-blue-500/40",
    lightText: "text-blue-600",
  },
};

export function HuggingFaceView({
  profile,
  isOwner,
  username,
}: HuggingFaceViewProps) {
  const [newHandle, setNewHandle] = useState("");
  const [showSyncInput, setShowSyncInput] = useState(false);
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: (handle: string) =>
      RepoService.fetchRepoProfile(handle, "hugging_face"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repo-profiles", username] });
      alert("Hugging Face Profile synchronized successfully!");
      setShowSyncInput(false);
      setNewHandle("");
    },
    onError: (error: any) => {
      alert(error.message || "Failed to synchronize profile");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => RepoService.deleteRepoProfile("hugging_face"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repo-profiles", username] });
      alert("Hugging Face Profile deleted successfully!");
    },
    onError: (error: any) => {
      alert(error.message || "Failed to delete profile");
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const handleSync = () => {
    const handleToSync = newHandle.trim() || profile?.handle;
    if (!handleToSync) {
      alert("Please provide a handle to sync.");
      return;
    }
    syncMutation.mutate(handleToSync);
  };

  if (!profile && !showSyncInput)
    return (
      <EmptyPlatformState
        platform="Hugging Face"
        isOwner={isOwner}
        username={username}
        onSyncClick={() => setShowSyncInput(true)}
      />
    );

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      {/* Profile Overview Card */}
      <div className="relative p-8 md:p-12 rounded-[2.5rem] bg-card/40 backdrop-blur-xl border border-border/60 shadow-2xl overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none">
          <span className="text-[150px] drop-shadow-2xl">🤗</span>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-12 relative z-10">
          <div className="relative shrink-0">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center border border-primary/20 backdrop-blur-sm group-hover:scale-105 transition-transform duration-500">
              {profile?.avatar ? (
                <img
                  src={profile?.avatar || ""}
                  alt={profile?.handle?.at(0)?.toUpperCase()}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-6xl opacity-30">🤗</span>
              )}
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <Badge className="bg-background/90 text-primary border-primary/20 px-5 py-3 text-[12px] font-semibold tracking-widest backdrop-blur-md">
                @{profile?.handle || "no-handle"}
              </Badge>
            </div>
          </div>

          <div className="flex-1 space-y-8 text-center md:text-left pt-2">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-4xl font-semibold tracking-tight text-foreground">
                    Hugging Face
                  </h2>
                  <a
                    href={profile?.profile_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-secondary/80 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-border/40 shadow-sm"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>

                {isOwner && (
                  <div className="flex items-center gap-2">
                    {showSyncInput ? (
                      <div className="flex items-center gap-2 animate-in slide-in-from-left-4 duration-300">
                        <Input
                          placeholder="Leave blank to sync current handle"
                          value={newHandle}
                          onChange={(e) => setNewHandle(e.target.value)}
                          className="h-10 w-52 bg-background/50 border-primary/20 rounded-xl text-sm tracking-tight placeholder:text-foreground/30"
                        />
                        <Button
                          size="sm"
                          onClick={handleSync}
                          disabled={syncMutation.isPending}
                          className="rounded-xl h-10 px-4 bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform font-black"
                        >
                          {syncMutation.isPending ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Check size={16} />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSyncInput(false)}
                          className="rounded-xl h-10 w-10 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSyncInput(true)}
                        className="rounded-xl h-10 px-4 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all font-black uppercase text-[10px] tracking-widest gap-2"
                      >
                        <RefreshCw size={14} />
                        Re-Sync
                      </Button>
                    )}
                    {profile && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="rounded-xl h-10 px-4 border-destructive/20 hover:bg-destructive/5 hover:text-destructive transition-all font-black uppercase text-[10px] tracking-widest gap-2"
                      >
                        <Trash2 size={14} />
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {profile && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-10 pt-2">
                  <StatItem
                    icon={FolderHeart}
                    label="Community Likes"
                    value={profile.likes_count}
                  />
                  <StatItem
                    icon={Users}
                    label="Network Followers"
                    value={profile.followers_count}
                  />
                  <StatItem
                    icon={FolderCode}
                    label="Total Repositories"
                    value={profile.public_repo_count}
                  />
                  <StatItem
                    icon={BookOpenIcon}
                    label="Papers"
                    value={profile.papers_count}
                  />
                </div>
              )}
            </div>
            {profile && (
              <div className="flex flex-col gap-2">
                {profile.organizations && (
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/5 text-primary/60 group-hover/stat:text-primary transition-colors">
                      <Building2 size={16} />
                    </div>
                    <span className="text-[16px] font-black text-foreground tracking-widest">
                      Organizations
                    </span>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-x-1.5">
                  {profile.organizations?.slice(0, 4).map((domain, index) => (
                    <div key={domain} className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-muted-foreground/80 uppercase tracking-tight">
                        {domain}
                      </span>
                      {/* Render dot only if it's not the last item */}
                      {profile.organizations?.length &&
                        index < profile.organizations.length - 1 &&
                        index < 3 && (
                          <span className="text-[10px] text-muted-foreground/40">
                            •
                          </span>
                        )}
                    </div>
                  ))}
                  {profile.organizations.length > 4 && (
                    <span className="text-[11px] font-medium text-muted-foreground/80 tracking-tight">
                      + more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {profile && (
        <div className="space-y-20">
          {/* Models Section */}
          <HFSection
            title="Models"
            icon={Box}
            items={profile.models}
            category="model"
            color={colorVariants.emerald}
          />

          {/* Datasets Section */}
          <HFSection
            title="Datasets"
            icon={Database}
            items={profile.datasets}
            category="dataset"
            color={colorVariants.amber}
          />

          {/* Spaces Section */}
          <HFSection
            title="Spaces"
            icon={Layout}
            items={profile.spaces}
            category="space"
            color={colorVariants.blue}
          />
        </div>
      )}
    </div>
  );
}

function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col items-center md:items-start gap-1 group/stat transition-all">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-primary/5 text-primary/60 group-hover/stat:text-primary transition-colors">
          <Icon size={16} />
        </div>
        <span className="text-2xl font-semibold tabular-nums">
          {value.toLocaleString()}
        </span>
      </div>
      <span className="text-[12px] font-black text-foreground tracking-widest">
        {label}
      </span>
    </div>
  );
}

function HFSection({
  title,
  icon: Icon,
  items,
  category,
  color,
}: {
  title: string;
  icon: any;
  items: HuggingFaceModel[] | HuggingFaceDataset[] | HuggingFaceSpace[];
  category: string;
  color: (typeof colorVariants)[keyof typeof colorVariants];
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <h3
          className={cn(
            "text-2xl font-semibold flex items-center gap-4",
            color.text
          )}
        >
          <Icon size={28} strokeWidth={2.5} />
          {title}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {items.slice(0, 4).map((item, i) => (
          <HFCard key={i} item={item} category={category} color={color} />
        ))}
      </div>
    </div>
  );
}

function HFCard({
  item,
  category,
  color,
}: {
  item: any;
  category: string;
  color: (typeof colorVariants)[keyof typeof colorVariants];
}) {
  return (
    <div
      className={cn(
        "group/hf p-8 min-h-[250px] rounded-[3rem] bg-card/30 backdrop-blur-md border border-border/40 hover:shadow-2xl transition-all flex flex-col justify-between relative overflow-hidden",
        color.border
      )}
    >
      <div className="space-y-5 relative z-10">
        <div className="flex items-start justify-between gap-4">
          <h4 className="font-extrabold text-lg line-clamp-2 leading-tight group-hover/hf:text-foreground transition-colors">
            {item.name || item.title}
          </h4>
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-secondary/30 text-muted-foreground text-[10px] font-black border border-border/20 uppercase tracking-widest whitespace-nowrap shadow-sm">
            {item.likes ? (
              <FolderHeart size={12} className="text-destructive" />
            ) : item.upvotes ? (
              <ArrowBigUp size={12} className="text-destructive" />
            ) : null}
            {item.likes || item.upvotes}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {item.pipeline_tag && (
            <Badge
              className={cn(
                `text-[10px] px-3 py-1 uppercase font-black`,
                color.bg,
                color.text,
                color.border
              )}
            >
              {item.pipeline_tag}
            </Badge>
          )}
          {item.sdk && (
            <Badge
              className={cn(
                `text-[10px] px-3 py-1 uppercase font-black`,
                color.bg,
                color.text,
                color.border
              )}
            >
              {item.sdk}
            </Badge>
          )}
          {item.downloads && (
            <div className="text-[10px] font-black text-muted-foreground/50 flex items-center gap-2 uppercase tracking-widest pl-1">
              <span>{item.downloads.toLocaleString()} downloads</span>
            </div>
          )}
        </div>
        {(item.description || item.summary) && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {item.description || item.summary}
          </p>
        )}
        {item.tags && (
          <div className="flex flex-wrap gap-2 pt-2">
            {item.tags?.slice(0, 4).map((tag: string) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-[10px] px-2.5 py-0.5 bg-background/50 text-foreground/70 border-border/40 uppercase font-black tracking-widest"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 text-[10px] text-primary tracking-[0.2em] hover:text-primary/80 flex items-center gap-2 uppercase transition-all hover:gap-3 group/link"
      >
        Explore{" "}
        {category == "model"
          ? "Model"
          : category == "dataset"
            ? "Dataset"
            : "Space"}
        <ExternalLink size={14} className="group-hover/link:animate-pulse" />
      </a>
    </div>
  );
}

function EmptyPlatformState({
  platform,
  isOwner,
  username,
  onSyncClick,
}: {
  platform: string;
  isOwner: boolean;
  username: string;
  onSyncClick?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] border-2 border-dashed border-border/40 rounded-[3rem] bg-secondary/5 space-y-8 text-center p-12 animate-in zoom-in-95 duration-700 ease-out relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="p-10 rounded-full bg-secondary/20 border border-border/40 text-muted-foreground/30 relative group-hover:scale-110 transition-transform duration-500">
        <Code2 size={64} strokeWidth={1} />
        <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-background border border-border/40 text-primary/40 shadow-xl">
          <RefreshCw size={24} className="animate-spin-slow" />
        </div>
      </div>
      <div className="space-y-4 max-w-sm relative z-10">
        <h3 className="text-2xl font-black  text-foreground px-4">
          {platform} Not Synced
        </h3>
        <p className="text-muted-foreground/80 leading-relaxed italic font-medium">
          {isOwner
            ? `Connect your ${platform} profile here to propagate your technical legacy.`
            : `This builder hasn't synchronized their ${platform} profile yet. Check their other stacks!`}
        </p>
      </div>
      {isOwner && (
        <Button
          className="rounded-full px-8 h-10 bg-primary text-primary-foreground hover:scale-102 transition-all font-black tracking-widest relative z-10"
          onClick={onSyncClick}
        >
          Sync {platform}
        </Button>
      )}
    </div>
  );
}
