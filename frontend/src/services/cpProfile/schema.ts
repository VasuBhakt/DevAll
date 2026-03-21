import {
  AtcoderProfile,
  CodechefProfile,
  CodeforcesProfile,
  LeetcodeProfile,
} from "./profiles";

export interface CPProfileResponse {
  codeforces?: CodeforcesProfile | null;
  leetcode?: LeetcodeProfile | null;
  codechef?: CodechefProfile | null;
  atcoder?: AtcoderProfile | null;
}

export type CPProfile =
  | CodeforcesProfile
  | LeetcodeProfile
  | CodechefProfile
  | AtcoderProfile;
