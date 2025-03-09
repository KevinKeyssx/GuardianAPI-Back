import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';

import { SecretsService }           from '@secrets/secrets.service';
import { SecretEntity }             from '@secrets/entities/secret.entity';
import { CreateSecretInput }        from '@secrets/dto/create-secret.input';
import { UpdateSecretInput }        from '@secrets/dto/update-secret.input';
import { GenerateSecretResponse }   from '@secrets/entities/secret-response.entity';


@Resolver( () => SecretEntity )
export class SecretsResolver {
    constructor(
        private readonly secretsService: SecretsService
    ) {}


    @Mutation( () => GenerateSecretResponse,{  name: 'generateSecret' } )
    generateSecret(
        @Args( 'createSecretInput' ) createSecretInput: CreateSecretInput
    ) {
        return this.secretsService.create( createSecretInput );
    }


    @Query(() => SecretEntity, { name: 'secret' })
    findOne(
        @Args('id', { type: () => ID }) id: string
    ) {
        return this.secretsService.findOne( id );
    }


    @Mutation( () => SecretEntity )
    updateSecret(
        @Args( 'updateSecretInput' ) updateSecretInput: UpdateSecretInput
    ) {
        return this.secretsService.update( updateSecretInput );
    }


    @Mutation(() => SecretEntity)
    removeSecret(
        @Args('id', { type: () => ID }) id: string
    ) {
        return this.secretsService.remove( id );
    }
}
