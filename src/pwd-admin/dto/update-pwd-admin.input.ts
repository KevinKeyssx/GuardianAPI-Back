import { InputType, Field, ID, Int } from '@nestjs/graphql';

import {
    IsBoolean,
    IsDate,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    IsUUID,
    Length,
    Matches
}               from 'class-validator';
import { Type } from 'class-transformer';


@InputType()
export class UpdatePwdAdminInput {

    @IsUUID()
    @Field( () => ID )
    id: string;

    // @IsOptional()
    // @IsString()
    // @Length( 1, 255 )
    // @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/, {
    //     message: 'Password must have at least 10 characters, one uppercase, one lowercase, one number, and one special character.'
    // })
    // @Field( () => String, { nullable: true })
    // password?: string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Field( () => Int, {  nullable: true })
    alertDay: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Field( () => Int, { nullable: true })
    howOften?: number;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    @Field( () => Date, { nullable: true })
    changeLastAt?: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    @Field( () => Date, { nullable: true })
    expiresAt?: Date;

    @IsOptional()
    @IsBoolean()
    @Field( () => Boolean, { nullable: true })
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    @Field( () => Boolean, { nullable: true })
    mustChange?: boolean;

}
