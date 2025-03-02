import { Module } from '@nestjs/common';
import { PwdAdminService } from './pwd-admin.service';
import { PwdAdminResolver } from './pwd-admin.resolver';

@Module({
  providers: [PwdAdminResolver, PwdAdminService],
})
export class PwdAdminModule {}
