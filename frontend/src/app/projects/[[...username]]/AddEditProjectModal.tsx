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
import { CreateProjectRequest, ProjectResponse } from "@/services/projects";
import { Loader2, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddEditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: ProjectResponse | null;
  onSave: (data: CreateProjectRequest) => Promise<void>;
}

export function AddEditProjectModal({
  isOpen,
  onClose,
  project,
  onSave,
}: AddEditProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [techInput, setTechInput] = useState("");
  const [domainInput, setDomainInput] = useState("");
  const [langInput, setLangInput] = useState("");

  const isEditing = !!project;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateProjectRequest>({
    defaultValues: {
      name: "",
      description: "",
      tech_stack: [],
      domains: [],
      languages: [],
      github_link: "",
      project_link: "",
      project_date: undefined,
    },
  });

  // Prefill form if editing
  useEffect(() => {
    if (project && isOpen) {
      reset({
        name: project.name,
        description: project.description,
        tech_stack: project.tech_stack || [],
        domains: project.domains || [],
        languages: project.languages || [],
        github_link: project.github_link || "",
        project_link: project.project_link || "",
        project_date: project.project_date
          ? new Date(project.project_date)
          : undefined,
      });
    } else if (!project && isOpen) {
      reset({
        name: "",
        description: "",
        tech_stack: [],
        domains: [],
        languages: [],
        github_link: "",
        project_link: "",
        project_date: undefined,
      });
    }
  }, [project, isOpen, reset]);

  const onSubmit = async (data: CreateProjectRequest) => {
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
            {isEditing ? "Edit Project" : "Add Project"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-lg pt-1">
            Showcase your best engineering work and technical prowess
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto pr-4 -mr-4 space-y-8 custom-scrollbar"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
              <FieldLabel htmlFor="name">
                Project Name <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                {...register("name", {
                  required: "Project name is required",
                })}
                id="name"
                placeholder="DevAll Platform..."
                className={cn(
                  "bg-background/50 h-11 mx-1",
                  "placeholder:text-foreground/30"
                )}
                maxLength={200}
              />
              {errors.name && <FieldError errors={[errors.name]} />}
            </Field>

            <Field>
              <FieldLabel>
                Project Date <span className="text-destructive">*</span>
              </FieldLabel>
              <Controller
                control={control}
                name="project_date"
                rules={{ required: "Project date is required" }}
                render={({ field }) => (
                  <DatePicker
                    date={field.value ? new Date(field.value) : undefined}
                    setDate={(date: Date | undefined) => field.onChange(date)}
                    placeholder="When did you finish this project?"
                  />
                )}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="description">
              Project Description <span className="text-destructive">*</span>
            </FieldLabel>
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
              maxLength={500}
              placeholder="Deep dive into the core architecture, technical challenges and impact..."
            />
            {errors.description && <FieldError errors={[errors.description]} />}
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-1">
            <Field>
              <FieldLabel htmlFor="github_link">GitHub Link</FieldLabel>
              <Input
                {...register("github_link")}
                id="github_link"
                placeholder="https://github.com/..."
                className={cn(
                  "bg-background/50 h-11",
                  "placeholder:text-foreground/30"
                )}
                maxLength={500}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="project_link">Live Demo Link</FieldLabel>
              <Input
                {...register("project_link")}
                id="project_link"
                placeholder="https://myapp.com..."
                className={cn(
                  "bg-background/50 h-11",
                  "placeholder:text-foreground/30"
                )}
                maxLength={500}
              />
            </Field>
          </div>

          <div className="space-y-6">
            <Controller
              control={control}
              name="tech_stack"
              render={({ field }) => (
                <TagInput
                  label="Tech Stack"
                  value={techInput}
                  onChange={setTechInput}
                  tags={field.value || []}
                  onTagsChange={field.onChange}
                  placeholder="React, Redis, PostgreSQL..."
                />
              )}
            />

            <Controller
              control={control}
              name="languages"
              render={({ field }) => (
                <TagInput
                  label="Programming Languages"
                  value={langInput}
                  onChange={setLangInput}
                  tags={field.value || []}
                  onTagsChange={field.onChange}
                  placeholder="TypeScript, Python, Go..."
                />
              )}
            />

            <Controller
              control={control}
              name="domains"
              render={({ field }) => (
                <TagInput
                  label="Project Domains"
                  value={domainInput}
                  onChange={setDomainInput}
                  tags={field.value || []}
                  onTagsChange={field.onChange}
                  placeholder="Backend, Machine Learning, Web3..."
                />
              )}
            />
          </div>

          <DialogFooter className="pt-4 gap-3">
            <span className="text-destructive text-sm mr-auto ml-2 font-medium">
              * indicate required fields
            </span>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full px-10 h-11 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold group"
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
                "Update Project"
              ) : (
                "Save Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TagInput({
  label,
  value,
  onChange,
  tags,
  onTagsChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder: string;
}) {
  const addTag = () => {
    const val = value.trim();
    if (val && !tags.includes(val)) {
      onTagsChange([...tags, val]);
      onChange("");
    }
  };

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <div className="space-y-4">
        <div className="relative group mx-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder={placeholder}
            className={cn(
              "bg-background/50 h-11 pr-12 transition-all",
              "placeholder:text-foreground/30"
            )}
          />
          <button
            type="button"
            onClick={addTag}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-primary/20 hover:text-primary text-muted-foreground transition-all"
          >
            <Plus size={18} />
          </button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2.5 p-4 rounded-3xl border border-dashed border-primary/20 bg-primary/5 mx-1">
            {tags.map((tag, index) => (
              <Badge
                key={`${tag}-${index}`}
                variant="secondary"
                className="h-8 pl-4 pr-2.5 rounded-full text-sm font-semibold animate-in fade-in zoom-in duration-300 transition-all group cursor-default"
              >
                {tag}
                <button
                  type="button"
                  onClick={() =>
                    onTagsChange(tags.filter((_, i) => i !== index))
                  }
                  className="ml-2 p-1 rounded-full hover:bg-destructive text-muted-foreground hover:text-destructive-foreground transition-all opacity-40 group-hover:opacity-100"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Field>
  );
}
