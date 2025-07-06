import { Field, ID, InputType } from '@nestjs/graphql';

import {
    IsBoolean,
    IsDate,
    IsEmail,
    IsOptional,
    IsString,
    IsUUID,
    Length
}               from 'class-validator';
import { Type } from 'class-transformer';


@InputType()
export class CreateUserInput {

    @Field( () => String )
    @IsEmail()
    @Length( 1, 80 )
    email: string;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    @Length( 3, 30 )
    nickname?: string;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    @Length(1, 100)
    name?: string;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    phone?: string;

    @Field(() => Date, { nullable: true })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    birthdate?: Date;

    @Field(() => ID, { nullable: true })
    @IsOptional()
    @IsUUID()
    apiUserId?: string;

    @Field(() => Boolean, { nullable: true })
    @IsOptional()
    @IsBoolean()
    isActive: boolean = true;

    @Field(() => Boolean, { nullable: true })
    @IsOptional()
    @IsBoolean()
    isVerified: boolean = false;

}
