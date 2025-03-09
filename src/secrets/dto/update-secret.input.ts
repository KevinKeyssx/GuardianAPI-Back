import { InputType, Field, ID } from '@nestjs/graphql';

import { IsDate, IsUUID } from 'class-validator';

@InputType()
export class UpdateSecretInput {

    @IsUUID()
    @Field( () => ID )
    id: string;

    @IsDate()
    @Field( () => Date )
    expiresAt: Date;

}
