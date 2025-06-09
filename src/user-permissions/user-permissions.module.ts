import { Module } from '@nestjs/common';
import { UserPermissionsService } from './user-permissions.service';
import { UserPermissionsResolver } from './user-permissions.resolver';

@Module({
  providers: [UserPermissionsResolver, UserPermissionsService],
})
export class UserPermissionsModule {}
