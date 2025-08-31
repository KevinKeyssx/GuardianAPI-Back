import { InputType, Field } from '@nestjs/graphql';

import { IsDate, IsOptional, IsString } from 'class-validator';

import { IsFutureDate } from '@secrets/dto/is-future-date.valid';


@InputType()
export class CreateSecretInput {

    @IsString()
    @Field( () => String )
    name: string;

    @IsDate()
    @IsOptional()
    @IsFutureDate()
    @Field( () => Date, { nullable: true } )
    willExpireAt?: Date;

}
