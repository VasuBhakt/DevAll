export interface LeetcodeContest {
  contest_name: string;
  rank: number;
  rating: number;
  date: Date;
}

export interface LeetcodeProfile {
  handle: string;
  profile_link: string;
  rating: number;
  problems_solved: number;
  easy_problems: number;
  medium_problems: number;
  hard_problems: number;
  rank: string;
  contests: LeetcodeContest[];
}
