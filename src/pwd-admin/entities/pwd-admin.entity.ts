import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class PwdAdmin {
    @Field( () => ID )
    id: string;

    @Field(() => String)
    passwordHash: string;

    @Field(() => Date, { nullable: true })
    expiresAt?: Date;

    @Field(() => Boolean)
    isActive: boolean;

    @Field(() => Date, { nullable: true })
    lastUsedAt?: Date;

    @Field(() => Boolean)
    mustChange: boolean;

    // @Field(() => String)
    // userId: string;

    // @Field(() => User)
    // user: User;

    @Field(() => Date)
    createdAt: Date;
}
