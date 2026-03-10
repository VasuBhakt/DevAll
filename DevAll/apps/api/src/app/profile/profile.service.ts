import { PrismaService, Profile } from "@dev-all/database";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { createProfileDTO } from "./entities/createProfileDTO";
import { updateProfileDTO } from "./entities/updateProfileDTO";

@Injectable()
export class ProfileService {
    constructor(
        private prisma: PrismaService
    ) {}

    async createProfile(dto: createProfileDTO, userId: string): Promise<string> {
        if(!dto.name) {
            throw new HttpException(
                "Name is required",
                HttpStatus.BAD_REQUEST
            )
        }
        await this.prisma.client.profile.create({
            data: {
                ...dto,
                user_id: userId,
            }
        })
        return "Profile created successfully!"
    }

    async getProfile(userId?: string, loggedInUserId? : string): Promise<Profile> {
        if(!userId && !loggedInUserId) {
            throw new HttpException(
                "Provide valid userId",
                HttpStatus.BAD_REQUEST
            )
        }
        if(userId) {
            const profile = await this.prisma.client.profile.findFirst({
                where: {
                    user_id: userId
                }
            })
            if(!profile) {
                throw new HttpException(
                    "Profile not found",
                    HttpStatus.BAD_REQUEST
                )
            }
            return profile;
        }
        const loggedInProfile = await this.prisma.client.profile.findFirst({
            where: {
                user_id: loggedInUserId
            }
        })
        if(!loggedInProfile) {
            throw new HttpException(
                "Profile not found",
                HttpStatus.BAD_REQUEST
            )
        }
        return loggedInProfile;
        
    }

    async updateProfile(dto: updateProfileDTO, userId: string): Promise<string> {
        await this.prisma.client.profile.update({
            where: {
                user_id: userId
            },
            data: {
                ...dto
            }
        })
        return "Profile Updated successfully!"
    }
}