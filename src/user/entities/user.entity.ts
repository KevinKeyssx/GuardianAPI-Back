import { ObjectType, Field } from '@nestjs/graphql';

import { UserAttribute }    from './user-attribute.entity';
import { Role }             from './role.entity';


@ObjectType()
export class User {

    @Field(() => String)
    id: string;

    @Field()
    email: string;

    @Field(() => String, { nullable: true })
    name?: string;

    @Field()
    isDeleted: boolean;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;

    @Field(() => [Role], { nullable: true })
    roles?: Role[];

    @Field(() => [UserAttribute], { nullable: true })
    attributes?: UserAttribute[];

}