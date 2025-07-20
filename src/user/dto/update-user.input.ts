import { Field, ID, InputType, PartialType } from '@nestjs/graphql';

import { IsEmail, IsOptional, IsUUID, Length } from 'class-validator';

import { BaseUserInput } from '@user/dto/base-user.input';


@InputType()
export class UpdateUserInput extends PartialType( BaseUserInput ) {

    @Field( () => ID )
    @IsUUID()
    id: string;

    @Field( () => String, { nullable: true } )
    @IsEmail()
    @IsOptional()
    @Length( 1, 80 )
    email?: string;

}
