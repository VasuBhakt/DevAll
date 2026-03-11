import { PartialType } from "@nestjs/mapped-types";
import { AchievementDTO } from "./achievement.dto";

export class UpdateAchievementDTO extends PartialType(AchievementDTO){

}