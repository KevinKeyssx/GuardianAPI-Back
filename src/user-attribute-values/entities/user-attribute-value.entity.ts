import { ObjectType, Field, ID } from '@nestjs/graphql';

import { GraphQLJSON } from 'graphql-scalars';

import { UserAttribute }    from '@user-attribute/entities/user-attribute.entity';
import { User }             from '@user/entities/user.entity';


@ObjectType()
export class UserAttributeValue {

    @Field(() => ID, { description: 'Id of the user attribute value' })
    id: string;

    @Field(() => User, { description: 'User of the user attribute value' })
    user: User;

    @Field(() => UserAttribute, { description: 'User attribute of the user attribute value' })
    userAttribute: UserAttribute;

    @Field(() => GraphQLJSON, { description: 'Value of the user attribute value' })
    value: any;

    @Field(() => Date, { description: 'Created at of the user attribute value' })
    createdAt: Date;

    @Field(() => Date, { description: 'Updated at of the user attribute value' })
    updatedAt: Date;

}
