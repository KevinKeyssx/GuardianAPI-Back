import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsString, IsUUID, Length } from 'class-validator';


@InputType()
export class CreateRoleInput {

    @IsString()
    @Length( 3, 50 )
    @Field( () => String )
    name: string;

    @IsOptional()
    @IsString()
    @Length( 0, 255 )
    @Field( () => String, { nullable: true })
    description?: string;

    @IsOptional()
    @IsUUID()
    @Field( () => String, { nullable: true })
    userId?: string;

}
