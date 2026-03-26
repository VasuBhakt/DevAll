export interface CreateProfileRequest {
  name: string;
  bio?: string | null;
  profile_picture?: string | null;
  institute?: string | null;
  organization?: string | null;
  readme?: string | null;
  city?: string | null;
  country?: string | null;
  portfolio_website?: string | null;

  linkedin?: string | null;
  github?: string | null;
  xtwitter?: string | null;
  instagram?: string | null;
  reddit?: string | null;
  youtube?: string | null;
  twitch?: string | null;
  discord?: string | null;
}

export interface UpdateProfileRequest extends Partial<CreateProfileRequest> {}

export interface ProfileResponse extends CreateProfileRequest {
  email: string;
  username: string;
}
