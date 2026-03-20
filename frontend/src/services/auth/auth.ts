import { axios, logger } from "@/src/utils";
import { SigninRequest, SignupRequest } from "./schema";

export class AuthService {
  async signup(request: SignupRequest) {
    try {
      logger.info("Signup flow started...");
      let formData = new FormData();
      formData.append("username", request.username);
      formData.append("email", request.email);
      formData.append("password", request.password);
      const response = await axios.post("/auth/signup", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      logger.info("Signup successful!");
      return response.data;
    } catch (error) {
      logger.error("Signup failed :: error :: ", error);
      throw error;
    }
  }

  async signin(request: SigninRequest) {
    try {
      logger.info("Signin flow started...");
      const response = await axios.post("/auth/signin", request);
      logger.info("Signin successful!");
      return response.data;
    } catch (error) {
      logger.error("Signin failed :: error :: ", error);
      throw error;
    }
  }

  async signout() {}
}
