import { axios, logger } from "@/utils";
import {
  ResetPasswordRequest,
  SigninRequest,
  SignupRequest,
  User,
} from "./schema";
import { APIResponse } from "@/utils/apiResponse";

class AuthService {
  async signup(request: SignupRequest): Promise<APIResponse<null>> {
    try {
      logger.info("Signup flow started...");
      const response = await axios.post("/auth/signup", request);
      logger.info("Signup successful!");
      return response.data;
    } catch (error) {
      logger.error("Signup failed :: error :: ", error);
      throw error;
    }
  }

  async signin(request: SigninRequest): Promise<APIResponse<User>> {
    try {
      logger.info("Signin flow started...");
      const response = await axios.post("/auth/signin", request);
      logger.info("Signin successful!");
      return response.data.data;
    } catch (error) {
      logger.error("Signin failed :: error :: ", error);
      throw error;
    }
  }

  async signout(): Promise<APIResponse<null>> {
    try {
      logger.info("Signout flow started...");
      const response = await axios.post("/auth/signout");
      logger.info("Signout successful!");
      return response.data;
    } catch (error) {
      logger.error("Signout failed :: error :: ", error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<APIResponse<User> | null> {
    try {
      logger.info("Get current user flow started...");
      const response = await axios.get("/auth/me");
      logger.info("Get current user successful!");
      return response.data;
    } catch (error) {
      logger.error("Get current user failed :: error :: ", error);
      return null;
    }
  }

  async forgotPassword(email: string): Promise<APIResponse<null>> {
    try {
      logger.info("Forgot password flow started...");
      const response = await axios.post("/auth/forgot-password", { email });
      logger.info("Forgot password successful!");
      return response.data;
    } catch (error) {
      logger.error("Forgot password failed :: error :: ", error);
      throw error;
    }
  }

  async resetPassword({
    password,
    token,
  }: ResetPasswordRequest): Promise<APIResponse<null>> {
    try {
      logger.info("Reset password flow started...");
      const response = await axios.post(`/auth/reset-password/${token}`, {
        password,
      });
      logger.info("Reset password successful!");
      return response.data;
    } catch (error) {
      logger.error("Reset password failed :: error :: ", error);
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<APIResponse<null>> {
    try {
      logger.info("Verify email flow started...");
      const response = await axios.get(`/auth/verify-email/${token}`);
      logger.info("Verify email successful!");
      return response.data;
    } catch (error) {
      logger.error("Verify email failed :: error :: ", error);
      throw error;
    }
  }

  async deleteAccount() {
    try {
      logger.info("Delete account flow started...");
      const response = await axios.delete("/auth/delete");
      logger.info("Delete account successful!");
      return response.data;
    } catch (error) {
      logger.error("Delete account failed :: error :: ", error);
      throw error;
    }
  }
}

const authService = new AuthService();

export default authService;
