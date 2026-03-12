import { PrismaService } from "@dev-all/database";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class LCProfileFetcher {
    constructor(private prisma: PrismaService) { }

    private readonly GRAPHQL_URL = "https://leetcode.com/graphql";

    async fetch(username: string, userId: string) {
        try {
            const query = `
                query getUserData($username: String!) {
                    matchedUser(username: $username) {
                        username
                        submitStats: submitStatsGlobal {
                            acSubmissionNum {
                                difficulty
                                count
                                submissions
                            }
                        }
                        badges {
                            name
                            displayName
                        }
                    }
                    userContestRanking(username: $username) {
                        attendedContestsCount
                        rating
                        globalRanking
                        topPercentage
                    }
                    userContestRankingHistory(username: $username) {
                        attended
                        rating
                        contest {
                            title
                            startTime
                        }
                    }
                }
            `;

            const response = await axios.post(
                this.GRAPHQL_URL,
                {
                    query,
                    variables: { username },
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "User-Agent": "Mozilla/5.0",
                        "Referer": "https://leetcode.com/",
                    },
                }
            );

            if (response.data.errors) {
                throw new Error(response.data.errors[0].message);
            }

            const data = response.data.data;
            const matchedUser = data.matchedUser;

            if (!matchedUser) {
                throw new Error("User not found");
            }

            // Extract problem count
            let easy = 0, medium = 0, hard = 0, total = 0;
            const acSubmissionNum = matchedUser.submitStats?.acSubmissionNum || [];

            for (const item of acSubmissionNum) {
                if (item.difficulty === "All") total = item.count;
                if (item.difficulty === "Easy") easy = item.count;
                if (item.difficulty === "Medium") medium = item.count;
                if (item.difficulty === "Hard") hard = item.count;
            }

            // Extract rating & max rating
            const ranking = data.userContestRanking;
            const history = data.userContestRankingHistory || [];
            const attendedHistory = history.filter((h: any) => h.attended);

            let currentRating = null;
            let maxRating = null;

            if (ranking && ranking.rating) {
                currentRating = Math.round(ranking.rating);
            }

            if (attendedHistory.length > 0) {
                maxRating = Math.max(...attendedHistory.map((h: any) => h.rating));
                maxRating = Math.round(maxRating);
            }

            // Extract badge
            let badgeName = null;
            if (matchedUser.badges && matchedUser.badges.length > 0) {
                badgeName = matchedUser.badges[0].displayName || matchedUser.badges[0].name;
            }

            // Write to database
            await this.prisma.client.cP_Profile.upsert({
                where: {
                    user_id_platform: {
                        user_id: userId,
                        platform: "LEETCODE",
                    },
                },
                update: {
                    rating: currentRating,
                    max_rating: maxRating,
                    easy_problems: easy,
                    medium_problems: medium,
                    hard_problems: hard,
                    problems_solved: total,
                    badge: badgeName,
                    contests: attendedHistory,
                    updated_at: new Date(),
                },
                create: {
                    user_id: userId,
                    platform: "LEETCODE",
                    username: username,
                    profile_link: `https://leetcode.com/u/${username}/`,
                    rating: currentRating,
                    max_rating: maxRating,
                    easy_problems: easy,
                    medium_problems: medium,
                    hard_problems: hard,
                    problems_solved: total,
                    badge: badgeName,
                    contests: attendedHistory,
                    updated_at: new Date(),
                },
            });

            console.log("LeetCode profile fetched successfully");
            return "Profile synced successfully";
        } catch (error) {
            console.error("LeetCode Fetch Error:", error);
            throw new HttpException(
                `Failed to sync LeetCode profile :: ${error instanceof Error ? error.message : "Unknown error"}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }
}
