import { PrismaService } from "@dev-all/database";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class CFProfileFetcher {
    constructor(
        private prisma: PrismaService
    ) { }

    private readonly BASE_URL = "https://codeforces.com/api/"

    async fetch(username: string, userId: string) {
        try {
            // fetch data
            const userUrl = `${this.BASE_URL}user.info?handles=${username}`
            const contestUrl = `${this.BASE_URL}user.rating?handle=${username}`
            const [userRes, contestRes] = await Promise.all([
                axios.get(userUrl),
                axios.get(contestUrl)
            ])
            const userInfo = userRes.data.result[0]
            const contestInfo = contestRes.data.result
            // write to database
            await this.prisma.client.cP_Profile.upsert({
                where: {
                    user_id_platform: {
                        user_id: userId,
                        platform: "CODEFORCES"
                    }
                },
                update: {
                    rating: userInfo.rating,
                    max_rating: userInfo.maxRating,
                    badge: userInfo.rank,
                    contests: contestInfo,
                    updated_at: new Date()
                },
                create: {
                    user_id: userId,
                    platform: "CODEFORCES",
                    username: username,
                    profile_link: `https://codeforces.com/profile/${username}`,
                    rating: userInfo.rating,
                    max_rating: userInfo.maxRating,
                    badge: userInfo.rank,
                    contests: contestInfo,
                    updated_at: new Date()
                }
            })
            console.log("fetched successfully")
            return "Profile synced successfully"
        } catch (error) {
            console.error(error);
            throw new HttpException(
                `Failed to sync profile :: ${error}`,
                HttpStatus.BAD_REQUEST
            )
        }
    }
}