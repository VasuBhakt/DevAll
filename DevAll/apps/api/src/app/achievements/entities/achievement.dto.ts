import { IsNotEmpty, IsOptional } from "class-validator";

export class AchievementDTO {
    @IsNotEmpty()
    title! : string;

    @IsOptional()
    description? : string;

    @IsOptional()
    certificate_link? : string;

    @IsOptional()
    organization? : string;

    @IsOptional()
    event? : string;

    @IsOptional()
    event_link? : string;
}