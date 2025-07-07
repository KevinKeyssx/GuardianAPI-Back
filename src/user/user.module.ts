import { Module } from '@nestjs/common';

import { FileManagerService }   from '@common/services/filemanager/upload-file.service';
import { UserService }          from '@user/user.service';
import { UserResolver }         from '@user/user.resolver';
import { UserAttributeModule }  from '@user-attribute/user-attribute.module';
import { RolesModule }          from '@roles/roles.module';


@Module({
    providers   : [UserResolver, UserService, FileManagerService],
    imports     : [RolesModule, UserAttributeModule]
})
export class UserModule {}
