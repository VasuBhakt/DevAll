import { LargeNumberLike } from "crypto";

export interface HuggingFaceModel {
  id: string;
  name: string;
  likes: number;
  downloads: number;
  pipeline_tag?: string | null;
}

export interface HuggingFaceSpace {
  id: string;
  name: string;
  likes: number;
  sdk?: string | null;
}

export interface HuggingFaceDataset {
  id: string;
  name: string;
  likes: number;
  downloads: number;
}

export interface HuggingFaceProfile {
  handle: string;
  profile_link: string;
  followers_count: number;
  likes_count: number;
  public_repo_count: number;
  models: HuggingFaceModel[];
  spaces: HuggingFaceSpace[];
  datasets: HuggingFaceDataset[];
}
