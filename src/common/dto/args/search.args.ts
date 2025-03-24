import { ArgsType, Field } from "@nestjs/graphql";

import { IsOptional, IsString, Length } from "class-validator";


@ArgsType()
export class SearchArgs {

    @IsOptional()
    @IsString()
    @Length( 1, 100 )
    @Field(() => String, { nullable: true })
    search?: string;

}