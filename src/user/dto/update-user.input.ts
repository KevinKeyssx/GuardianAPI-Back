import { Field, ID, InputType } from '@nestjs/graphql';

import { IsDate, IsEmail, IsOptional, IsString, IsUUID, Length } from 'class-validator';

import { Type } from 'class-transformer';


@InputType()
export class UpdateUserInput {

    @Field( () => ID )
    @IsUUID()
    id: string;

    @Field( () => String, { nullable: true })
    @IsEmail()
    @Length( 1, 80 )
    @IsOptional()
    email?: string;

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

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    avatar?: string;

    @Field( () => String, { nullable: true })
    @IsOptional()
    @IsString()
    googleId?: string;

    @Field( () => String, { nullable: true })
    @IsOptional()
    @IsString()
    microsoftId?: string;

    @Field( () => String, { nullable: true })
    @IsOptional()
    @IsString()
    facebookId?: string;

    @Field( () => String, { nullable: true })
    @IsOptional()
    @IsString()
    githubId?: string;

    @Field( () => String, { nullable: true })
    @IsOptional()
    @IsString()
    appleId?: string;

    @Field( () => String, { nullable: true })
    @IsOptional()
    @IsString()
    otherId?: string;

    @Field(() => Boolean, { nullable: true })
    @IsOptional()
    isActive?: boolean;

}
