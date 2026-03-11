import { PrismaService } from "@dev-all/database";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ProjectDTO, UpdateProjectDTO } from "./entities";

@Injectable()
export class ProjectService {

    constructor(
        private prisma : PrismaService
    ) {}

    async createProject(dto: ProjectDTO, userId: string): Promise<string> {
        if(!dto.name) {
            throw new HttpException(
                "Project Name is required",
                HttpStatus.BAD_REQUEST
            )
        }
        if(!dto.description) {
            throw new HttpException(
                "Project Description is required",
                HttpStatus.BAD_REQUEST
            )
        }
        if(!dto.tech_stack) {
            throw new HttpException(
                "Tech Stack is required",
                HttpStatus.BAD_REQUEST
            )
        }
        if(!dto.domains) {
            throw new HttpException(
                "Project Domain is required",
                HttpStatus.BAD_REQUEST
            )
        }
        if(!dto.languages) {
            throw new HttpException(
                "Languages is required",
                HttpStatus.BAD_REQUEST
            )
        }
        await this.prisma.client.project.create({
            data: {
                ...dto,
                user_id: userId
            }
        })
        return "Project created successfully!";
    } 

    async getProject(projectId: string): Promise<ProjectDTO> {
        const project = await this.prisma.client.project.findFirst({
            where: {
                id: projectId
            }
        })
        if(!project) {
            throw new HttpException(
                "Project not found",
                HttpStatus.BAD_REQUEST
            )
        }
        const {user_id, created_at, updated_at, ...data} = project;
        return data as ProjectDTO;
    }

    async updateProject(dto: UpdateProjectDTO, projectId : string): Promise<string> {
        await this.prisma.client.project.update({
            where: {
                id: projectId
            },
            data: {
                ...dto
            }
        })
        return "Project Updated successfully!"
    }

    async deleteProject(projectId: string): Promise<string> {
        await this.prisma.client.profile.delete({
            where: {
                id: projectId
            }
        })
        return "Project deleted successfully!"
    }
}