import { Module } from '@nestjs/common';

import { UserService }          from '@user/user.service';
import { UserResolver }         from '@user/user.resolver';
import { UserAttributeModule }  from '@user-attribute/user-attribute.module';
import { RolesModule }          from '@roles/roles.module';


@Module({
    providers   : [UserResolver, UserService],
    imports     : [RolesModule, UserAttributeModule]
})
export class UserModule {}
