import { Field, ObjectType } from "@nestjs/graphql";

import { UserResponse } from "@user/entities/user-response.";


@ObjectType()
export class ValidateUser {

    @Field( () => Boolean )
    valid: boolean;

    @Field( () => UserResponse, { nullable: true })
    user?: UserResponse;

    @Field( () => String, { nullable: true })
    token?: string;

    @Field( () => String )
    message: string;

    @Field( () => String, { nullable: true })
    errorCode?: string;

}