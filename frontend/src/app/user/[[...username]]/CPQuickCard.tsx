import { PublicCPProfile } from "@/services/public/schema";
import { Badge } from "@/components/ui";
import { Star, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CodeforcesRankColor,
  CodechefRankColor,
  AtcoderRankColor,
} from "@/app/cp-profiles/[[...username]]";

interface Props {
  profile: PublicCPProfile;
}

export default function CPQuickCard({ profile }: Props) {
  const getIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p === "codeforces") return "/codeforces.png";
    if (p === "atcoder") return "/atcoder.png";
    if (p === "codechef") return "/codechef.png";
    if (p === "leetcode") return "/leetcode.png";
    return null;
  };

  const getRankColor = (platform: string, rating: number) => {
    const p = platform.toLowerCase();
    if (p === "codeforces") return CodeforcesRankColor(rating).second;
    if (p === "atcoder") return AtcoderRankColor(rating).second;
    if (p === "codechef") return CodechefRankColor(rating).second;
    return "text-foreground";
  };

  return (
    <div className="p-8 rounded-[2.5rem] bg-card/30 backdrop-blur-md border border-border/40 hover:border-primary/40 transition-all group overflow-hidden relative shadow-lg hover:shadow-primary/5">
      <div className="absolute top-0 right-0 p-6 opacity-[0.2] group-hover:opacity-[0.4] transition-all duration-700 pointer-events-none">
        {getIcon(profile.platform) && (
          <img
            src={getIcon(profile.platform)!}
            alt={profile.platform}
            className={cn(
              "w-24 h-24",
              profile.platform === "codechef" && "w-48"
            )}
          />
        )}
      </div>

      <div className="space-y-6 relative z-10 font-bold">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center p-2">
              <img
                src={getIcon(profile.platform)!}
                alt={profile.platform}
                className="w-full h-full object-contain"
              />
            </div>
            <h4 className="font-bold tracking-tight uppercase">
              {profile.platform}
            </h4>
          </div>
          <Badge
            variant="secondary"
            className="rounded-full px-3 py-1 text-[12px] font-black tracking-widest bg-primary/5 text-primary"
          >
            @{profile.handle}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">
              Rating
            </span>
            <div className="flex items-baseline gap-1">
              <p
                className={cn(
                  "text-3xl font-black text-primary tabular-nums tracking-tighter",
                  getRankColor(profile.platform, profile.rating)
                )}
              >
                {profile.rating || "N/A"}
              </p>
              <TrendingUp size={14} className="text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">
              Current Rank
            </span>
            {profile.rank && (
              <p className="flex flex-wrap items-center gap-1 text-3xl font-black text-primary tabular-nums tracking-tighter">
                {profile.platform === "codechef" && (
                  <Star size={18} className="text-primary" />
                )}
                {profile.rank || "N/A"}
              </p>
            )}
          </div>
          {profile.max_rank && profile.max_rating && (
            <>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">
                  Max Rating
                </span>
                <div className="flex items-baseline gap-1">
                  <p
                    className={cn(
                      "text-3xl font-black text-primary tabular-nums tracking-tighter text-primary",
                      getRankColor(profile.platform, profile.max_rating)
                    )}
                  >
                    {profile.max_rating || "N/A"}
                  </p>
                  <TrendingUp size={14} className="text-primary" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">
                  Max Rank
                </span>
                <p className="flex flex-wrap items-center gap-1 text-3xl font-black text-primary tabular-nums tracking-tighter">
                  {profile.platform === "codechef" && (
                    <Star size={18} className="text-primary" />
                  )}
                  {profile.max_rank || "N/A"}
                </p>
              </div>
            </>
          )}
          {profile.platform === "leetcode" && (
            <div className="grid grid-cols-3 gap-2 col-span-2">
              <div className="space-y-1">
                <span className="text-[12px] font-black uppercase tracking-widest text-emerald-500">
                  Easy
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[12px] font-black uppercase tracking-widest text-amber-500">
                  Medium
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[12px] font-black uppercase tracking-widest text-red-500">
                  Hard
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-2xl font-black uppercase tracking-widest text-primary">
                  {profile.easy_problems}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-2xl font-black uppercase tracking-widest text-primary">
                  {profile.medium_problems}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-2xl font-black uppercase tracking-widest text-primary">
                  {profile.hard_problems}
                </span>
              </div>
            </div>
          )}
          <div className="col-span-2 space-y-1 pt-4 border-t border-border/10">
            {profile.problems_solved && (
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">
                  Problems Solved
                </span>
                <span className="text-xl font-black text-primary">
                  {profile.problems_solved || 0}
                </span>
              </div>
            )}
            <div className="flex gap-1 h-1.5 mt-1 justify-end">
              <div className="flex-[3] h-full bg-green-500/60 rounded-full" />
              <div className="flex-[2] h-full bg-yellow-500/60 rounded-full" />
              <div className="flex-[1] h-full bg-red-500/60 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
