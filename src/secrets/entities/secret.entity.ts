import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class SecretEntity {

    @Field(() => ID)
    id: string;

    @Field(() => String)
    name: string;

    @Field(() => Date, { nullable: true })
    expiresAt?: Date;

    @Field(() => Date, { nullable: true })
    willExpireAt?: Date;

    @Field(() => Boolean)
    isActive: boolean;

    @Field(() => Date)
    createdAt: Date;

    @Field(() => Date)
    updatedAt: Date;

}
