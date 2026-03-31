import { Badge } from "@/components";
import { cn } from "@/lib/utils";
import { ExperienceResponse } from "@/services/experiences";
import { format } from "date-fns";
import { Building2, Calendar, MapPin } from "lucide-react";

interface Props {
  experiences: ExperienceResponse[];
}

export default function PublicExperienceSection({ experiences }: Props) {
  return (
    <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-primary before:to-transparent">
      {experiences.map((experience, i) => (
        <div
          className={cn(
            "group relative p-6 rounded-2xl bg-card/40 backdrop-blur-sm border border-border/60 hover:border-primary/40 transition-all duration-300"
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
                <span>{format(experience.start_date, "MMM yyyy")}</span>
                <span className="mx-1">•</span>
                <span>
                  {experience.end_date
                    ? format(experience.end_date, "MMM yyyy")
                    : "Present"}
                </span>
              </div>

              <p className="text-muted-foreground text-[16px] leading-relaxed max-w-2xl whitespace-pre-wrap">
                {experience.description}
              </p>

              {experience.skills && experience.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4">
                  {experience.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="px-3 py-1 bg-primary/5 hover:bg-primary/10 border-primary/10 text-primary/80 transition-all cursor-pointer text-[14px] tracking-wider"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
