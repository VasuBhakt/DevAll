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
  Textarea,
} from "@/components/ui";
import { DatePicker } from "@/components/ui";
import {
  CreateAchievementRequest,
  AchievementResponse,
} from "@/services/achievements";
import { Loader2, Pin } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddEditAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement?: AchievementResponse | null;
  onSave: (data: CreateAchievementRequest) => Promise<void>;
}

export function AddEditAchievementModal({
  isOpen,
  onClose,
  achievement,
  onSave,
}: AddEditAchievementModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!achievement;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateAchievementRequest>({
    defaultValues: {
      title: "",
      description: "",
      certificate_link: "",
      organization: "",
      event: "",
      event_date: undefined,
      event_link: "",
      is_pinned: false,
    },
  });

  // Prefill form if editing
  useEffect(() => {
    if (achievement && isOpen) {
      reset({
        title: achievement.title,
        description: achievement.description ?? "",
        certificate_link: achievement.certificate_link ?? "",
        organization: achievement.organization ?? "",
        event: achievement.event ?? "",
        event_date: achievement.event_date
          ? new Date(achievement.event_date)
          : undefined,
        event_link: achievement.event_link ?? "",
        is_pinned: achievement.is_pinned ?? false,
      });
    } else if (!achievement && isOpen) {
      reset({
        title: "",
        description: "",
        certificate_link: "",
        organization: "",
        event: "",
        event_date: undefined,
        event_link: "",
        is_pinned: false,
      });
    }
  }, [achievement, isOpen, reset]);

  const onSubmit = async (data: CreateAchievementRequest) => {
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
            {isEditing ? "Edit Achievement" : "Add Achievement"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-lg pt-1">
            Showcase your wins, certifications, and major milestones
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto pr-4 -mr-4 space-y-8 custom-scrollbar"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
              <FieldLabel htmlFor="title">
                Achievement Title <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                {...register("title", {
                  required: "Achievement title is required",
                })}
                id="title"
                placeholder="e.g. 1st Place - Global Hackathon 2024"
                className={cn(
                  "bg-background/50 h-11 mx-1",
                  "placeholder:text-foreground/30",
                  errors.title && "border-destructive focus:ring-destructive"
                )}
                maxLength={200}
              />
              {errors.title && <FieldError errors={[errors.title]} />}
            </Field>

            <Field>
              <FieldLabel htmlFor="event_date">Date Achieved</FieldLabel>
              <Controller
                control={control}
                name="event_date"
                render={({ field }) => (
                  <DatePicker
                    date={field.value ? new Date(field.value) : undefined}
                    setDate={(date: Date | undefined) => field.onChange(date)}
                    placeholder="When did you achieve this?"
                  />
                )}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
              <FieldLabel htmlFor="event">Event Name</FieldLabel>
              <Input
                {...register("event")}
                id="event"
                placeholder="e.g. ETHGlobal Singapore"
                className={cn(
                  "bg-background/50 h-11 mx-1",
                  "placeholder:text-foreground/30"
                )}
                maxLength={200}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="organization">Issuing Organization</FieldLabel>
              <Input
                {...register("organization")}
                id="organization"
                placeholder="e.g. Google, AWS, Major League Hacking"
                className={cn(
                  "bg-background/50 h-11 mx-1",
                  "placeholder:text-foreground/30"
                )}
                maxLength={200}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
              <FieldLabel htmlFor="certificate_link">Certificate Link</FieldLabel>
              <Input
                {...register("certificate_link")}
                id="certificate_link"
                placeholder="https://..."
                className={cn(
                  "bg-background/50 h-11 mx-1",
                  "placeholder:text-foreground/30"
                )}
                maxLength={500}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="event_link">Event Link (URL)</FieldLabel>
              <Input
                {...register("event_link")}
                id="event_link"
                placeholder="https://..."
                className={cn(
                  "bg-background/50 h-11 mx-1",
                  "placeholder:text-foreground/30"
                )}
                maxLength={500}
              />
            </Field>
          </div>

          <Controller
            control={control}
            name="is_pinned"
            render={({ field }) => (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/20 border border-border/50 hover:border-primary/30 transition-all mx-1">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-xl transition-colors",
                      field.value
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Pin
                      size={18}
                      className={cn(
                        "transition-transform",
                        field.value && "rotate-45"
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Pin to Profile
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Showcase this achievement at the top of your portfolio (Top 3)
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="h-5 w-5 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                />
              </div>
            )}
          />

          <Field>
            <FieldLabel htmlFor="description">Details / Description</FieldLabel>
            <Textarea
              {...register("description", {
                validate: (value) => {
                  if (!value) return true;
                  const wordCount = value.trim().split(/\s+/).length;
                  return wordCount <= 2000 || "Description must not exceed 2000 words";
                }
              })}
              id="description"
              rows={4}
              className={cn(
                "bg-background/50 mx-1",
                "placeholder:text-foreground/30"
              )}
              placeholder="Describe what you achieved or what this certification entails..."
              maxLength={20000}
            />
            {errors.description && <FieldError errors={[errors.description]} />}
          </Field>

          <DialogFooter className="border-t border-border/40 pt-6 mt-8 flex flex-row items-center justify-between shrink-0">
            <span className="text-destructive text-sm font-medium mr-auto">
              * Required fields
            </span>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-full px-8 h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full px-10 h-11 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold group"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : isEditing ? (
                  "Update Achievement"
                ) : (
                  "Save Achievement"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
