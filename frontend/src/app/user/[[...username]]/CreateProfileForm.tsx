"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProfileService, type CreateProfileRequest } from "@/services/profile";
import { Button, Input, Textarea } from "@/components";
import { User, Loader2, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateProfileFormProps {
  onSuccess?: () => void;
  defaultName?: string;
}

export function CreateProfileForm({
  onSuccess,
  defaultName = "",
}: CreateProfileFormProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProfileRequest>({
    defaultValues: {
      name: defaultName,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProfileRequest) =>
      ProfileService.createProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["public-profile"] });
      onSuccess?.();
    },
  });

  const onSubmit = (data: CreateProfileRequest) => {
    createMutation.mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 p-10 bg-card/30 backdrop-blur-xl border border-border/40 rounded-[3rem] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight uppercase leading-none items-center">
            Launch Your Identity
          </h2>
          <p className="text-muted-foreground font-medium">
            {" "}
            Create your developer profile to start showcasing your journey.
          </p>
        </div>
      </div>

      <div className="space-y-6 pt-4">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-foreground ml-1">
            Full Name <span className="text-destructive">*</span>
          </label>
          <Input
            {...register("name", { required: "Display name is required" })}
            placeholder="How the world will see you..."
            className={cn(
              "h-12 bg-background/50 border-border/60 rounded-2xl text-lg px-3 focus:border-primary transition-all",
              "placeholder:text-foreground/20"
            )}
          />
          {errors.name && (
            <p className="text-destructive text-[11px] font-bold uppercase tracking-widest ml-1 animate-in slide-in-from-left-2 duration-300">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-foreground/70 ml-1">
            Bio
          </label>
          <Textarea
            {...register("bio")}
            placeholder="Tell us about your technical journey in a sentence or two..."
            className={cn(
              "h-24 bg-background/50 border-border/60 rounded-2xl text-lg px-3 py-3 focus:border-primary transition-all resize-none",
              "placeholder:text-foreground/20"
            )}
            maxLength={220}
          />
        </div>
      </div>

      <Button
        className="w-full h-12 rounded-2xl font-bold uppercase tracking-widest gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? (
          <Loader2 size={24} className="animate-spin" />
        ) : (
          <>
            <Check size={24} />
            Create My Profile
          </>
        )}
      </Button>

      <p className="text-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed">
        By creating a profile, you agree to make your <br /> content publicly
        visible on your dashboard.
      </p>
    </form>
  );
}
