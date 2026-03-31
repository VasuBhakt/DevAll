export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
}

export interface SigninRequest {
  identifier: string;
  password: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  role: string;
  email: string;
}
