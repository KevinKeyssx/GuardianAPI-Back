import { Field, ID, InputType } from "@nestjs/graphql";

import { IsArray, IsUUID } from "class-validator";


@InputType()
export class AsignUsersRolesInput {

    @IsUUID( undefined, { each: true })
    @IsArray()
    @Field( () => [ID] )
    userIds: string[];

    @IsUUID( undefined, { each: true })
    @IsArray()
    @Field( () => [ID] )
    roleIds: string[];

}
