import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SecretsService } from './secrets.service';
import { Secret } from './entities/secret.entity';
import { CreateSecretInput } from './dto/create-secret.input';
import { UpdateSecretInput } from './dto/update-secret.input';

@Resolver(() => Secret)
export class SecretsResolver {
  constructor(private readonly secretsService: SecretsService) {}

  @Mutation(() => Secret)
  createSecret(@Args('createSecretInput') createSecretInput: CreateSecretInput) {
    return this.secretsService.create(createSecretInput);
  }

  @Query(() => [Secret], { name: 'secrets' })
  findAll() {
    return this.secretsService.findAll();
  }

  @Query(() => Secret, { name: 'secret' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.secretsService.findOne(id);
  }

  @Mutation(() => Secret)
  updateSecret(@Args('updateSecretInput') updateSecretInput: UpdateSecretInput) {
    return this.secretsService.update(updateSecretInput.id, updateSecretInput);
  }

  @Mutation(() => Secret)
  removeSecret(@Args('id', { type: () => Int }) id: number) {
    return this.secretsService.remove(id);
  }
}
