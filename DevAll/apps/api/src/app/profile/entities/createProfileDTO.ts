import { IsNotEmpty } from "class-validator";

export class createProfileDTO {
    @IsNotEmpty()
    name: string;

    constructor(
        name:string,
        public bio: string | undefined,
        public institute : string | undefined,
        public organization: string | undefined,
        public city : string | undefined,
        public country: string | undefined,
        public portfolio_website: string | undefined,
        public linkedin : string | undefined,
        public github : string | undefined,
        public xtwitter : string | undefined,
        public instagram : string | undefined,
        public reddit : string | undefined,
        public twitch : string | undefined,
        public youtube : string | undefined,
        public discord : string | undefined,
    ) {
        this.name = name
    }
}