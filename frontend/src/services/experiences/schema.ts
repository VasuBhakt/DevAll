export interface CreateExperienceRequest {
  organization: string;
  start_date: Date;
  end_date?: Date | null;
  job_title: string;
  description: string;
  skills?: string[] | null;
  location?: string | null;
}

export interface UpdateExperienceRequest extends Partial<CreateExperienceRequest> {}

export interface ExperienceResponse {
  id: string;
  user_id: string;
  organization: string;
  start_date: Date; // Backend sends strings, we parse them to Date objects in the UI
  end_date?: Date | null;
  job_title: string;
  description: string;
  skills?: string[] | null;
  location?: string | null;
}
