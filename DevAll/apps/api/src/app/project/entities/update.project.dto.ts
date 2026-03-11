import { PartialType } from "@nestjs/mapped-types";
import { ProjectDTO } from "./project.dto";

export class UpdateProjectDTO extends PartialType(ProjectDTO) {

}