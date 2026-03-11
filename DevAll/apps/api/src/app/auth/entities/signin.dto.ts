import { IsNotEmpty, MinLength } from "class-validator";

export class SignInDTO {

    @IsNotEmpty()
    identifier!: string;

    @IsNotEmpty()
    @MinLength(8, { message: "Password must be atleast 8 characters long" })
    password!: string
}