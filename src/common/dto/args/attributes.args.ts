import { ArgsType, Field } from "@nestjs/graphql";

import {
    IsArray,
    IsOptional,
    IsString,
    Length,
} from "class-validator";


@ArgsType()
export class AttributesArgs {

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Length( 1, 100, { each: true })
    @Field(() => [String], { nullable: true })
    keys?: string[];

}
