import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

import { IsOptional, IsBoolean, IsUUID } from 'class-validator';

import { CreatePermissionInput } from '@permissions/dto/create-permission.input';


@InputType()
export class UpdatePermissionInput extends PartialType( CreatePermissionInput ) {

    @IsUUID()
    @Field( () => ID )
    id: string;

    @IsOptional()
    @IsBoolean()
    @Field( () => Boolean, { nullable: true })
    isActive?: boolean;

}
