"use client";

import { ProjectResponse } from "@/services/projects";
import { format } from "date-fns";
import {
  Github,
  Globe,
  Calendar,
  Pencil,
  Trash2,
  Code2,
  Layers,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ProjectCardProps {
  project: ProjectResponse;
  isOwner?: boolean;
  onEdit?: (project: ProjectResponse) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function ProjectCard({
  project,
  isOwner,
  onEdit,
  onDelete,
  className,
}: ProjectCardProps) {
  const projectDate = project.project_date
    ? new Date(project.project_date)
    : null;

  return (
    <div
      className={cn(
        "group relative p-6 rounded-2xl bg-card/40 backdrop-blur-sm border border-border/60 hover:border-primary/40 transition-all duration-300",
        className
      )}
    >
      <div className="flex flex-col gap-5">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 font-medium">
            <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-sm">
              {projectDate && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/30 w-fit px-2.5 py-1 rounded-full border border-border/40">
                  <Calendar size={14} className="text-primary/60" />
                  <span>{format(projectDate, "MMM yyyy")}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <p className="text-muted-foreground text-[16px] leading-relaxed whitespace-pre-wrap max-w-2xl">
          {project.description}
        </p>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-sm font-medium">
            {project.github_link && (
              <div className="flex items-center gap-1.5">
                <div className="relative flex items-center gap-1.5 border border-border rounded-md px-2 py-1">
                  <Github size={16} className="text-primary/70" />
                  <Link
                    href={project.github_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors text-sm"
                  >
                    Github Link
                  </Link>
                </div>
              </div>
            )}
            {project.project_link && (
              <div className="flex items-center gap-1.5">
                <div className="relative flex items-center gap-1.5 border border-border rounded-md px-2 py-1">
                  <Globe size={16} className="text-primary/70" />
                  <Link
                    href={project.project_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Live Project Link
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tags Section */}
        <div className="space-y-4">
          {project.tech_stack && project.tech_stack.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {project.tech_stack.map((tech) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="px-3 py-1 bg-primary/5 hover:bg-primary/10 border-primary/10 text-primary/80 transition-all cursor-pointer text-[14px] tracking-wider"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-3 pt-3 border-t border-border/40">
            {/* Languages Row */}
            {project.languages && project.languages.length > 0 && (
              <div className="flex items-center gap-2">
                <Code2 size={14} className="text-primary/60 shrink-0" />
                <div className="flex flex-wrap items-center gap-x-1.5">
                  {project.languages.map((lang, index) => (
                    <div key={lang} className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-muted-foreground/80 uppercase tracking-tight">
                        {lang}
                      </span>
                      {/* Render dot only if it's not the last item */}
                      {project.languages?.length &&
                        index < project.languages.length - 1 && (
                          <span className="text-[10px] text-muted-foreground/40">
                            •
                          </span>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Domains Row */}
            {project.domains && project.domains.length > 0 && (
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-primary/60 shrink-0" />
                <div className="flex flex-wrap items-center gap-x-1.5">
                  {project.domains.map((domain, index) => (
                    <div key={domain} className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-muted-foreground/80 uppercase tracking-tight">
                        {domain}
                      </span>
                      {/* Render dot only if it's not the last item */}
                      {project.domains?.length &&
                        index < project.domains.length - 1 && (
                          <span className="text-[10px] text-muted-foreground/40">
                            •
                          </span>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions for Owner */}
        {isOwner && (
          <div className="absolute top-6 right-8 flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary"
              onClick={() => onEdit?.(project)}
            >
              <Pencil size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive group-hover/btn:scale-110 active:scale-95 transition-all"
              onClick={() => onDelete?.(project.id)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="p-8 rounded-3xl bg-card/40 border border-border/60 animate-pulse space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-3 w-1/2">
          <div className="h-8 bg-secondary/50 rounded-xl w-3/4" />
          <div className="h-5 bg-secondary/30 rounded-full w-1/3" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-secondary/40 rounded-full" />
          <div className="h-8 w-8 bg-secondary/40 rounded-full" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-secondary/30 rounded-lg w-full" />
        <div className="h-4 bg-secondary/30 rounded-lg w-5/6" />
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="h-6 w-16 bg-secondary/20 rounded-full" />
        <div className="h-6 w-16 bg-secondary/20 rounded-full" />
        <div className="h-6 w-20 bg-secondary/20 rounded-full" />
      </div>
    </div>
  );
}
