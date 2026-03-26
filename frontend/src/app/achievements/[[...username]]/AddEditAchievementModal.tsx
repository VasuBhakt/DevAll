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
import { Loader2 } from "lucide-react";
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
      <DialogContent className="max-w-[95vw] sm:max-w-[800px] w-full bg-card/80 backdrop-blur-3xl border-border/60 rounded-[2.5rem] p-10 overflow-hidden flex flex-col">
        <DialogHeader className="mb-8 shrink-0">
          <DialogTitle className="text-4xl font-extrabold tracking-tight text-primary">
            {isEditing ? "Edit Achievement" : "Add Achievement"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-lg pt-1">
            Carefully document your achievements for the world to see
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto pr-4 -mr-4 space-y-8 custom-scrollbar"
        >
          <Field>
            <FieldLabel htmlFor="title">
              Achievement / Certification Title{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              {...register("title", {
                required: "Title is required",
              })}
              id="title"
              placeholder="Google Cloud Certified Professional..."
              className={cn(
                "bg-background/50 mx-1",
                "placeholder:text-foreground/30"
              )}
            />
            {errors.title && <FieldError errors={[errors.title]} />}
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
              <FieldLabel htmlFor="organization">
                Organization / Issuing Authority
              </FieldLabel>
              <Input
                {...register("organization")}
                id="organization"
                placeholder="Google, Microsoft, Coursera..."
                className={cn(
                  "bg-background/50 mx-1",
                  "placeholder:text-foreground/30"
                )}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="event">Event / Competition</FieldLabel>
              <Input
                {...register("event")}
                id="event"
                placeholder="Google HashCode, Imagine Cup..."
                className={cn(
                  "bg-background/50 mx-1",
                  "placeholder:text-foreground/30"
                )}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-1">
            <Field>
              <FieldLabel>Date Obtained / Event Date</FieldLabel>
              <Controller
                control={control}
                name="event_date"
                render={({ field }) => (
                  <DatePicker
                    date={field.value ? new Date(field.value) : undefined}
                    setDate={(date: Date | undefined) => field.onChange(date)}
                    placeholder="Date..."
                  />
                )}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="certificate_link">
                Certificate Link (URL)
              </FieldLabel>
              <Input
                {...register("certificate_link")}
                id="certificate_link"
                placeholder="https://..."
                className={cn(
                  "bg-background/50 mx-1",
                  "placeholder:text-foreground/30"
                )}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="event_link">Event Link (URL)</FieldLabel>
            <Input
              {...register("event_link")}
              id="event_link"
              placeholder="https://..."
              className={cn(
                "bg-background/50 mx-1",
                "placeholder:text-foreground/30"
              )}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="description">Details / Description</FieldLabel>
            <Textarea
              {...register("description")}
              id="description"
              rows={4}
              className={cn(
                "bg-background/50 mx-1",
                "placeholder:text-foreground/30"
              )}
              placeholder="Describe what you achieved or what this certification entails..."
            />
          </Field>

          <DialogFooter className="pt-4 gap-3">
            <span className="text-destructive text-sm mr-auto ml-2">
              * indicates required fields
            </span>
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
                "Update Achievement"
              ) : (
                "Save Achievement"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
