import { ObjectType, Field, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class Secret {
    @Field(() => ID)
    id: string;

    @Field(() => String)
    secret: string;

    @Field(() => Date, { nullable: true })
    expiresAt?: Date;

    @Field(() => Boolean)
    isActive: boolean;

    // @Field(() => String)
    // apiUserId: string;

    // @Field(() => User)
    // apiUser: User;

    @Field(() => Date)
    createdAt: Date;

    @Field(() => Date)
    updatedAt: Date;
}
