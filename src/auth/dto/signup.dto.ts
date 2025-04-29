import { ApiProperty } from "@nestjs/swagger";
import {
    IsOptional,
    IsString,
    IsUUID,
    Length,
    Matches,
} from "class-validator";
import { EmailDto } from "./email";


export class SignUpDto extends EmailDto {

    @ApiProperty({
        example     : 'aaa123AAA*',
        description : 'The password of the user',
        minLength   : 8,
        maxLength   : 100,
    })
    @IsString()
    @IsOptional()
    @Length( 8, 100 )
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,100}$/, {
        message: 'Password must have at least 8 characters, one uppercase, one lowercase, one number, and one special character.'
    })
    password?: string;

    @ApiProperty({
        example     : '12345678-1234-1234-1234-123456789012',
        description : 'The apiUserId of the user',
        required    : false
    })
    @IsOptional()
    @IsUUID()
    apiUserId?: string;

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
        example     : '@JohnDoe',
        description : 'The nickname of the user',
        required    : false
    })
    @IsOptional()
    @IsString()
    @Length( 1, 100 )
    nickname?: string;

    @ApiProperty({
        example     : 'https://example.com/12345678-1234-1234-1234-123456789012.png',
        description : 'The avatar of the user',
        required    : false
    })
    @IsOptional()
    @IsString()
    @Length( 1, 255 )
    avatar?: string;

    @ApiProperty({
        example     : 'John Doe',
        description : 'The name of the user',
        required    : false
    })
    @IsOptional()
    @IsString()
    @Length( 1, 100 )
    name?: string;

}
