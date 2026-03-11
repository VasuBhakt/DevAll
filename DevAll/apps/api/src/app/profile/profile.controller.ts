import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Query } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { ProfileDTO,UpdateProfileDTO  } from "./entities/index";
import { APIResponse, GetCurrentUserId, Public } from "@dev-all/helpers";

@Controller('profile')
export class ProfileController {
    constructor(
        private profileService: ProfileService
    ) { }

    @Post('create')
    @HttpCode(HttpStatus.OK)
    async createProfile(
        @Body() profile: ProfileDTO,
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
    @Get()
    @HttpCode(HttpStatus.OK)
    async getProfile(
        @Query('id') id?: string,
        @GetCurrentUserId() loggedInUserId?: string
    ): Promise<APIResponse> {
        const response = await this.profileService.getProfile(id, loggedInUserId);
        return new APIResponse(
            HttpStatus.OK,
            "Profile fetched successfully",
            response
        )
    }

    @Patch('update')
    @HttpCode(HttpStatus.OK)
    async updateProfile(
        @Body() profile: UpdateProfileDTO,
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