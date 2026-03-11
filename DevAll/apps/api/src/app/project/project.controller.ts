import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from "@nestjs/common";
import { ProjectService } from "./project.service";
import { ProjectDTO, UpdateProjectDTO } from "./entities";
import { APIResponse, GetCurrentUserId, Public } from "@dev-all/helpers";

@Controller('project')
export class ProjectController {
    constructor(
        private projectService: ProjectService
    ) {}

    @Post('create')
    @HttpCode(HttpStatus.OK)
    async createProject(
        @Body() project: ProjectDTO,
        @GetCurrentUserId() userId: string
    ): Promise<APIResponse> {
        const response = await this.projectService.createProject(project, userId)
        return new APIResponse(
            HttpStatus.OK,
            response,
            {}
        )
    }

    @Public()
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getProject(
        @Param('id') projectId : string,
    ): Promise<APIResponse> {
        const response = await this.projectService.getProject(projectId)
        return new APIResponse(
            HttpStatus.OK,
            "Project fetched successfully",
            response
        )
    }

    @Patch('update/:id')
    @HttpCode(HttpStatus.OK)
    async updateProject(
        @Body() dto: UpdateProjectDTO,
        @Param('id') projectId: string
    ) :Promise<APIResponse> {
        const response = await this.projectService.updateProject(dto, projectId);
        return new APIResponse(
            HttpStatus.OK,
            response,
            {}
        )
    }

    @Delete('delete')
    @HttpCode(HttpStatus.OK)
    async deleteProject(
        @GetCurrentUserId() projectId: string
    ): Promise<APIResponse> {
        const response = await this.projectService.deleteProject(projectId);
        return new APIResponse(
            HttpStatus.OK,
            response,
            {}
        )
    }
}