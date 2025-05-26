import { InputType, Field, ID } from '@nestjs/graphql';

import { IsOptional, IsUUID }   from 'class-validator';
import { GraphQLJSON  }         from 'graphql-scalars';


@InputType()
export class CreateUserAttributeValueInput {

    @IsOptional()
    @Field(() => GraphQLJSON, { nullable: true })
    value?: any;

    @IsUUID()
    @Field( () => ID )
    userId: string;

    @IsUUID()
    @Field( () => ID )
    userAttributeId: string;

}
