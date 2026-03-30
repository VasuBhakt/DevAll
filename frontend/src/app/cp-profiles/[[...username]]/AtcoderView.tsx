"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ExternalLink,
  RefreshCw,
  Loader2,
  Check,
  X,
  History,
  TrendingUp,
  TrendingDown,
  Award,
  CircleUser,
  Trash2,
} from "lucide-react";
import { Badge, Button, Input } from "@/components";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { CPService } from "@/services/cpProfile";
import { AtcoderProfile } from "@/services/cpProfile/profiles/atcoder";

interface AtcoderViewProps {
  profile?: AtcoderProfile;
  isOwner: boolean;
  username: string;
}

export const AtcoderRankColor = (rank: number) => {
  if (rank < 400) return { first: "text-gray-500", second: "text-gray-500" };
  if (rank < 800)
    return { first: "text-orange-900", second: "text-orange-900" };
  if (rank < 1200) return { first: "text-green-500", second: "text-green-500" };
  if (rank < 1600) return { first: "text-cyan-500", second: "text-cyan-500" };
  if (rank < 2000) return { first: "text-blue-500", second: "text-blue-500" };
  if (rank < 2400)
    return { first: "text-yellow-500", second: "text-yellow-500" };
  if (rank < 2800)
    return { first: "text-orange-500", second: "text-orange-500" };
  return { first: "text-red-700", second: "text-red-700" };
};

