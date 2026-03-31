"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProfileService, type UpdateProfileRequest } from "@/services/profile";
import { useAuth } from "@/hooks";
import {
  Mail,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  Bot,
  Gamepad2,
  MessageSquare,
  Edit3,
  Check,
  X,
  Loader2,
  Camera,
  User as UserIcon,
  MousePointer2,
  Twitch,
} from "lucide-react";
import {
  Button,
  Input,
  Textarea,
  Badge,
  MarkdownRenderer,
  SignInRequiredState,
} from "@/components";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const {
    data: profileResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: () => ProfileService.getCurrentUserProfile(),
    retry: false,
  });

  const profile = profileResponse?.data;

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      ProfileService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsEditing(false);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, errors },
  } = useForm<UpdateProfileRequest>();

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        bio: profile.bio || "",
        institute: profile.institute || "",
        organization: profile.organization || "",
        city: profile.city || "",
        country: profile.country || "",
        portfolio_website: profile.portfolio_website || "",
        github: profile.github || "",
        linkedin: profile.linkedin || "",
        xtwitter: profile.xtwitter || "",
        instagram: profile.instagram || "",
        youtube: profile.youtube || "",
        reddit: profile.reddit || "",
        twitch: profile.twitch || "",
        discord: profile.discord || "",
        readme: profile.readme || "",
      });
    }
  }, [profile, reset]);

  const onSave = (data: UpdateProfileRequest) => {
    updateMutation.mutate(data);
  };

  if (isLoading) return <ProfileLoading />;
  if (!authUser) return <SignInRequiredState />;
  if (!profile) return <ProfileLoading />;

  const firstLetter =
    profile.name?.[0]?.toUpperCase() ||
    profile.username?.[0]?.toUpperCase() ||
    "?";

  return (
    <div className="container max-w-5xl mx-auto px-4 py-12 space-y-10 relative">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <UserIcon size={24} />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
              My Profile
            </h1>
          </div>
          <div>
            {isEditing ? (
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    reset();
                  }}
                  className="px-6 py-5.5 text-md font-semibold rounded-full hover:bg-destructive/10 hover:text-destructive transition-all"
                  disabled={updateMutation.isPending}
                >
                  <X size={16} className="mr-2" /> Cancel
                </Button>
                <Button
                  onClick={handleSubmit(onSave)}
                  className="px-6 py-5.5 text-md font-semibold rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all"
                  disabled={!isDirty || updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Check size={16} className="mr-2" /> Save Changes
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="px-6 py-5.5 text-md font-semibold rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Edit3 size={16} className="mr-2" /> Edit Profile
              </Button>
            )}
          </div>
        </div>
        {/* Profile Header Card */}
        <div className="relative p-8 rounded-[2rem] bg-card/40 backdrop-blur-md border border-border/60 shadow-xl overflow-hidden group">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar Section */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center border-4 border-background relative overflow-hidden group/avatar">
                {profile.profile_picture ? (
                  <img
                    src={profile.profile_picture}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl font-black text-primary/80">
                    {firstLetter}
                  </span>
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                    <Camera size={24} className="text-white" />
                  </div>
                )}
              </div>
              <Badge className="absolute h-[24px] -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-background text-foreground border-border/60">
                @{profile.username}
              </Badge>
            </div>

            {/* Basic Info Section */}
            <div className="flex-1 space-y-6 text-center md:text-left pt-2">
              <div className="space-y-1">
                {isEditing ? (
                  <>
                    <Input
                      {...register("name", {
                        required: "Name is required",
                      })}
                      className={cn(
                        `text-3xl h-12 bg-background/50 border-primary/20 focus:border-primary px-3 text-center md:text-left`,
                        `placeholder:text-foreground/30`
                      )}
                      placeholder="Full Name"
                    />
                    {errors.name && (
                      <p className="text-destructive text-sm">
                        {errors.name.message}
                      </p>
                    )}
                  </>
                ) : (
                  <h1 className="text-4xl font-bold text-foreground">
                    {profile.name}
                  </h1>
                )}
                <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground font-medium">
                  <Mail size={16} />
                  <span>{profile.email}</span>
                </div>
              </div>

              <div className="max-w-xl">
                {isEditing ? (
                  <Textarea
                    {...register("bio")}
                    className={cn(
                      "bg-background/20 border-border/40 focus:border-primary/40 min-h-[100px] resize-none text-[16px] leading-relaxed",
                      "placeholder:text-foreground/30"
                    )}
                    placeholder="Write a short bio about yourself..."
                  />
                ) : (
                  <p className="text-muted-foreground text-[16px] leading-relaxed">
                    {profile.bio ||
                      "No bio added yet. Tell people about yourself!"}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2">
                <InfoItem
                  icon={MapPin}
                  label={
                    isEditing
                      ? null
                      : [profile.city, profile.country]
                          .filter(Boolean)
                          .join(", ")
                  }
                  isEditing={isEditing}
                >
                  <div className="flex gap-2">
                    <Input
                      {...register("city")}
                      placeholder="City"
                      className={cn(
                        "h-9 text-xs",
                        "placeholder:text-foreground/30"
                      )}
                    />
                    <Input
                      {...register("country")}
                      placeholder="Country"
                      className={cn(
                        "h-9 text-xs",
                        "placeholder:text-foreground/30"
                      )}
                    />
                  </div>
                </InfoItem>

                <InfoItem
                  icon={Globe}
                  label={isEditing ? null : profile.portfolio_website}
                  isEditing={isEditing}
                  isLink
                >
                  <Input
                    {...register("portfolio_website")}
                    placeholder="Portfolio Website"
                    className={cn(
                      "h-9 text-xs",
                      "placeholder:text-foreground/30"
                    )}
                  />
                </InfoItem>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Social Links Panel */}
          <div className="lg:col-span-1 space-y-8">
            <div className="p-8 rounded-[2rem] bg-card/40 backdrop-blur-md border border-border/60 shadow-lg space-y-6">
              <h3 className="text-xl font-bold uppercase">Social Profiles</h3>

              <div className="space-y-5">
                <SocialInput
                  icon={Github}
                  id="github"
                  label="GitHub"
                  isEditing={isEditing}
                  register={register("github")}
                  value={profile.github}
                  color="text-primary"
                />
                <SocialInput
                  icon={Linkedin}
                  id="linkedin"
                  label="LinkedIn"
                  isEditing={isEditing}
                  register={register("linkedin")}
                  value={profile.linkedin}
                  color="text-blue-500"
                />
                <SocialInput
                  icon={Twitter}
                  id="xtwitter"
                  label="X (Twitter)"
                  isEditing={isEditing}
                  register={register("xtwitter")}
                  value={profile.xtwitter}
                  color="text-blue-400"
                />
                <SocialInput
                  icon={Instagram}
                  id="instagram"
                  label="Instagram"
                  isEditing={isEditing}
                  register={register("instagram")}
                  value={profile.instagram}
                  color="text-pink-700"
                />
                <SocialInput
                  icon={Youtube}
                  id="youtube"
                  label="YouTube"
                  isEditing={isEditing}
                  register={register("youtube")}
                  value={profile.youtube}
                  color="text-red-500"
                />
                <SocialInput
                  icon={Bot}
                  id="reddit"
                  label="Reddit"
                  isEditing={isEditing}
                  register={register("reddit")}
                  value={profile.reddit}
                  color="text-orange-500"
                />
                <SocialInput
                  icon={Twitch}
                  id="twitch"
                  label="Twitch"
                  isEditing={isEditing}
                  register={register("twitch")}
                  value={profile.twitch}
                  color="text-purple-500"
                />
                <SocialInput
                  icon={Gamepad2}
                  id="discord"
                  label="Discord"
                  isEditing={isEditing}
                  register={register("discord")}
                  value={profile.discord}
                  color="text-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Additional Info Panel */}
          <div className="lg:col-span-2 space-y-8">
            <div className="p-8 rounded-[2rem] bg-card/40 backdrop-blur-md border border-border/60 shadow-lg space-y-8 flex flex-col h-full min-h-[400px]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold tracking-tight uppercase">
                  About Me
                </h3>
              </div>

              <div className="flex flex-col gap-10">
                {/* Readme Section */}
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-xs font-bold text-foreground/80 uppercase tracking-widest">
                    Readme
                    {isEditing && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-2 py-0.5"
                      >
                        Markdown Supported
                      </Badge>
                    )}
                  </h4>
                  {isEditing ? (
                    <Textarea
                      {...register("readme")}
                      className={cn(
                        "bg-background/20 min-h-[400px] rounded-2xl resize-none p-4",
                        "placeholder:text-foreground/30 focus:border-primary/40"
                      )}
                      placeholder="Tell the world about your journey, projects, and goals..."
                    />
                  ) : (
                    <div
                      className={cn(
                        "text-[16px] leading-relaxed text-foreground/80 min-h-[100px] prose-styles",
                        !profile.readme && "italic text-muted-foreground/40"
                      )}
                    >
                      {profile.readme ? (
                        <MarkdownRenderer
                          content={profile.readme}
                          className="min-h-[100px] max-h-[600px] overflow-y-auto"
                        />
                      ) : (
                        <span className="italic text-muted-foreground/40">
                          No readme added yet. Describe your journey!
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Institution & Organization stacking */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border/20">
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 text-xs font-bold text-foreground/80 uppercase tracking-widest">
                      Institution
                    </h4>
                    {isEditing ? (
                      <Input
                        {...register("institute")}
                        className="bg-background/10 h-11 rounded-xl border-border/40"
                        placeholder="University or School"
                      />
                    ) : (
                      <div className="flex items-center gap-2 font-semibold text-[18px]">
                        <div className="w-1 h-4 rounded-full bg-primary/40" />
                        {profile.institute || "Not specified"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 text-xs font-bold text-foreground/80 uppercase tracking-widest">
                      Organization
                    </h4>
                    {isEditing ? (
                      <Input
                        {...register("organization")}
                        className="bg-background/10 h-11 rounded-xl border-border/40"
                        placeholder="Current Company"
                      />
                    ) : (
                      <div className="flex items-center gap-2 font-semibold text-[18px]">
                        <div className="w-1 h-4 rounded-full bg-primary/40" />
                        {profile.organization || "Not specified"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  isEditing,
  register,
  placeholder,
  children,
  isLink,
}: any) {
  if (!label && !isEditing && !children) return null;

  return (
    <div className="flex items-center gap-2.5">
      <div className="p-2 rounded-lg bg-secondary/40 text-primary/70 border border-border/20">
        <Icon size={16} />
      </div>
      <div className="text-sm font-medium">
        {isEditing ? (
          children || (
            <Input
              {...register}
              placeholder={placeholder}
              className="h-8 py-1 px-2 text-xs w-48 bg-background/30"
            />
          )
        ) : isLink ? (
          <a
            href={label}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors hover:underline"
          >
            {label?.replace(/^https?:\/\/(www\.)?/, "")}
          </a>
        ) : (
          <span>{label}</span>
        )}
      </div>
    </div>
  );
}

function SocialInput({
  icon: Icon,
  id,
  label,
  isEditing,
  register,
  value,
  color,
}: any) {
  return (
    <div className="group/social">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground/80 uppercase tracking-widest">
          <Icon size={14} className={color} />
          {label}
        </div>
      </div>
      {isEditing ? (
        <Input
          {...register}
          placeholder={`Your ${label} profile URL`}
          className={cn(
            "h-10 bg-background/20 focus:bg-background/40 transition-all text-sm rounded-xl border-border/20",
            "placeholder:text-foreground/30"
          )}
        />
      ) : (
        <div className="relative h-10 px-4 flex items-center bg-secondary/20 rounded-xl border border-border/10 text-sm font-medium overflow-hidden">
          {value ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate hover:text-primary hover:underline transition-all"
            >
              {value}
            </a>
          ) : (
            <span className="text-muted-foreground/40 italic">
              Not connected
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function ProfileLoading() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-12 space-y-8 animate-pulse">
      <div className="h-64 bg-card/40 rounded-[2rem] border border-border/60" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="h-[400px] bg-card/40 rounded-[2rem] border border-border/60" />
        <div className="lg:col-span-2 h-[400px] bg-card/40 rounded-[2rem] border border-border/60" />
      </div>
    </div>
  );
}
