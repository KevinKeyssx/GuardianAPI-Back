import { InputType, Field } from '@nestjs/graphql';

import { IsDate, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateSecretInput {

    @IsString()
    @Field( () => String )
    name: string;

    @IsDate()
    @IsOptional()
    @Field( () => Date, { nullable: true } )
    willExpireAt?: Date;

}
