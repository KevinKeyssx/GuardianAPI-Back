import { InputType, Field } from '@nestjs/graphql';

import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';


@InputType()
export class CreatePermissionInput {

    @IsString()
    @Length( 3, 50 )
    @Field( () => String )
    name: string;

    @IsOptional()
    @IsString()
    @Length( 0, 255 )
    @Field( () => String, { nullable: true })
    description?: string;

    @IsBoolean()
    @Field( () => Boolean )
    isActive: boolean;

}
