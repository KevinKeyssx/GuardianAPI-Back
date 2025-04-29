import { ApiProperty } from "@nestjs/swagger";

import { IsEmail, IsNotEmpty, Length } from "class-validator";

export class EmailDto {

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

}