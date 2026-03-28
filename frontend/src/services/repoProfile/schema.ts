import { GithubProfile, HuggingFaceProfile } from "./profiles";

export interface RepoProfileResponse {
  github?: GithubProfile | null;
  hugging_face?: HuggingFaceProfile | null;
}

export type RepoProfile = GithubProfile | HuggingFaceProfile;
