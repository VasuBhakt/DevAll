"use client";

import { ExperienceResponse } from "@/services/experiences/schema";
import { format } from "date-fns";
import { Building2, Calendar, MapPin, Pencil, Trash2 } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

interface ExperienceCardProps {
  experience: ExperienceResponse;
  isOwner?: boolean;
  onEdit?: (experience: ExperienceResponse) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function ExperienceCard({
  experience,
  isOwner,
  onEdit,
  onDelete,
  className,
}: ExperienceCardProps) {
  const startDate = new Date(experience.start_date);
  const endDate = experience.end_date ? new Date(experience.end_date) : null;

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
              {experience.job_title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-sm font-medium">
              <div className="flex items-center gap-1.5">
                <Building2 size={16} className="text-primary/70" />
                {experience.organization}
              </div>
              {experience.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-primary/70" />
                  {experience.location}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/30 w-fit px-2.5 py-1 rounded-full border border-border/40">
            <Calendar size={14} className="text-primary/60" />
            <span>{format(startDate, "MMM yyyy")}</span>
            <span className="mx-1">•</span>
            <span>{endDate ? format(endDate, "MMM yyyy") : "Present"}</span>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl whitespace-pre-wrap">
            {experience.description}
          </p>

          {experience.skills && experience.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {experience.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="px-3 py-1 bg-primary/5 hover:bg-primary/10 border-primary/10 text-primary/80 transition-all cursor-default text-[10px] tracking-wider font-bold"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {isOwner && (
          <div className="flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary"
              onClick={() => onEdit?.(experience)}
            >
              <Pencil size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive group-hover/btn:scale-110 active:scale-95 transition-all"
              onClick={() => onDelete?.(experience.id)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ExperienceCardSkeleton() {
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
