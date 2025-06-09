import { ObjectType, Field, ID } from '@nestjs/graphql';

import { User }         from '@user/entities/user.entity';
import { Permission }   from '@permissions/entity/permission.entity';


@ObjectType()
export class UserPermission {

    @Field(() => ID, { description: 'Unique identifier for the user-permission link' })
    id: string;

    @Field(() => User, { description: 'The user who has the permission' })
    user: User;

    @Field(() => Permission, { description: 'The permission granted to the user' })
    permission: Permission;

}
