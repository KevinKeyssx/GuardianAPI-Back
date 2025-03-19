import { InputType, Field } from '@nestjs/graphql';

import { IsDate, IsOptional } from 'class-validator';

@InputType()
export class CreateSecretInput {

    @IsDate()
    @IsOptional()
    @Field( () => Date, { nullable: true } )
    expiresAt?: Date;

}
