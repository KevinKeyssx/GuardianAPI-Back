import { InputType, Field } from '@nestjs/graphql';

import { IsDate } from 'class-validator';

import { IsFutureDate } from '@secrets/dto/is-future-date.valid';


@InputType()
export class UpdateSecretInput {

    @IsDate()
    @IsFutureDate()
    @Field( () => Date )
    willExpireAt: Date;

}
