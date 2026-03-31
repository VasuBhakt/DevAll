"use client";

import { use, useEffect, useRef, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth } from "@/hooks";
import { ProjectService } from "@/services/projects";
import {
  ProjectResponse,
  CreateProjectRequest,
} from "@/services/projects/schema";
import {
  ProjectCard,
  ProjectCardSkeleton,
} from "@/app/projects/[[...username]]/ProjectCard";
import { AddEditProjectModal } from "@/app/projects/[[...username]]/AddEditProjectModal";
import { Button, LoadingState, SignInRequiredState } from "@/components";
import { Plus, Code2, Loader2, Info, Rocket, RefreshCw } from "lucide-react";
import { UserNotFoundState } from "@/components/UserNotFound";

interface PageProps {
  params: Promise<{ username?: string[] }>;
}

export default function ProjectsPage({ params }: PageProps) {
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
  const [editingProject, setEditingProject] = useState<ProjectResponse | null>(
    null
  );

  // Infinite Query for Projects
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading: dataLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["projects", effectiveUsername],
    queryFn: ({ pageParam = 1 }) => {
      if (!effectiveUsername) return Promise.resolve([]);
      // Using common pattern as in experiences/achievements
      return isOwner
        ? ProjectService.getCurrentUserProjects(pageParam, 10)
        : ProjectService.getUserProjects(effectiveUsername, pageParam, 10);
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
    mutationFn: (data: CreateProjectRequest) =>
      ProjectService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", effectiveUsername],
      });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; req: any }) =>
      ProjectService.updateProject(data.req, data.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", effectiveUsername],
      });
      setEditingProject(null);
      setIsModalOpen(false);
    },
  });

  const handleSave = async (formData: CreateProjectRequest) => {
    if (editingProject) {
      await updateMutation.mutateAsync({
        id: editingProject.id,
        req: formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleEdit = (proj: ProjectResponse) => {
    setEditingProject(proj);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      await ProjectService.deleteProject(id);
      queryClient.invalidateQueries({
        queryKey: ["projects", effectiveUsername],
      });
    }
  };

  if (authLoading) return <LoadingState message="Gathering Projects..." />;
  if (!effectiveUsername && !authLoading && status === "pending")
    return <SignInRequiredState />;
  if (!data && !dataLoading)
    return <UserNotFoundState username={effectiveUsername!} />;

  const allProjects = data?.pages.flat() || [];

  return (
    <div className="container max-w-5xl mx-auto px-4 py-12 space-y-10 relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Code2 size={28} />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
              {isOwner ? "My Projects" : `${effectiveUsername}'s Projects`}
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-lg">
            {isOwner
              ? "Share your latest engineering projects and technical prototypes."
              : `Take a look at what ${effectiveUsername} has been building.`}
          </p>
        </div>

        {isOwner && (
          <Button
            onClick={() => {
              setEditingProject(null);
              setIsModalOpen(true);
            }}
            size="lg"
            className="rounded-full px-7 h-11 text-base font-bold hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2" size={20} />
            Add Project
          </Button>
        )}
      </div>

      {/* Main List Section */}
      <div className="relative space-y-6 min-h-[400px]">
        {status === "pending" && (
          <div className="space-y-6">
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
          </div>
        )}

        {status === "success" && allProjects.length === 0 && (
          <EmptyState isOwner={isOwner} onAdd={() => setIsModalOpen(true)} />
        )}

        {allProjects.length > 0 && (
          <div className="grid grid-cols-1 gap-6 relative">
            {/* Subtle vertical line for visual flow on larger screens */}
            <div className="absolute left-[30px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-primary/10 via-border/40 to-primary/10 hidden md:block" />

            {allProjects.map((proj) => (
              <ProjectCard
                key={proj.id}
                project={proj}
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
              <span className="text-xs font-medium nimate-pulse">
                Fetching more projects
              </span>
            </div>
          )}
          {!hasNextPage && allProjects.length > 0 && status === "success" && (
            <div className="text-muted-foreground text-sm flex items-center gap-2 bg-secondary/20 px-4 py-2 rounded-full border border-border/40">
              <Rocket size={16} className="text-primary/60" />
              <span>You've reached the end of the roadmap!</span>
            </div>
          )}
          {isError && allProjects.length > 0 && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="text-destructive text-sm font-medium flex items-center gap-2 bg-destructive/10 px-4 py-2 rounded-full border border-destructive/20">
                <Info size={16} />
                <span>Failed to continue the roadmap.</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                className="rounded-full gap-2 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30"
              >
                <RefreshCw size={14} />
                Resume Exploration
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddEditProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        project={editingProject}
        onSave={handleSave}
      />
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
        <Code2 size={48} strokeWidth={1.5} />
      </div>
      <div className="space-y-2 max-w-sm mx-auto">
        <h3 className="text-2xl font-bold tracking-tight text-foreground">
          No projects found
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {isOwner
            ? "Launch your first project today."
            : "This user hasn't published any public projects yet."}
        </p>
      </div>
      {isOwner && (
        <Button
          onClick={onAdd}
          variant="outline"
          className="rounded-full px-8 hover:bg-primary/5 hover:text-primary transition-colors border-primary/20"
        >
          Add Your First Project
        </Button>
      )}
    </div>
  );
}
