import { ObjectType, Field } from '@nestjs/graphql';

import { SecretEntity } from './secret.entity';


@ObjectType()
export class GenerateSecretResponse {

    @Field(() => String)
    secret: string;

    @Field(() => SecretEntity)
    secretData: SecretEntity;
}
