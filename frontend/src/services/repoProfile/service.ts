import { APIResponse } from "@/utils/apiResponse";
import { RepoProfile, RepoProfileResponse } from "./schema";
import { axios, logger } from "@/utils";

class RepoService {
  async fetchRepoProfile(
    handle: string,
    platform: string
  ): Promise<RepoProfile> {
    try {
      logger.info("Fetch repo flow started...");
      const response = await axios.get(
        `/repo-profile/fetch/${platform}/${handle}`
      );
      logger.info("Repo Profile fetched successfully!");
      return response.data.data;
    } catch (error) {
      logger.error("Fetch repo flow failed :: error :: ", error);
      throw error;
    }
  }

  async getUserRepoProfiles(username: string): Promise<RepoProfileResponse> {
    try {
      logger.info("Get user repo profiles flow started...");
      const response = await axios.get(`/repo-profile/${username}`);
      logger.info("Get user repo profiles successful!");
      return response.data.data;
    } catch (error) {
      logger.error("Get user repo profiles failed :: error :: ", error);
      throw error;
    }
  }

  async deleteRepoProfile(platform: string): Promise<APIResponse<null>> {
    try {
      logger.info("Delete repo flow started...");
      const response = await axios.delete(`/repo-profile/${platform}`);
      logger.info("Delete repo successful!");
      return response.data;
    } catch (error) {
      logger.error("Delete repo failed :: error :: ", error);
      throw error;
    }
  }
}

const repoService = new RepoService();
export default repoService;
