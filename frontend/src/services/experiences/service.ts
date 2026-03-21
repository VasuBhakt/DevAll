import { APIResponse } from "@/src/utils/apiResponse";
import {
  CreateExperienceRequest,
  ExperienceResponse,
  UpdateExperienceRequest,
} from "./schema";
import { axios, logger } from "@/src/utils";

class ExperienceService {
  async createExperience(
    request: CreateExperienceRequest
  ): Promise<APIResponse<null>> {
    try {
      logger.info("Create experience flow started...");
      const response = await axios.post("/experiences/create", request);
      logger.info("Create experience successful!");
      return response.data;
    } catch (error) {
      logger.error("Create experience failed :: error :: ", error);
      throw error;
    }
  }

  async updateExperience(
    request: UpdateExperienceRequest,
    experience_id: string
  ): Promise<APIResponse<null>> {
    try {
      logger.info("Update experience flow started...");
      const response = await axios.patch(
        `/experiences/update/${experience_id}`,
        request
      );
      logger.info("Update experience successful!");
      return response.data;
    } catch (error) {
      logger.error("Update experience failed :: error :: ", error);
      throw error;
    }
  }

  async getCurrentUserExperiences(
    page: number = 1,
    limit: number = 10
  ): Promise<ExperienceResponse[]> {
    try {
      logger.info("Get current user experiences flow started...");
      const response = await axios.get(`/experiences`, {
        params: {
          page: page,
          limit: limit,
        },
      });
      logger.info("Get current user experiences successful!");
      return response.data.data.items;
    } catch (error) {
      logger.error("Get current user experiences failed :: error :: ", error);
      throw error;
    }
  }

  async deleteExperience(experience_id: string): Promise<APIResponse<null>> {
    try {
      logger.info("Delete experience flow started...");
      const response = await axios.delete(
        `/experiences/delete/${experience_id}`
      );
      logger.info("Delete experience successful!");
      return response.data;
    } catch (error) {
      logger.error("Delete experience failed :: error :: ", error);
      throw error;
    }
  }

  // PUBLIC ENDPOINT
  async getUserExperiences(
    username: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ExperienceResponse[]> {
    try {
      logger.info("Get user experiences flow started...");
      const response = await axios.get(`/experiences/${username}`, {
        params: {
          page: page,
          limit: limit,
        },
      });
      logger.info("Get user experiences successful!");
      return response.data.data.items;
    } catch (error) {
      logger.error("Get user experiences failed :: error :: ", error);
      throw error;
    }
  }
}

const experienceService = new ExperienceService();
export default experienceService;
