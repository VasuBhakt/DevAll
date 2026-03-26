"use client";

import { AchievementResponse } from "@/services/achievements";
import { format } from "date-fns";
import {
  Building2,
  Calendar,
  ExternalLink,
  Lightbulb,
  Link2,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AchievementCardProps {
  achievement: AchievementResponse;
  isOwner?: boolean;
  onEdit?: (achievement: AchievementResponse) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function AchievementCard({
  achievement,
  isOwner,
  onEdit,
  onDelete,
  className,
}: AchievementCardProps) {
  const eventDate = achievement.event_date
    ? new Date(achievement.event_date)
    : null;

  return (
    <div
      className={cn(
        "group relative p-6 rounded-2xl bg-card/40 backdrop-blur-sm border border-border/60 hover:border-primary/40 transition-all duration-300",
        className
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
            <span>{eventDate && format(eventDate, "MMM yyyy")}</span>
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
            <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl whitespace-pre-wrap">
              {achievement.description}
            </p>
          )}
        </div>

        {isOwner && (
          <div className="flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary"
              onClick={() => onEdit?.(achievement)}
            >
              <Pencil size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive group-hover/btn:scale-110 active:scale-95 transition-all"
              onClick={() => onDelete?.(achievement.id)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function AchievementCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-card/40 border border-border/60 animate-pulse">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-7 bg-secondary/50 rounded-lg w-1/3" />
          <div className="h-4 bg-secondary/40 rounded-lg w-1/4" />
        </div>
        <div className="h-6 bg-secondary/30 rounded-full w-24" />
        <div className="space-y-2">
          <div className="h-4 bg-secondary/20 rounded-lg w-full" />
          <div className="h-4 bg-secondary/20 rounded-lg w-5/6" />
        </div>
      </div>
    </div>
  );
}
