import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { createProfileDTO } from "./entities/createProfileDTO";
import { APIResponse, GetCurrentUserId, Public } from "@dev-all/helpers";
import { updateProfileDTO } from "./entities/updateProfileDTO";

@Controller('profile')
export class ProfileController {
    constructor(
        private profileService : ProfileService
    ) {}

    @Post('create-profile')
    @HttpCode(HttpStatus.OK)
    async createProfile(
        @Body() profile: createProfileDTO,
        @GetCurrentUserId() id: string
    ): Promise<APIResponse> {
        const response = await this.profileService.createProfile(profile, id);
        return new APIResponse(
            HttpStatus.OK,
            response,
            {}
        )
    }

    @Public()
    @Get(':id?')
    @HttpCode(HttpStatus.OK)
    async getProfile(
        @Param('id') id?: string,
        @GetCurrentUserId() loggedInUserId?: string
    ): Promise<APIResponse> {
        const response = await this.profileService.getProfile(id, loggedInUserId);
        return new APIResponse(
            HttpStatus.OK,
            "Profile fetched successfully",
            response
        )
    }

    @Patch('update-profile')
    @HttpCode(HttpStatus.OK)
    async updateProfile(
        @Body() profile: updateProfileDTO,
        @GetCurrentUserId() id: string
    ) {
        const response = await this.profileService.updateProfile(profile, id);
        return new APIResponse(
            HttpStatus.OK,
            response,
            {}
        )
    }
}