import { ApiProperty } from "@nestjs/swagger";
import {
    IsNotEmpty,
    IsString,
    Length,
    Matches
} from "class-validator";
import { EmailDto } from "./email";


export class SignInDto extends EmailDto {

    @ApiProperty({
        example     : 'aaa123AAA*',
        description : 'The password of the user',
        minLength   : 8,
        maxLength   : 100,
    })
    @IsString()
    @IsNotEmpty()
    @Length( 8, 100 )
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,100}$/, {
        message: 'Password must have at least 8 characters, one uppercase, one lowercase, one number, and one special character.'
    })
    password: string;

}