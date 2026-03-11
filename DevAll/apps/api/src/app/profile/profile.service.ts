import { PrismaService } from "@dev-all/database";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ProfileDTO, UpdateProfileDTO} from "./entities/index";

@Injectable()
export class ProfileService {
    constructor(
        private prisma: PrismaService
    ) {}

    async createProfile(dto: ProfileDTO, userId: string): Promise<string> {
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

    async getProfile(userId?: string, loggedInUserId? : string): Promise<ProfileDTO> {
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
            const {id, user_id, created_at, updated_at, ...data} = profile
            return data as ProfileDTO;
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
        const {id, user_id, created_at, updated_at, ...data} = loggedInProfile
            return data as ProfileDTO;
        
    }

    async updateProfile(dto: UpdateProfileDTO, userId: string): Promise<string> {
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