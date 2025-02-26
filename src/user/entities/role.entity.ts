import { ObjectType, Field } from '@nestjs/graphql';
import { User } from './user.entity';

@ObjectType()
export class Role {
    @Field(() => String)
    id: string;

    @Field()
    name: string;

    @Field(() => String, { nullable: true })
    description?: string;

    @Field(() => [User], { nullable: true })
    users?: User[];

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}