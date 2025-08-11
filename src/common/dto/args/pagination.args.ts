import { ArgsType, Field, Int } from "@nestjs/graphql";

import { IsEnum, IsNumber, IsOptional, Max, Min } from "class-validator";


@ArgsType()
export class PaginationArgs {

    @IsOptional()
    @IsNumber()
    @Min( 0 )
    @Max( 1000 )
    @Field( () => Int, { nullable: true })
    page: number = 0;

    @IsOptional()
    @IsNumber()
    @Min( 1 )
    @Max( 5000 )
    @Field( () => Int, { nullable: true })
    each: number = 10;

    @IsOptional()
    @IsEnum( [ 'asc', 'desc' ] )
    @Field( () => String, { nullable: true })
    orderBy: 'asc' | 'desc' = 'asc';

}
