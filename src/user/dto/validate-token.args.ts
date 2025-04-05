import { ArgsType, Field } from "@nestjs/graphql";

import { IsBoolean, IsOptional, IsString, Matches } from "class-validator";


@ArgsType()
export class ValidateTokenArgs {

    @IsString()
    @Matches(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/, {
        message: 'Token must be a valid JWT format (header.payload.signature)',
    })
    @Field( () => String )
    token: string;

    @IsOptional()
    @IsBoolean()
    @Field( () => Boolean, { nullable: true })
    refresh: boolean = false;

}