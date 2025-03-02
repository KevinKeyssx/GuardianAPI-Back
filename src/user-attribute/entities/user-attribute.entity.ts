import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class UserAttribute {
    @Field(() => String)
    key: string;

    @Field(() => String)
    value: string;
}