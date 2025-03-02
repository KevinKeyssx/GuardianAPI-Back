import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Role } from "./role.entity";

@ObjectType()
export class UserRole {

    @Field(() => ID)
    id: string;

    @Field(() => Boolean)
    isActive: boolean;

    // @Field(() => String)
    // userId: string;

    // @Field(() => User)
    // user: User;

    // @Field(() => String)
    // roleId: string;

    @Field(() => Role)
    role: Role;


}