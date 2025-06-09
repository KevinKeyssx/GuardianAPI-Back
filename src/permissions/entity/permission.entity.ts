import { ObjectType, Field, ID } from '@nestjs/graphql';


@ObjectType()
export class Permission {

    @Field( () => ID )
    id: string;

    @Field()
    name: string;

    @Field(() => String, { nullable: true })
    description?: string;

    @Field(() => Boolean, { nullable: true })
    isActive?: boolean;

    @Field(() => String , { nullable: true })
    userId: string;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;

}