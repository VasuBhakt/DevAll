import { APIResponse } from "@/src/utils/apiResponse";
import { CPProfile } from "./schema";
import { axios, logger } from "@/src/utils";

class CPService {
  async fetchCPProfile(
    platform: string,
    handle: string
  ): Promise<APIResponse<CPProfile>> {
    try {
      logger.info("Fetch CP profile flow started...");
      const response = await axios.get(
        `/cp-profile/fetch/${platform}/${handle}`
      );
      logger.info("Fetch CP profile successful!");
      return response.data.data;
    } catch (error) {
      logger.error("Fetch CP profile failed :: error :: ", error);
      throw error;
    }
  }

  async getUserCPProfiles(username: string): Promise<APIResponse<CPProfile[]>> {
    try {
      logger.info("Get user CP profiles flow started...");
      const response = await axios.get(`/cp-profile/${username}`);
      logger.info("Get user CP profiles successful!");
      return response.data.data;
    } catch (error) {
      logger.error("Get user CP profiles failed :: error :: ", error);
      throw error;
    }
  }
}

const cpService = new CPService();
export default cpService;
