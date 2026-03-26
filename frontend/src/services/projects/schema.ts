export interface CreateProjectRequest {
  name: string;
  description: string;
  tech_stack?: string[] | null;
  domains?: string[] | null;
  languages?: string[] | null;
  github_link?: string | null;
  project_link?: string | null;
  project_date?: Date | null;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {}

export interface ProjectResponse {
  id: string;
  user_id: string;
  name: string;
  description: string;
  tech_stack?: string[] | null;
  domains?: string[] | null;
  languages?: string[] | null;
  github_link?: string | null;
  project_link?: string | null;
  project_date?: Date | null;
}
