import { ObjectType, Field, ID } from '@nestjs/graphql';


@ObjectType()
export class Role {

    @Field( () => ID )
    id: string;

    @Field()
    name: string;

    @Field(() => String, { nullable: true })
    description?: string;

    @Field(() => String , { nullable: true })
    userId: string;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;

}