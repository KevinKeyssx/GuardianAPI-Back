import { Field, InputType } from '@nestjs/graphql';

import { IsEmail, Length } from 'class-validator';

import { BaseUserInput } from '@user/dto/base-user.input';


@InputType()
export class CreateUserInput extends BaseUserInput {

    @Field( () => String )
    @IsEmail()
    @Length( 1, 80 )
    email: string;

}
