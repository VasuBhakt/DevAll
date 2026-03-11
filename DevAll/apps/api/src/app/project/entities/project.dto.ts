import { IsNotEmpty } from "class-validator";

export class ProjectDTO {

    @IsNotEmpty()
    name! : string;

    @IsNotEmpty()
    description! : string;

    @IsNotEmpty()
    tech_stack! : string[]

    @IsNotEmpty()
    domains! : string[]

    @IsNotEmpty()
    languages! : string[]

    github_link? : string;
    
    project_link? : string;
}