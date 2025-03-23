import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class PwdAdmin {
    @Field( () => ID )
    id: string;

    @Field( () => Date, { nullable: true })
    willExpireAt?: Date;

    @Field( () => Boolean )
    isActive: boolean;

    @Field( () => Boolean )
    isGuardian: boolean;

    @Field( () => Int, {  nullable: true })
    alertDay?: number;

    @Field( () => Int, { nullable: true })
    howOften?: number;

    @Field(() => Date)
    createdAt: Date;

    @Field(() => Date)
    updatedAt: Date;

}
