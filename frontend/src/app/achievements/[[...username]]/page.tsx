"use client";

import { use, useEffect, useRef, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth } from "@/hooks";
import { AchievementService } from "@/services/achievements";
import {
  AchievementResponse,
  CreateAchievementRequest,
} from "@/services/achievements";
import {
  AchievementCard,
  AchievementCardSkeleton,
} from "@/app/achievements/[[...username]]/AchievementCard";
import { AddEditAchievementModal } from "@/app/achievements/[[...username]]/AddEditAchievementModal";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, MousePointer2, Loader2, Info } from "lucide-react";

interface PageProps {
  params: Promise<{ username?: string[] }>;
}

export default function AchievementsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const targetUsername = resolvedParams.username?.[0]?.toLowerCase();
  const { user, isSignedIn, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  // Authentication & Ownership Logic
  const isOwner =
    !targetUsername || (isSignedIn && user?.username === targetUsername);
  const effectiveUsername = targetUsername || user?.username;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] =
    useState<AchievementResponse | null>(null);

  // Infinite Query for Achievements
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["achievements", effectiveUsername],
      queryFn: ({ pageParam = 1 }) => {
        if (!effectiveUsername) return Promise.resolve([]);
        return isOwner
          ? AchievementService.getCurrentUserAchievements(pageParam, 10)
          : AchievementService.getUserAchievements(
              effectiveUsername,
              pageParam,
              10
            );
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        // Backend returns an array of items. If the last page had fewer than 10 (limit), no more pages.
        return lastPage.length === 10 ? allPages.length + 1 : undefined;
      },
      enabled: !!effectiveUsername,
    });

  // Intersection Observer for Infinite Scroll
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateAchievementRequest) =>
      AchievementService.createAchievement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["achievements", effectiveUsername],
      });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; req: any }) =>
      AchievementService.updateAchievement(data.req, data.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["achievements", effectiveUsername],
      });
      setEditingAchievement(null);
      setIsModalOpen(false);
    },
  });

  const handleSave = async (formData: CreateAchievementRequest) => {
    if (editingAchievement) {
      await updateMutation.mutateAsync({
        id: editingAchievement.id,
        req: formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleEdit = (exp: AchievementResponse) => {
    setEditingAchievement(exp);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this achievement?")) {
      await AchievementService.deleteAchievement(id);
      queryClient.invalidateQueries({
        queryKey: ["achievements", effectiveUsername],
      });
    }
  };

  if (authLoading) return <LoadingState />;
  if (!effectiveUsername && !authLoading && status === "pending")
    return <SignInRequiredState />;

  const allAchievements = data?.pages.flat() || [];

  return (
    <div className="container max-w-5xl mx-auto px-4 py-12 space-y-10 relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Briefcase size={28} />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
              {isOwner
                ? "My Achievements"
                : `${effectiveUsername}'s Achievements`}
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-lg">
            {isOwner
              ? "Tell the story of your key achievements."
              : `Explore what ${effectiveUsername} has achieved.`}
          </p>
        </div>

        {isOwner && (
          <Button
            onClick={() => {
              setEditingAchievement(null);
              setIsModalOpen(true);
            }}
            className="rounded-full px-7 h-11 text-base font-bold hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2" size={20} />
            Add Achievement
          </Button>
        )}
      </div>

      {/* Main List Section */}
      <div className="relative space-y-6 min-h-[400px]">
        {status === "pending" && (
          <div className="space-y-6">
            <AchievementCardSkeleton />
            <AchievementCardSkeleton />
            <AchievementCardSkeleton />
          </div>
        )}

        {status === "success" && allAchievements.length === 0 && (
          <EmptyState isOwner={isOwner} onAdd={() => setIsModalOpen(true)} />
        )}

        {status === "success" && allAchievements.length > 0 && (
          <div className="grid grid-cols-1 gap-6 relative">
            {/* Subtle vertical line for visual flow on larger screens */}
            <div className="absolute left-[30px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-primary/10 via-border/40 to-primary/10 hidden md:block" />

            {allAchievements.map((exp) => (
              <AchievementCard
                key={exp.id}
                achievement={exp}
                isOwner={isOwner}
                onEdit={handleEdit}
                onDelete={handleDelete}
                className="md:ml-12"
              />
            ))}
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        <div
          ref={observerTarget}
          className="h-20 flex items-center justify-center pt-8"
        >
          {isFetchingNextPage && (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 size={32} className="animate-spin text-primary" />
              <span className="text-xs font-medium animate-pulse">
                Gathering more achievements...
              </span>
            </div>
          )}
          {!hasNextPage && allAchievements.length > 0 && (
            <div className="text-muted-foreground text-sm flex items-center gap-2 bg-secondary/20 px-4 py-2 rounded-full border border-border/40">
              <Info size={16} />
              <span>That's all the achievements for now!</span>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddEditAchievementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAchievement(null);
        }}
        achievement={editingAchievement}
        onSave={handleSave}
      />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 size={48} className="animate-spin text-primary" />
      <span className="text-lg font-semibold text-muted-foreground animate-pulse tracking-wide">
        Gathering achievements...
      </span>
    </div>
  );
}

function EmptyState({
  isOwner,
  onAdd,
}: {
  isOwner: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-border/60 rounded-3xl bg-secondary/5 space-y-6 text-center p-8">
      <div className="p-6 rounded-full bg-secondary/20 border border-border/40 text-muted-foreground/40">
        <Briefcase size={48} strokeWidth={1.5} />
      </div>
      <div className="space-y-2 max-w-sm mx-auto">
        <h3 className="text-2xl font-bold tracking-tight text-foreground">
          No achievements found
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {isOwner
            ? "Add your first achievement."
            : "This user hasn't added any professional achievements yet."}
        </p>
      </div>
      {isOwner && (
        <Button
          onClick={onAdd}
          variant="outline"
          className="rounded-full px-8 hover:bg-primary/5 hover:text-primary transition-colors border-primary/20"
        >
          Add Your First Achievement
        </Button>
      )}
    </div>
  );
}

function SignInRequiredState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-6">
      <div className="p-6 rounded-full bg-primary/10 text-primary border border-primary/20">
        <MousePointer2 size={48} />
      </div>
      <div className="space-y-2 max-w-md">
        <h2 className="text-3xl font-bold tracking-tight">Access Restricted</h2>
        <p className="text-muted-foreground text-lg">
          You need to be signed in to view or manage achievements. Join our
          community of builders to showcase yours.
        </p>
      </div>
      <Button
        className="rounded-full px-10 h-12 text-lg font-bold"
        onClick={() => (window.location.href = "/signin")}
      >
        Go to Sign In
      </Button>
    </div>
  );
}
