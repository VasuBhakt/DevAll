import { Badge } from "@/components";
import { cn } from "@/lib/utils";
import { ProjectResponse } from "@/services/projects";
import { format } from "date-fns";
import { Calendar, Code2, Github, Globe, Layers } from "lucide-react";
import Link from "next/link";

interface Props {
  projects: ProjectResponse[];
}
export default function PublicProjectSection({ projects }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {projects.map((project, i) => (
        <div
          className={cn(
            "group relative p-6 rounded-2xl bg-card/40 backdrop-blur-sm border border-border/60 hover:border-primary/40 transition-all duration-300"
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
                  {project.project_date && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/30 w-fit px-2.5 py-1 rounded-full border border-border/40">
                      <Calendar size={14} className="text-primary/60" />
                      <span>{format(project.project_date, "MMM yyyy")}</span>
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
          </div>
        </div>
      ))}
    </div>
  );
}
