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
  organization: string;
  start_date: Date;
  end_date: Date | null;
  job_title: string;
  description: string;
  skills: string[] | null;
  location: string | null;
  id: string;
  user_id: string;
}
