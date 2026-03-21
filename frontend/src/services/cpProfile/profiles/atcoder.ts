export interface AtcoderContest {
  contest_name: string;
  rank: number;
  rating: number;
  date: Date;
}

export interface AtcoderProfile {
  handle: string;
  profile_link: string;
  rating: number;
  max_rating: number;
  rank: number;
  max_rank: number;
  contests: AtcoderContest[];
}
