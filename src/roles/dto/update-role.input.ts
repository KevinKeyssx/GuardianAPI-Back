import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

import { CreateRoleInput } from '@roles/dto/create-role.input';


@InputType()
export class UpdateRoleInput extends PartialType( CreateRoleInput ) {

    @IsUUID()
    @Field( () => ID )
    id: string;

    @IsOptional()
    @IsBoolean()
    @Field( () => Boolean, { nullable: true } )
    isActive?: boolean;

}
