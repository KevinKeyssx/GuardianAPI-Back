import { Module } from '@nestjs/common';

import { PermissionsService }   from '@permissions/permissions.service';
import { PermissionsResolver }  from '@permissions/permissions.resolver';


@Module({
    providers: [PermissionsResolver, PermissionsService],
})
export class PermissionsModule {}
