import { Github, Database, Globe } from "lucide-react";
import { Badge } from "@/components";
import { PublicRepoResponse } from "@/services/public/schema";

interface Props {
  profile: PublicRepoResponse;
}

export default function RepoQuickCard({ profile }: Props) {
  return (
    <div className="p-8 rounded-[2.5rem] bg-card/30 backdrop-blur-md border border-border/40 hover:border-primary/40 transition-all group overflow-hidden relative shadow-lg hover:shadow-primary/5">
      <div className="absolute top-0 right-0 p-6 opacity-[0.2] group-hover:opacity-[0.4] transition-all duration-700 pointer-events-none">
        {profile.platform?.toLowerCase() === "github" ? (
          <Github size={100} />
        ) : (
          <span className="text-[100px] drop-shadow-2xl">🤗</span>
        )}
      </div>

      <div className="space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center p-2 text-primary">
              {profile.platform?.toLowerCase() === "github" ? (
                <Github size={20} />
              ) : (
                <span className="text-[20px]">🤗</span>
              )}
            </div>
            <h4 className="font-bold uppercase">{profile.platform}</h4>
          </div>
          <a
            href={profile.profile_link}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-secondary/40 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-border/40 shadow-sm"
          >
            <Globe size={18} />
          </a>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">
              Followers
            </span>
            <p className="text-3xl font-black text-foreground tabular-nums">
              {profile.followers_count}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              Public Repos
            </span>
            <p className="text-3xl font-black text-foreground tabular-nums">
              {profile.public_repo_count}
            </p>
          </div>
          {!!profile.contribution_count && (
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Contributions
              </span>
              <p className="text-3xl font-black text-foreground tabular-nums">
                {profile.contribution_count}
              </p>
            </div>
          )}
          {!!profile.papers_count && (
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Papers
              </span>
              <p className="text-3xl font-black text-foreground tabular-nums">
                {profile.papers_count}
              </p>
            </div>
          )}
        </div>

        <div className="w-full h-1.5 bg-secondary/40 rounded-full flex gap-1 overflow-hidden">
          <div className="h-full bg-blue-500/60 w-[40%] rounded-full" />
          <div className="h-full bg-green-500/60 w-[30%] rounded-full" />
          <div className="h-full bg-yellow-500/60 w-[20%] rounded-full" />
          <div className="h-full bg-red-500/60 w-[10%] rounded-full" />
        </div>
      </div>
    </div>
  );
}
