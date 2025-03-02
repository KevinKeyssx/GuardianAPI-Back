import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

import { IsUUID } from 'class-validator';

import { CreateRoleInput } from '@roles/dto/create-role.input';


@InputType()
export class UpdateRoleInput extends PartialType(CreateRoleInput) {

    @IsUUID()
    @Field( () => ID )
    id: string;

}
