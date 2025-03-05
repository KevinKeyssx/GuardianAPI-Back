import { Field, ID, ObjectType } from "@nestjs/graphql";

import { User } from "@user/entities/user.entity";
import { Role } from "@roles/entities/role.entity";


@ObjectType()
export class UserRole {

    @Field( () => ID )
    id: string;

    @Field( () => Boolean )
    isActive: boolean;

    @Field( () => User )
    user: User;

    @Field( () => Role )
    role: Role;

}