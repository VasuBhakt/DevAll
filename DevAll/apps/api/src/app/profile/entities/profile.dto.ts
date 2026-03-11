import { IsNotEmpty, IsOptional } from "class-validator";

export class ProfileDTO {
    @IsNotEmpty()
    name!: string;

    @IsOptional()
    bio?: string

    @IsOptional()
    institute?: string

    @IsOptional()
    organization?: string

    @IsOptional()
    city?: string

    @IsOptional()
    country?: string

    @IsOptional()
    portfolio_website?: string

    @IsOptional()
    linkedin?: string

    @IsOptional()
    github?: string

    @IsOptional()
    xtwitter?: string

    @IsOptional()
    instagram?: string

    @IsOptional()
    reddit?: string

    @IsOptional()
    twitch?: string

    @IsOptional()
    youtube?: string

    @IsOptional()
    discord?: string

}