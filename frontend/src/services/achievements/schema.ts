export interface CreateAchievementRequest {
  title: string;
  description?: string | null;
  certificate_link?: string | null;
  organization?: string | null;
  event?: string | null;
  event_date?: Date | null;
  event_link?: string | null;
}

export interface UpdateAchievementRequest extends Partial<CreateAchievementRequest> {}

export interface AchievementResponse {
  id: string;
  title: string;
  description?: string | null;
  certificate_link?: string | null;
  organization?: string | null;
  event?: string | null;
  event_date?: Date | null;
  event_link?: string | null;
}
