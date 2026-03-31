import { AchievementResponse } from "@/services/achievements";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Building2,
  Calendar,
  Lightbulb,
  ExternalLink,
  Link2,
} from "lucide-react";
import Link from "next/link";

interface Props {
  achievements: AchievementResponse[];
}

export default function PublicAchievementSection({ achievements }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {achievements.map((achievement, i) => (
        <div
          className={cn(
            "group relative p-6 rounded-2xl bg-card/40 backdrop-blur-sm border border-border/60 hover:border-primary/40 transition-all duration-300"
          )}
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="space-y-1">
                <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {achievement.title}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-sm font-medium">
                  {achievement.event && (
                    <div className="flex items-center gap-1.5">
                      <Lightbulb size={16} className="text-primary/70" />
                      {achievement.event}
                    </div>
                  )}
                  {achievement.organization && (
                    <div className="flex items-center gap-1.5">
                      <Building2 size={16} className="text-primary/70" />
                      {achievement.organization}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/30 w-fit px-2.5 py-1 rounded-full border border-border/40">
                <Calendar size={14} className="text-primary/60" />
                <span>
                  {achievement.event_date &&
                    format(achievement.event_date, "MMM yyyy")}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-sm font-medium">
                  {achievement.event_link && (
                    <div className="flex items-center gap-1.5">
                      <div className="relative flex items-center gap-1.5 border border-border rounded-md px-2 py-1">
                        <ExternalLink size={16} className="text-primary/70" />
                        <Link
                          href={achievement.event_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors text-sm"
                        >
                          Event Link
                        </Link>
                      </div>
                    </div>
                  )}
                  {achievement.certificate_link && (
                    <div className="flex items-center gap-1.5">
                      <div className="relative flex items-center gap-1.5 border border-border rounded-md px-2 py-1">
                        <Link2 size={16} className="text-primary/70" />
                        <Link
                          href={achievement.certificate_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Certificate Link
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {achievement.description && (
                <p className="text-muted-foreground text-[16px] leading-relaxed max-w-2xl whitespace-pre-wrap">
                  {achievement.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
