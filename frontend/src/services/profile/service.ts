import { axios, logger } from "@/src/utils";
import { CreateProfileRequest, UpdateProfileRequest } from "./schema";
import { APIResponse } from "@/src/utils/apiResponse";

class ProfileService {
  async createProfile(
    request: CreateProfileRequest
  ): Promise<APIResponse<null>> {
    try {
      logger.info("Create profile flow started...");
      const response = await axios.post("/profile/create", request);
      logger.info("Create profile successful!");
      return response.data;
    } catch (error) {
      logger.error("Create profile failed :: error :: ", error);
      throw error;
    }
  }

  async updateProfile(
    request: UpdateProfileRequest
  ): Promise<APIResponse<null>> {
    try {
      logger.info("Update profile flow started...");
      const response = await axios.patch("/profile/update", request);
      logger.info("Update profile successful!");
      return response.data;
    } catch (error) {
      logger.error("Update profile failed :: error :: ", error);
      throw error;
    }
  }
}

const profileService = new ProfileService();

export default profileService;
