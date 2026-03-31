import { CreateProfileRequest as PublicProfileData } from "../profile";
import { ExperienceResponse as PublicExperience } from "../experiences";
import { ProjectResponse as PublicProject } from "../projects";
import { AchievementResponse as PublicAchievement } from "../achievements";

export interface PublicCPProfile {
  platform: string;
  handle: string;
  rating: number;
  max_rating?: number | null;
  rank?: string;
  max_rank?: string | null;
  problems_solved?: number | null;
  easy_problems?: number | null;
  medium_problems?: number | null;
  hard_problems?: number | null;
}

export interface PublicRepoResponse {
  platform: string;
  profile_link: string;
  followers_count?: number | null;
  public_repo_count?: number | null;
  likes_count?: number | null;
  contribution_count?: number | null;
  papers_count?: number | null;
}

export interface PublicProfileResponse {
  username: string;
  email: string;
  profile?: PublicProfileData | null;
  projects: PublicProject[];
  experiences: PublicExperience[];
  achievements: PublicAchievement[];
  cp_profiles: PublicCPProfile[];
  repo_profiles: PublicRepoResponse[];
}
