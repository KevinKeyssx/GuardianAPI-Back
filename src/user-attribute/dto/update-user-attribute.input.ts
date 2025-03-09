import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

import { IsOptional, IsUUID }   from 'class-validator';
import { GraphQLJSON }          from 'graphql-scalars';

import { CreateUserAttributeInput } from '@user-attribute/dto/create-user-attribute.input';


@InputType()
export class UpdateUserAttributeInput extends PartialType( CreateUserAttributeInput ) {

    @IsUUID()
    @Field( () => ID )
    id: string;

    @IsOptional()
    @Field( () => GraphQLJSON, { nullable: true })
    value?: any;

}
