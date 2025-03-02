import { Module } from '@nestjs/common';
import { UserAttributeService } from './user-attribute.service';
import { UserAttributeResolver } from './user-attribute.resolver';

@Module({
  providers: [UserAttributeResolver, UserAttributeService],
})
export class UserAttributeModule {}
