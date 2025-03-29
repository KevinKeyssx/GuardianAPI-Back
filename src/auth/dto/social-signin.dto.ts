import { ApiProperty } from "@nestjs/swagger";
import { PartialType } from "@nestjs/mapped-types";

import { IsEnum, IsNotEmpty, IsString, Length } from "class-validator";

import { SocialSigninProvider } from "@auth/enums/social-signin.enum";
import { BasicSignUpDto }       from "@auth/dto/basic-signup.dto";


export class SocialSigninDto extends PartialType( BasicSignUpDto ) {

    @ApiProperty({
        example     : SocialSigninProvider.GOOGLE,
        description : 'The provider of the user',
        enum        : SocialSigninProvider,
    })
    @IsString()
    @IsNotEmpty()
    @IsEnum( SocialSigninProvider )
    provider: SocialSigninProvider;

    @ApiProperty({
        example     : '1234567890',
        description : 'The access token of the user',
        minLength   : 1,
        maxLength   : 255,
    })
    @IsString()
    @IsNotEmpty()
    @Length( 1, 255 )
    accessToken: string;

}