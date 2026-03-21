export interface CodeforcesContest {
  contest_id: number;
  contest_name: string;
  rank: number;
  old_rating: number;
  new_rating: number;
}

export interface CodeforcesProfile {
  handle: string;
  profile_link: string;
  rating: number;
  max_rating: number;
  rank: number;
  max_rank: number;
  contests: CodeforcesContest[];
}
