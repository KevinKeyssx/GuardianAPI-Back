import { UseGuards }                        from '@nestjs/common';
import { Resolver, Query, Mutation, Args }  from '@nestjs/graphql';

import { SecretAuthGuard }          from '@auth/guards/jwt-auth.guard';
import { SecretsService }           from '@secrets/secrets.service';
import { SecretEntity }             from '@secrets/entities/secret.entity';
import { CreateSecretInput }        from '@secrets/dto/create-secret.input';
import { GenerateSecretResponse }   from '@secrets/entities/secret-response.entity';
import { CurrentUser }              from '@auth/decorators/current-user.decorator';
import { User }                     from '@user/entities/user.entity';


@UseGuards( SecretAuthGuard( false ))
@Resolver( () => SecretEntity )
export class SecretsResolver {
    constructor(
        private readonly secretsService: SecretsService
    ) {}


    @Mutation( () => GenerateSecretResponse,{  name: 'generateSecret' })
    generateSecret(
        @CurrentUser() user: User,
        @Args( 'createSecretInput' ) createSecretInput: CreateSecretInput
    ) {
        return this.secretsService.create( user, createSecretInput );
    }


    @Query(() => SecretEntity, { name: 'secret' })
    findOne(
        @CurrentUser() user: User,
    ) {
        return this.secretsService.findOne( user );
    }


    @Mutation(() => SecretEntity)
    removeSecret(
        @CurrentUser() user: User,
    ) {
        return this.secretsService.remove( user );
    }
}
