import { InputType, Field, ID } from '@nestjs/graphql';

import { IsDate, IsUUID } from 'class-validator';

@InputType()
export class CreateSecretInput {

    @IsUUID()
    @Field( () => ID )
    userId: string;

    @IsDate()
    @Field( () => Date, { nullable: true } )
    expiresAt?: Date;

}
