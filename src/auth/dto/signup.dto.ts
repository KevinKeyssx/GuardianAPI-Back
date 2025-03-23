import { ApiProperty } from "@nestjs/swagger";
import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Length,
    Matches
} from "class-validator";


export class SignUpDto {

    @ApiProperty({
        example     : 'john_doe@gmail.com',
        description : 'The email of the user',
        minLength   : 10,
        maxLength   : 100,
    })
    @IsNotEmpty()
    @Length( 10, 100 )
    @IsEmail()
    email: string;

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

    @ApiProperty({
        example     : 'admin',
        description : 'The role of the user',
        minLength   : 3,
        maxLength   : 30,
        required    : false
    })
    @IsString()
    @IsOptional()
    @Length( 3, 30 )
    role?: string;

    @ApiProperty({
        example     : '12345678-1234-1234-1234-123456789012',
        description : 'The apiUserId of the user',
        required    : false
    })
    @IsOptional()
    @IsUUID()
    apiUserId?: string;

}
