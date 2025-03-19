import { InputType, Field } from '@nestjs/graphql';

import { IsDate } from 'class-validator';

@InputType()
export class CreateSecretInput {

    @IsDate()
    @Field( () => Date, { nullable: true } )
    expiresAt?: Date;

}
