import { APIResponse } from "@/src/utils/apiResponse";
import {
  CreateProjectRequest,
  ProjectResponse,
  UpdateProjectRequest,
} from "./schema";
import { axios, logger } from "@/src/utils";

class ProjectService {
  async createProject(
    request: CreateProjectRequest
  ): Promise<APIResponse<null>> {
    try {
      logger.info("Create project flow started...");
      const response = await axios.post("/projects/create", request);
      logger.info("Create project successful!");
      return response.data;
    } catch (error) {
      logger.error("Create project failed :: error :: ", error);
      throw error;
    }
  }

  async updateProject(
    request: UpdateProjectRequest,
    project_id: string
  ): Promise<APIResponse<null>> {
    try {
      logger.info("Update project flow started...");
      const response = await axios.patch(
        `/projects/update/${project_id}`,
        request
      );
      logger.info("Update project successful!");
      return response.data;
    } catch (error) {
      logger.error("Update project failed :: error :: ", error);
      throw error;
    }
  }

  async getCurrentUserProjects(
    page: number = 1,
    limit: number = 10
  ): Promise<ProjectResponse[]> {
    try {
      logger.info("Get current user projects flow started...");
      const response = await axios.get(`/projects`, {
        params: {
          page: page,
          limit: limit,
        },
      });
      logger.info("Get current user projects successful!");
      return response.data.data.items;
    } catch (error) {
      logger.error("Get current user projects failed :: error :: ", error);
      throw error;
    }
  }

  async deleteProject(project_id: string): Promise<APIResponse<null>> {
    try {
      logger.info("Delete project flow started...");
      const response = await axios.delete(`/projects/delete/${project_id}`);
      logger.info("Delete project successful!");
      return response.data;
    } catch (error) {
      logger.error("Delete project failed :: error :: ", error);
      throw error;
    }
  }

  // PUBLIC ENDPOINT
  async getUserProjects(
    username: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ProjectResponse[]> {
    try {
      logger.info("Get user projects flow started...");
      const response = await axios.get(`/projects/${username}`, {
        params: {
          page: page,
          limit: limit,
        },
      });
      logger.info("Get user projects successful!");
      return response.data.data.items;
    } catch (error) {
      logger.error("Get user projects failed :: error :: ", error);
      throw error;
    }
  }
}

const projectService = new ProjectService();
export default projectService;
