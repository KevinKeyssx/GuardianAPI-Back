import { InputType, Field, ID } from '@nestjs/graphql';

import { IsOptional, IsUUID }   from 'class-validator';
import { GraphQLJSON }          from 'graphql-scalars';


@InputType()
export class UpdateValueUserAttributeInput {

    @IsUUID()
    @Field( () => ID )
    id: string;

    @IsOptional()
    @Field( () => GraphQLJSON, { nullable: true })
    value?: any;

}
