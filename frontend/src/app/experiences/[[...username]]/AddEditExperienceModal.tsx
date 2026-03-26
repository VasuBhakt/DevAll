"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui";
import { Button } from "@/components/ui";
import {
  Input,
  Field,
  FieldLabel,
  FieldError,
  Badge,
  Textarea,
} from "@/components/ui";
import { DatePicker } from "@/components/ui";
import {
  CreateExperienceRequest,
  ExperienceResponse,
} from "@/services/experiences";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddEditExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  experience?: ExperienceResponse | null;
  onSave: (data: CreateExperienceRequest) => Promise<void>;
}

export function AddEditExperienceModal({
  isOpen,
  onClose,
  experience,
  onSave,
}: AddEditExperienceModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const isEditing = !!experience;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
  } = useForm<CreateExperienceRequest>({
    defaultValues: {
      organization: "",
      job_title: "",
      description: "",
      location: "",
      skills: [],
    },
  });

  // Prefill form if editing
  useEffect(() => {
    if (experience && isOpen) {
      reset({
        organization: experience.organization,
        job_title: experience.job_title,
        description: experience.description,
        location: experience.location ?? "",
        start_date: new Date(experience.start_date),
        end_date: experience.end_date ? new Date(experience.end_date) : null,
        skills: experience.skills ?? [],
      });
    } else if (!experience && isOpen) {
      reset({
        organization: "",
        job_title: "",
        description: "",
        location: "",
        skills: [],
        start_date: undefined,
        end_date: undefined,
      });
    }
  }, [experience, isOpen, reset]);

  const onSubmit = async (data: CreateExperienceRequest) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
      onClose();
    } catch (err) {
      // Errors handled by parent query
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-[900px] lg:max-w-[1000px] w-full h-[90vh] bg-card/80 backdrop-blur-3xl border-border/60 rounded-[2.5rem] p-10 overflow-hidden flex flex-col">
        <DialogHeader className="mb-8 shrink-0">
          <DialogTitle className="text-4xl font-extrabold tracking-tight text-primary">
            {isEditing ? "Edit Experience" : "Add Experience"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-lg pt-1">
            Carefully document your professional journey for the world to see
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto pr-4 -mr-4 space-y-8 custom-scrollbar"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
              <FieldLabel htmlFor="organization">
                Organization / Company
              </FieldLabel>
              <Input
                {...register("organization", {
                  required: "Organization is required",
                })}
                id="organization"
                placeholder="Organization..."
                className={cn(
                  "bg-background/50 mx-1",
                  "placeholder:text-foreground/30"
                )}
              />
              {errors.organization && (
                <FieldError errors={[errors.organization]} />
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="job_title">Job Title</FieldLabel>
              <Input
                {...register("job_title", {
                  required: "Job title is required",
                })}
                id="job_title"
                placeholder="Senior Backend Engineer..."
                className={cn(
                  "bg-background/50 mx-1",
                  "placeholder:text-foreground/30"
                )}
              />
              {errors.job_title && <FieldError errors={[errors.job_title]} />}
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-1">
            <Field>
              <FieldLabel>Start Date</FieldLabel>
              <Controller
                control={control}
                name="start_date"
                rules={{ required: "Start date is required" }}
                render={({ field }) => (
                  <DatePicker
                    date={field.value ? new Date(field.value) : undefined}
                    setDate={(date: Date | undefined) => field.onChange(date)}
                    placeholder="Started in..."
                  />
                )}
              />
              {errors.start_date && <FieldError errors={[errors.start_date]} />}
            </Field>

            <Field>
              <FieldLabel>End Date (Optional)</FieldLabel>
              <Controller
                control={control}
                name="end_date"
                render={({ field }) => (
                  <DatePicker
                    date={field.value ? new Date(field.value) : undefined}
                    setDate={(date: Date | undefined) => field.onChange(date)}
                    placeholder="Ended in (Blank if Present)..."
                  />
                )}
              />
              <p className="text-[11px] text-muted-foreground pt-1">
                Leave blank if this is your current role
              </p>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="location">Location (Optional)</FieldLabel>
            <Input
              {...register("location")}
              id="location"
              placeholder="San Francisco, Hybrid, Remote..."
              className={cn(
                "bg-background/50 mx-1",
                "placeholder:text-foreground/30"
              )}
            />
          </Field>

          <Field>
            <FieldLabel>Skills & Technologies</FieldLabel>
            <Controller
              control={control}
              name="skills"
              render={({ field }) => (
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          const val = skillInput.trim();
                          if (val && !field.value?.includes(val)) {
                            field.onChange([...(field.value || []), val]);
                            setSkillInput("");
                          }
                        }
                      }}
                      placeholder="Add a skill (e.g. React, Python) and press Enter..."
                      className={cn(
                        "bg-background/50 mx-1",
                        "placeholder:text-foreground/30"
                      )}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">⏎</span>
                      </kbd>
                    </div>
                  </div>

                  {field.value && field.value.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 rounded-2xl border border-dashed border-border/60 bg-secondary/5">
                      {field.value.map((skill, index) => (
                        <Badge
                          key={`${skill}-${index}`}
                          variant="secondary"
                          className="h-8 pl-3 pr-1.5 rounded-full text-sm font-medium animate-in fade-in zoom-in duration-200"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => {
                              const newSkills = field.value?.filter(
                                (_, i) => i !== index
                              );
                              field.onChange(newSkills);
                            }}
                            className="ml-1.5 p-0.5 rounded-full hover:bg-destructive/20 hover:text-destructive transition-colors group"
                          >
                            <X size={14} strokeWidth={2.5} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="description">Job Description</FieldLabel>
            <Textarea
              {...register("description", {
                required: "Description is required",
              })}
              id="description"
              rows={4}
              className={cn(
                "bg-background/50 mx-1",
                "placeholder:text-foreground/30"
              )}
              placeholder="Describe your achievements and responsibilities..."
            />
            {errors.description && <FieldError errors={[errors.description]} />}
          </Field>

          <DialogFooter className="pt-4 gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full px-8 hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Update Experience"
              ) : (
                "Save Experience"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
