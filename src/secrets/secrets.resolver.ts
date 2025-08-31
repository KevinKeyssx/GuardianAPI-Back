import { ParseUUIDPipe, UseGuards }             from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ID }  from '@nestjs/graphql';

import { SecretAuthGuard }          from '@auth/guards/jwt-auth.guard';
import { CurrentUser }              from '@auth/decorators/current-user.decorator';
import { SecretsService }           from '@secrets/secrets.service';
import { SecretEntity }             from '@secrets/entities/secret.entity';
import { CreateSecretInput }        from '@secrets/dto/create-secret.input';
import { GenerateSecretResponse }   from '@secrets/entities/secret-response.entity';
import { UpdateSecretInput }        from '@secrets/dto/update-secret.input';
import { User }                     from '@user/entities/user.entity';


@UseGuards( SecretAuthGuard( false ))
@Resolver( () => SecretEntity )
export class SecretsResolver {

    constructor(
        private readonly secretsService: SecretsService
    ) {}


    @Mutation( () => GenerateSecretResponse, {  name: 'generateSecret' })
    generateSecret(
        @CurrentUser() user: User,
        @Args( 'createSecretInput' ) createSecretInput: CreateSecretInput
    ) {
        return this.secretsService.create( user, createSecretInput );
    }


    @Mutation( () => SecretEntity, {  name: 'expiresAtSecret' })
    updateSecret(
        @CurrentUser() user: User,
        @Args( 'updateSecretInput' ) updateSecretInput: UpdateSecretInput
    ) {
        return this.secretsService.updateExpiresAt( user, updateSecretInput );
    }


    @Query(() => [SecretEntity], { name: 'secret' })
    findAll(
        @CurrentUser() user: User,
    ) {
        return this.secretsService.findAll( user );
    }


    @Mutation(() => Boolean, { name: 'removeSecret' })
    async removeSecret(
        @CurrentUser() user: User,
        @Args( 'id', { type: () => ID }, ParseUUIDPipe ) id: string,
    ): Promise<boolean> {
        return await this.secretsService.remove( user, id );
    }

}
