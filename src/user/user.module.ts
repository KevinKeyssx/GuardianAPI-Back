import { Module } from '@nestjs/common';

import { UserService }  from '@user/user.service';
import { UserResolver } from '@user/user.resolver';
import { RolesModule }  from '@roles/roles.module';


@Module({
    providers   : [UserResolver, UserService],
    imports     : [RolesModule]
})
export class UserModule {}
