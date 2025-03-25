import { Module } from '@nestjs/common';
import { RoleUsersService } from './role-users.service';
import { RoleUsersResolver } from './role-users.resolver';

@Module({
  providers: [RoleUsersResolver, RoleUsersService],
})
export class RoleUsersModule {}
