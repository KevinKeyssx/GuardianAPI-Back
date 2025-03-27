import { Field, ObjectType } from '@nestjs/graphql';

import { UserRole } from '@user-roles/entities/user-role.entity';


@ObjectType()
export class AssignUsersRolesResponse {
    @Field(() => [UserRole], { nullable: true })
    success?: UserRole[];

    @Field(() => [ErrorDetail], { nullable: true })
    errors?: ErrorDetail[];
}

@ObjectType()
export class ErrorDetail {
    @Field({ nullable: true })
    userId?: string;

    @Field({ nullable: true })
    roleId?: string;

    @Field()
    error: string;
}
