import { ProfileDTO } from "./profile.dto";
import { PartialType } from "@nestjs/mapped-types";

export class UpdateProfileDTO extends PartialType(ProfileDTO) {
    
}