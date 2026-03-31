import { PublicProfileResponse } from "./schema";
import { axios, logger } from "@/utils";

class PublicService {
  async getPublicProfile(username: string): Promise<PublicProfileResponse> {
    try {
      logger.info("Getting public profile flow started...");
      const response = await axios.get(`/public/${username}`);
      logger.info("Public profile fetched successfully!");
      return response.data.data;
    } catch (error) {
      logger.error("Get public profile failed", error);
      throw error;
    }
  }
}

const publicService = new PublicService();
export default publicService;
