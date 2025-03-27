import { Module } from '@nestjs/common';

import { UserRolesService }     from '@user-roles/user-roles.service';
import { UserRolesResolver }    from '@user-roles/user-role.resolver';


@Module({
    providers: [UserRolesResolver, UserRolesService],
})
export class UserRolesModule {}
