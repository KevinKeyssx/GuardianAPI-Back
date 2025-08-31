import { InputType, Field, PartialType } from '@nestjs/graphql';

import { IsUUID } from 'class-validator';

import { CreateSecretInput } from './create-secret.input';


@InputType()
export class UpdateSecretInput extends PartialType( CreateSecretInput ) {

    @IsUUID()
    @Field( () => String )
    id: string;

}
