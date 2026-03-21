import { axios, logger } from "@/src/utils";
import {
  AchievementResponse,
  CreateAchievementRequest,
  UpdateAchievementRequest,
} from "./schema";
import { APIResponse } from "@/src/utils/apiResponse";

class AchievementService {
  async createAchievement(
    request: CreateAchievementRequest
  ): Promise<APIResponse<null>> {
    try {
      logger.info("Create achievement flow started...");
      const response = await axios.post("/achievements/create", request);
      logger.info("Create achievement successful!");
      return response.data;
    } catch (error) {
      logger.error("Create achievement failed :: error :: ", error);
      throw error;
    }
  }

  async updateAchievement(
    request: UpdateAchievementRequest,
    achievement_id: string
  ): Promise<APIResponse<null>> {
    try {
      logger.info("Update achievement flow started...");
      const response = await axios.patch(
        `/achievements/update/${achievement_id}`,
        request
      );
      logger.info("Update achievement successful!");
      return response.data;
    } catch (error) {
      logger.error("Update achievement failed :: error :: ", error);
      throw error;
    }
  }

  async getCurrentUserAchievements(
    page: number = 1,
    limit: number = 10
  ): Promise<AchievementResponse[]> {
    try {
      logger.info("Get current user achievements flow started...");
      const response = await axios.get(`/achievements`, {
        params: {
          page: page,
          limit: limit,
        },
      });
      logger.info("Get current user achievements successful!");
      return response.data.data.items;
    } catch (error) {
      logger.error("Get current user achievements failed :: error :: ", error);
      throw error;
    }
  }

  async deleteAchievement(achievement_id: string): Promise<APIResponse<null>> {
    try {
      logger.info("Delete achievement flow started...");
      const response = await axios.delete(
        `/achievements/delete/${achievement_id}`
      );
      logger.info("Delete achievement successful!");
      return response.data;
    } catch (error) {
      logger.error("Delete achievement failed :: error :: ", error);
      throw error;
    }
  }

  // PUBLIC ENDPOINT
  async getUserAchievements(
    username: string,
    page: number = 1,
    limit: number = 10
  ): Promise<AchievementResponse[]> {
    try {
      logger.info("Get user achievements flow started...");
      const response = await axios.get(`/achievements/${username}`, {
        params: {
          page: page,
          limit: limit,
        },
      });
      logger.info("Get user achievements successful!");
      return response.data.data.items;
    } catch (error) {
      logger.error("Get user achievements failed :: error :: ", error);
      throw error;
    }
  }
}

const achievementService = new AchievementService();
export default achievementService;
