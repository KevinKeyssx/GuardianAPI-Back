import { ArgsType, Field, Int } from "@nestjs/graphql";

import { IsEnum, IsNumber, IsOptional, IsString, Length, Max, Min } from "class-validator";


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

    // TODO: Agregar otro campo para el nombre del campo ordenado
    @IsOptional()
    @IsString()
    @Length( 1, 100 )
    @Field( () => String, { nullable: true })
    field: string = 'name';

    @IsOptional()
    @IsEnum( [ 'asc', 'desc' ] )
    @Field( () => String, { nullable: true })
    orderBy: 'asc' | 'desc' = 'asc';

}