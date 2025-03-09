import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class PwdAdmin {
    @Field( () => ID )
    id: string;

    @Field(() => Date, { nullable: true })
    expiresAt?: Date;

    @Field(() => Boolean)
    isActive: boolean;

    @Field(() => Boolean)
    mustChange: boolean;

    @Field( () => Int, {  nullable: true })
    alertDay: number;

    @Field( () => Int, { nullable: true })
    howOften?: number;

    @Field( () => Date, { nullable: true })
    changeLastAt?: Date;

    @Field(() => Date)
    createdAt: Date;

    @Field(() => Date)
    updatedAt: Date;

}
