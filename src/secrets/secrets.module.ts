import { Module } from '@nestjs/common';
import { SecretsService } from './secrets.service';
import { SecretsResolver } from './secrets.resolver';

@Module({
  providers: [SecretsResolver, SecretsService],
})
export class SecretsModule {}
