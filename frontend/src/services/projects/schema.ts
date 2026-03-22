export interface CreateProjectRequest {
  name: string;
  description: string;
  tech_stack?: string[] | null;
  domains?: string[] | null;
  languages?: string[] | null;
  github_link?: string | null;
  project_link?: string | null;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {}

export interface ProjectResponse {
  name: string;
  description: string;
  tech_stack?: string[] | null;
  domains?: string[] | null;
  languages?: string[] | null;
  github_link?: string | null;
  project_link?: string | null;
  project_date?: Date | null;
}
