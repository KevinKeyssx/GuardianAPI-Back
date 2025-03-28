import { InputType, Field } from '@nestjs/graphql';

import { IsDate } from 'class-validator';


@InputType()
export class UpdateSecretInput {

    @IsDate()
    @Field( () => Date )
    expiresAt: Date;

}