export default function AtcoderView({
  profile,
  isOwner,
  username,
}: AtcoderViewProps) {
  const [newHandle, setNewHandle] = useState("");
  const [showSyncInput, setShowSyncInput] = useState(false);
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: (handle: string) => CPService.fetchCPProfile("atcoder", handle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cp-profiles", username] });
      alert("Atcoder Profile synchronized successfully!");
      setShowSyncInput(false);
      setNewHandle("");
    },
    onError: (error: any) => {
      alert(error.message || "Failed to synchronize profile");
    },
  });

  const handleSync = () => {
    const handleToSync = newHandle.trim() || profile?.handle;
    if (!handleToSync) {
      alert("Please provide a handle to sync.");
      return;
    }
    syncMutation.mutate(handleToSync);
  };

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (confirm("Are you sure you want to delete your AtCoder profile?")) {
        return CPService.deleteCPProfile("atcoder");
      }
      return Promise.reject(new Error("Profile not deleted"));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cp-profiles", username] });
      alert("AtCoder Profile deleted successfully!");
    },
    onError: (error: any) => {
      alert(error.message || "Failed to delete profile");
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  if (!profile && !showSyncInput)
    return (
      <EmptyPlatformState
        platform="AtCoder"
        isOwner={isOwner}
        onSyncClick={() => setShowSyncInput(true)}
      />
    );

  const chartData =
    profile?.contests?.map((c, index) => ({
      name: c.contest_name,
      rating: c.rating,
      rank: c.rank,
      diffRating: index > 0 ? c.rating - profile.contests[index - 1].rating : 0,
      date: new Date(c.date).toLocaleDateString(),
    })) || [];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      {/* Header Card */}
      <div className="relative p-8 md:p-12 rounded-[2.5rem] bg-card/40 backdrop-blur-xl border border-border/60 shadow-2xl overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none">
          <img src="/atcoder.png" alt="AtCoder" className="w-32 h-32" />
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-12 relative z-10">
          <div className="relative shrink-0">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent flex items-center justify-center border border-blue-500/20 backdrop-blur-sm group-hover:scale-105 transition-transform duration-500">
              {profile?.avatar ? (
                <img
                  src={profile?.avatar}
                  alt="AtCoder"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <img
                  src="/atcoder.png"
                  alt="AtCoder"
                  className="w-full h-full object-cover opacity-50 rounded-full"
                />
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
                    AtCoder
                  </h2>
                  {profile?.profile_link && (
                    <a
                      href={profile?.profile_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-secondary/80 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-border/40 shadow-sm"
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
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
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-10">
                  <StatItem
                    icon={TrendingUp}
                    label="Current Rating"
                    value={profile.rating}
                    color={AtcoderRankColor(profile.rating)}
                  />
                  <StatItem
                    icon={Award}
                    label="Max Rating"
                    value={profile.max_rating}
                    color={AtcoderRankColor(profile.max_rating)}
                  />
                  <StatItem
                    icon={History}
                    label="Contests"
                    value={profile.contests?.length || 0}
                    color={{ first: "text-primary", second: "text-primary" }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {profile && chartData.length > 0 && (
        <div className="p-8 md:p-12 rounded-[3.5rem] bg-card/25 backdrop-blur-md border border-border/40 space-y-8 min-h-[400px]">
          <div className="flex items-center gap-4">
            <h3 className="text-3xl font-semibold tracking-tight flex items-center gap-3 text-foreground/80">
              Contest History
            </h3>
          </div>
          <div className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="atcoderRating"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--chart)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--chart)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis dataKey="date" hide />
                <YAxis
                  domain={["dataMin - 100", "dataMax + 100"]}
                  axisLine={false}
                  tickLine={false}
                  tickCount={12}
                  allowDecimals={false}
                  tick={{ fill: "var(--primary)", fontSize: 10 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card/90 backdrop-blur-md border border-border/60 p-4 rounded-2xl shadow-2xl space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                            {payload[0].payload.date}
                          </p>
                          <p className="font-bold text-sm leading-tight text-foreground">
                            {payload[0].payload.name}
                          </p>
                          <p className="font-bold text-sm leading-tight text-foreground">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                              Rank{": "}
                            </span>
                            {payload[0].payload.rank}
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            {payload[0].payload.diffRating >= 0 ? (
                              <TrendingUp size={14} className="text-success" />
                            ) : (
                              <TrendingDown
                                size={14}
                                className="text-destructive"
                              />
                            )}
                            <span className="text-lg font-black tabular-nums text-foreground">
                              {payload[0].value}
                            </span>
                            {payload[0].payload.diffRating !== 0 && (
                              <span
                                className={cn(
                                  "text-lg font-black tabular-nums",
                                  payload[0].payload.diffRating > 0
                                    ? "text-success"
                                    : "text-destructive"
                                )}
                              >
                                {payload[0].payload.diffRating > 0
                                  ? `+${payload[0].payload.diffRating}`
                                  : payload[0].payload.diffRating}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rating"
                  stroke="var(--chart)"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#atcoderRating)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function StatItem({
  icon: Icon,
  label,
  value,
  color,
  additionalInfo,
}: {
  icon: any;
  label: string;
  value: number;
  color: { first: string; second: string };
  additionalInfo?: string;
}) {
  return (
    <div className="flex flex-col items-center md:items-start gap-1 group/stat transition-all">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-primary/5 text-primary/60 group-hover/stat:text-primary transition-colors">
          <Icon size={16} />
        </div>
        <span
          className={cn("text-2xl font-semibold tabular-nums", color.first)}
        >
          {value.toLocaleString()}
        </span>
      </div>
      <span className="text-[16px] font-black text-foreground tracking-widest">
        {label}
      </span>
    </div>
  );
}

function EmptyPlatformState({
  platform,
  isOwner,
  onSyncClick,
}: {
  platform: string;
  isOwner: boolean;
  onSyncClick?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] border-2 border-dashed border-border/40 rounded-[3rem] bg-secondary/5 space-y-8 text-center p-12">
      <div className="p-10 rounded-full bg-secondary/20 border border-border/40 text-muted-foreground/20">
        <Award size={64} strokeWidth={1} />
      </div>
      <div className="space-y-4 max-w-sm">
        <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground italic">
          {platform} Not Synced
        </h3>
        <p className="text-muted-foreground italic font-medium">
          {isOwner
            ? `Sync your ${platform} profile to display your ratings and progression curves.`
            : `This user hasn't synced their ${platform} profile yet.`}
        </p>
      </div>
      {isOwner && (
        <Button
          className="rounded-full px-12 h-14 bg-primary text-primary-foreground hover:scale-105 transition-all font-black tracking-widest uppercase text-xs"
          onClick={onSyncClick}
        >
          Sync {platform}
        </Button>
      )}
    </div>
  );
}
