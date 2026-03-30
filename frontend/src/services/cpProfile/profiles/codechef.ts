export interface CodechefContest {
  contest_name: string;
  rank: number;
  rating: number;
  date: Date;
}

export interface CodechefProfile {
  handle: string;
  profile_link: string;
  rating: number;
  max_rating: number;
  rank: string;
  contests: CodechefContest[];
  avatar?: string | null;
}
