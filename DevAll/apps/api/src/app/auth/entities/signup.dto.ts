import { IsEmail, IsNotEmpty, MinLength } from "class-validator"

export class SignUpDTO {
    @IsEmail({}, { message: "Please enter a valid email address" })
    @IsNotEmpty({})
    email!: string

    @IsNotEmpty({})
    username!: string

    @IsNotEmpty({})
    @MinLength(8, { message: "Password must be atleast 8 characters long" })
    password!: string

}