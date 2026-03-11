import { PrismaService } from "@dev-all/database";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { AchievementDTO, UpdateAchievementDTO } from "./entities";

@Injectable()
export class AchievementService {

    constructor(
        private prisma : PrismaService
    ) {}

    async createAchievement(dto: AchievementDTO, userId: string): Promise<string> {
        if(!dto.title) {
            throw new HttpException(
                "Achievement Name is required",
                HttpStatus.BAD_REQUEST
            )
        }
        await this.prisma.client.achievement.create({
            data: {
                ...dto,
                user_id: userId
            }
        })
        return "Achievement created successfully!";
    } 

    async getAchievement(achievementId: string): Promise<AchievementDTO> {
        const achievement = await this.prisma.client.achievement.findFirst({
            where: {
                id: achievementId
            }
        })
        if(!achievement) {
            throw new HttpException(
                "Achievement not found",
                HttpStatus.BAD_REQUEST
            )
        }
        const {user_id, created_at, updated_at, ...data} = achievement;
        return data as AchievementDTO;
    }

    async updateAchievement(dto: UpdateAchievementDTO, achievementId : string): Promise<string> {
        await this.prisma.client.achievement.update({
            where: {
                id: achievementId
            },
            data: {
                ...dto
            }
        })
        return "Achievement Updated successfully!"
    }

    async deleteAchievement(achievementId: string): Promise<string> {
        await this.prisma.client.achievement.delete({
            where: {
                id: achievementId
            }
        })
        return "Achievement deleted successfully!"
    }
}