import { GithubProfile, HuggingFaceProfile } from "./profiles";

export interface RepoProfileResponse {
  github?: GithubProfile | null;
  huggingFace?: HuggingFaceProfile | null;
}

export type RepoProfile = GithubProfile | HuggingFaceProfile;
