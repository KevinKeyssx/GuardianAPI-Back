import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    Length
} from "class-validator";


export class SignUpDto {

    @IsNotEmpty()
    @Length( 10, 100 )
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    @Length( 8, 100 )
    password: string;

    @IsOptional()
    @IsString()
    @Length( 3, 30 )
    role?: string;

}
