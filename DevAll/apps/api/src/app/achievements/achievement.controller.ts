import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from "@nestjs/common";
import { AchievementService } from "./achievement.service";
import { AchievementDTO, UpdateAchievementDTO } from "./entities";
import { APIResponse, GetCurrentUserId, Public } from "@dev-all/helpers";

@Controller('Achievement')
export class AchievementController {
    constructor(
        private achievementService: AchievementService
    ) {}

    @Post('create')
    @HttpCode(HttpStatus.OK)
    async createAchievement(
        @Body() achievement: AchievementDTO,
        @GetCurrentUserId() userId: string
    ): Promise<APIResponse> {
        const response = await this.achievementService.createAchievement(achievement, userId)
        return new APIResponse(
            HttpStatus.OK,
            response,
            {}
        )
    }

    @Public()
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getAchievement(
        @Param('id') achievementId : string,
    ): Promise<APIResponse> {
        const response = await this.achievementService.getAchievement(achievementId)
        return new APIResponse(
            HttpStatus.OK,
            "Achievement fetched successfully",
            response
        )
    }

    @Patch('update/:id')
    @HttpCode(HttpStatus.OK)
    async updateAchievement(
        @Body() dto: UpdateAchievementDTO,
        @Param('id') achievementId: string
    ) :Promise<APIResponse> {
        const response = await this.achievementService.updateAchievement(dto, achievementId);
        return new APIResponse(
            HttpStatus.OK,
            response,
            {}
        )
    }

    @Delete('delete')
    @HttpCode(HttpStatus.OK)
    async deleteAchievement(
        @GetCurrentUserId() achievementId: string
    ): Promise<APIResponse> {
        const response = await this.achievementService.deleteAchievement(achievementId);
        return new APIResponse(
            HttpStatus.OK,
            response,
            {}
        )
    }
}