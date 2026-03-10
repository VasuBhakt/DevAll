import { createProfileDTO } from "./createProfileDTO";
import { PartialType } from "@nestjs/mapped-types";

export class updateProfileDTO extends PartialType(createProfileDTO) {
    
}