import { ObjectType, Field } from '@nestjs/graphql';

import { GraphQLJSON  } from 'graphql-scalars';


@ObjectType()
export class ValueAttribute {

    @Field( () => GraphQLJSON, { nullable: true })
    value?: any;

}