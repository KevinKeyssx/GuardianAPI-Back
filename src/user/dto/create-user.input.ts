import { InputType, Field } from '@nestjs/graphql';

import {
    IsEmail,
    IsOptional,
    IsString,
    Length,
    IsUUID,
    IsDate,
}               from 'class-validator';
import { Type } from 'class-transformer';


@InputType()
export class CreateUserInput {

    @Field( () => String )
    @IsEmail()
    @Length( 1, 80 )
    email: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @Length( 3, 30 )
    nickname?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @Length(1, 100)
    name?: string;

    @Field({ nullable: true })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    birthdate?: Date;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    avatar?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsUUID()
    apiUserId?: string;

}
